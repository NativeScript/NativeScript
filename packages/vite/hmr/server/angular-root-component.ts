import path from 'path';

/**
 * Identifies the Angular **bootstrap (root) component** of a project from
 * its dev-server entry module, and provides helpers to match Analog's
 * `angular:component-update` events against it.
 *
 * Why this exists
 * ---------------
 * NativeScript's root Angular component hosts the navigation `Frame` (via
 * `<page-router-outlet>`). Analog's in-place template HMR
 * (`ɵɵreplaceMetadata`) recreates the matching `LView`s for the edited
 * component WITHOUT re-running router navigation. For a normal child
 * component that's exactly right — its view re-renders inside an intact
 * page. For the ROOT component it's fatal: replacing the root metadata
 * tears down the `PageRouterOutlet`'s `Frame` and nothing re-navigates,
 * leaving a permanent blank/white screen that no further in-place update
 * can recover.
 *
 * The reboot path (`ns:angular-update` → `__reboot_ng_modules__`) DOES
 * recover the root view (it re-bootstraps and replays route state). So the
 * fix is to route every root-component edit through the reboot path and
 * suppress the destructive in-place update for it. Both halves need to know
 * which file is the root component — that's what this module resolves.
 *
 * Resolution is intentionally dependency-free string/path math so it can be
 * unit-tested without a Vite server or filesystem. It targets the modern
 * standalone bootstrap shape (`bootstrapApplication(AppComponent, …)`),
 * which is what `main.ts` uses; it degrades gracefully to `null` for shapes
 * it can't statically resolve (e.g. NgModule `bootstrap: [...]`), in which
 * case callers keep their existing behavior.
 */

export interface BootstrapRootComponent {
	/**
	 * Extensionless, project-relative POSIX path with a leading slash —
	 * e.g. `/src/app/app.component`. Comparisons are always extensionless so
	 * a `.html` template edit and its `.ts` component resolve to the same key.
	 */
	moduleRel: string;
	/**
	 * The class name passed to `bootstrapApplication(...)` (best-effort,
	 * resolved back to the imported binding name when aliased). Used as a
	 * secondary match signal for Analog ids whose path base differs from the
	 * project root.
	 */
	className: string;
}

const BOOTSTRAP_APPLICATION_RE = /\bbootstrapApplication\s*\(\s*([A-Za-z_$][\w$]*)/;
const IMPORT_STATEMENT_RE = /import\s+([^;'"]+?)\s+from\s+['"]([^'"]+)['"]/g;
const SOURCE_EXTENSION_RE = /\.(?:tsx?|jsx?|mjs|cjs|html?|css|scss|sass|less)$/i;

/**
 * Maps an ESM import clause's local binding names to the specifier and the
 * originally-imported name. Handles default, namespace, and named (with
 * `as` aliasing) imports — enough to trace `bootstrapApplication(X)` back to
 * the module that declares `X`.
 */
interface ImportBinding {
	specifier: string;
	importedName: string;
}

function scanImportBindings(source: string): Map<string, ImportBinding> {
	const bindings = new Map<string, ImportBinding>();
	IMPORT_STATEMENT_RE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = IMPORT_STATEMENT_RE.exec(source)) !== null) {
		const clause = match[1].trim();
		const specifier = match[2];
		recordClauseBindings(clause, specifier, bindings);
	}
	return bindings;
}

function recordClauseBindings(clause: string, specifier: string, out: Map<string, ImportBinding>): void {
	const namedStart = clause.indexOf('{');
	if (namedStart !== -1) {
		const namedEnd = clause.indexOf('}', namedStart);
		const namedSegment = namedEnd === -1 ? clause.slice(namedStart + 1) : clause.slice(namedStart + 1, namedEnd);
		for (const raw of namedSegment.split(',')) {
			const entry = raw.trim();
			if (!entry) continue;
			const asMatch = /^(\S+)\s+as\s+(\S+)$/.exec(entry);
			if (asMatch) {
				out.set(asMatch[2], { specifier, importedName: asMatch[1] });
			} else {
				out.set(entry, { specifier, importedName: entry });
			}
		}
		// Strip the `{ … }` group so a leading default import in the same
		// statement (`import Foo, { Bar } from '…'`) is still captured below.
		clause = (clause.slice(0, namedStart) + clause.slice(namedEnd === -1 ? clause.length : namedEnd + 1)).trim();
	}

	const namespaceMatch = /^\*\s+as\s+([A-Za-z_$][\w$]*)$/.exec(clause);
	if (namespaceMatch) {
		out.set(namespaceMatch[1], { specifier, importedName: '*' });
		return;
	}

	const defaultName = clause.replace(/,\s*$/, '').trim();
	if (/^[A-Za-z_$][\w$]*$/.test(defaultName)) {
		out.set(defaultName, { specifier, importedName: 'default' });
	}
}

