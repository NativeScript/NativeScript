import path from 'path';

/**
 * Identifies the Angular bootstrap (root) component from the app's entry
 * module. The root hosts the navigation `Frame` (`<page-router-outlet>`),
 * which `ɵɵreplaceMetadata` tears down without re-navigating, so its
 * `angular:component-update`s must become full reloads.
 *
 * Plain string/path math, testable without Vite or a filesystem. Only the
 * standalone `bootstrapApplication(AppComponent, …)` shape resolves; other
 * shapes (e.g. NgModule `bootstrap: [...]`) yield `null`.
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