/**
 * Resolves a (relative or `~`/`@` aliased) module specifier — as written in
 * the entry's import — to an extensionless project-relative POSIX path.
 * Returns `null` for bare/package specifiers (a root component is always a
 * project-local file).
 */
function resolveSpecifierToModuleRel(specifier: string, entryRel: string, appRootRel: string): string | null {
	const entryDir = path.posix.dirname(normalizeRel(entryRel));
	if (specifier.startsWith('./') || specifier.startsWith('../')) {
		return toExtensionlessModuleRel(path.posix.join(entryDir, specifier));
	}
	if (specifier.startsWith('~/') || specifier.startsWith('@/')) {
		const base = normalizeRel(appRootRel || entryDir);
		return toExtensionlessModuleRel(path.posix.join(base, specifier.slice(2)));
	}
	return null;
}

function normalizeRel(rel: string): string {
	let normalized = String(rel || '').replace(/\\/g, '/');
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	return normalized.replace(/\/{2,}/g, '/');
}

/**
 * Normalizes any project-relative path to a leading-slash, extensionless
 * POSIX key suitable for equality comparison between a `.html`/`.ts` edit
 * and the resolved root component.
 */
export function toExtensionlessModuleRel(rel: string): string {
	const normalized = normalizeRel(rel);
	return normalized.replace(SOURCE_EXTENSION_RE, '');
}

/** True when two project-relative paths refer to the same module (ignoring extension). */
export function isSameAngularModuleRel(a: string | null | undefined, b: string | null | undefined): boolean {
	if (!a || !b) return false;
	return toExtensionlessModuleRel(a) === toExtensionlessModuleRel(b);
}

/**
 * Resolves the bootstrap root component from a dev-server entry module's
 * source. Returns `null` when the bootstrap shape can't be statically
 * resolved (callers should then keep their default behavior).
 */
export function resolveBootstrapRootComponent(options: { entrySource: string; entryRel: string; appRootRel?: string }): BootstrapRootComponent | null {
	const { entrySource, entryRel } = options;
	if (!entrySource || !entryRel) return null;

	const bootstrapMatch = BOOTSTRAP_APPLICATION_RE.exec(entrySource);
	if (!bootstrapMatch) return null;
	const localName = bootstrapMatch[1];

	const binding = scanImportBindings(entrySource).get(localName);
	if (!binding) return null;

	const moduleRel = resolveSpecifierToModuleRel(binding.specifier, entryRel, options.appRootRel ?? '');
	if (!moduleRel) return null;

	// Prefer the originally-imported name (the declared class) over a local
	// alias so it lines up with the class name Analog encodes in its id.
	const className = binding.importedName && binding.importedName !== 'default' && binding.importedName !== '*' ? binding.importedName : localName;

	return { moduleRel, className };
}

/**
 * Decodes Analog's `angular:component-update` payload `id`
 * (`encodeURIComponent(relativePath + '@' + className)`) into a normalized,
 * extensionless module rel plus the class name, so the bridge can compare it
 * against the resolved root component. Returns `null` for empty/invalid ids.
 */
export function decodeAngularComponentUpdateId(id: unknown): { moduleRel: string; className: string } | null {
	if (typeof id !== 'string' || !id) return null;
	let decoded = id;
	try {
		decoded = decodeURIComponent(id);
	} catch {
		// Leave as-is — a non-encoded id still splits/normalizes correctly.
	}
	// Class names never contain `@`, but scoped paths can — split on the LAST
	// `@` so `relativePath` keeps any leading `@scope/...` segments intact.
	const at = decoded.lastIndexOf('@');
	const pathPart = at >= 0 ? decoded.slice(0, at) : decoded;
	const className = at >= 0 ? decoded.slice(at + 1) : '';
	if (!pathPart) return null;
	return { moduleRel: toExtensionlessModuleRel(pathPart), className };
}

/**
 * True when an Analog `angular:component-update` `id` targets the resolved
 * root component — matched by module path first (robust to class-name
 * collisions), then by class name as a fallback.
 */
export function isAngularRootComponentUpdate(root: BootstrapRootComponent | null | undefined, id: unknown): boolean {
	if (!root) return false;
	const decoded = decodeAngularComponentUpdateId(id);
	if (!decoded) return false;
	if (isSameAngularModuleRel(root.moduleRel, decoded.moduleRel)) return true;
	return !!decoded.className && decoded.className === root.className;
}
