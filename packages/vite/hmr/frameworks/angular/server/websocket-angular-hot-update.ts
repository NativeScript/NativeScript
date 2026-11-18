import { isRuntimeGraphExcludedPath } from '../../../server/runtime-graph-filter.js';

export type HotUpdateGraphModuleLike = {
	id?: string | null;
	importedModules?: Iterable<{ id?: string | null }>;
	importers?: Iterable<HotUpdateGraphModuleLike>;
};

export function collectGraphUpdateModulesForHotUpdate(options: { file: string; flavor: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined; verbose?: boolean }): HotUpdateGraphModuleLike[] {
	const targets = new Map<string, HotUpdateGraphModuleLike>();
	const addTarget = (mod?: HotUpdateGraphModuleLike | null) => {
		const id = mod?.id?.replace(/\?.*$/, '');
		if (!id) return;
		if (isRuntimeGraphExcludedPath(id)) return;
		if (!targets.has(id)) {
			targets.set(id, mod!);
		}
	};

	if (options.flavor === 'angular' && /\.(html|htm)$/i.test(options.file)) {
		const importerIdsSeen: string[] = [];
		const importerIdsAccepted: string[] = [];
		for (const mod of options.modules || []) {
			for (const importer of mod?.importers || []) {
				const importerId = importer?.id || '';
				importerIdsSeen.push(importerId);
				if (/\.[cm]?[jt]sx?(?:$|\?)/i.test(importerId)) {
					addTarget(importer);
					importerIdsAccepted.push(importerId);
				}
			}
		}

		const fellBackToFile = !targets.size;
		if (fellBackToFile) {
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.ts')));
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.js')));
		}

		if (options.verbose) {
			console.info(`[ns-hmr][server] collectGraphUpdateModulesForHotUpdate(html) file=${options.file} importersSeen=${importerIdsSeen.length} importersAccepted=${importerIdsAccepted.length} fellBackToFile=${fellBackToFile} targets=${targets.size}`);
			if (importerIdsSeen.length) {
				console.info(`[ns-hmr][server] importersSeen sample=`, importerIdsSeen.slice(0, 8));
			}
			if (importerIdsAccepted.length) {
				console.info(`[ns-hmr][server] importersAccepted sample=`, importerIdsAccepted.slice(0, 8));
			}
		}

		return Array.from(targets.values());
	}

	if (!options.file.endsWith('.vue')) {
		addTarget(options.getModuleById(options.file) || options.getModuleById(options.file + '?vue'));
	}

	return Array.from(targets.values());
}

export function collectAngularHotUpdateRoots(options: { file: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined; getModulesByFile?: (file: string) => Iterable<HotUpdateGraphModuleLike> | undefined | null }): HotUpdateGraphModuleLike[] {
	const roots: HotUpdateGraphModuleLike[] = [];
	const seenIds = new Set<string>();
	const seenObjects = new Set<HotUpdateGraphModuleLike>();

	const addRoot = (mod?: HotUpdateGraphModuleLike | null) => {
		if (!mod) {
			return;
		}

		if (mod.id) {
			if (isRuntimeGraphExcludedPath(mod.id)) {
				return;
			}
			if (seenIds.has(mod.id)) {
				return;
			}
			seenIds.add(mod.id);
			roots.push(mod);
			return;
		}

		if (seenObjects.has(mod)) {
			return;
		}
		seenObjects.add(mod);
		roots.push(mod);
	};

	if (/\.(html|htm)$/i.test(options.file)) {
		for (const mod of collectGraphUpdateModulesForHotUpdate({
			file: options.file,
			flavor: 'angular',
			modules: options.modules,
			getModuleById: options.getModuleById,
		})) {
			addRoot(mod);
		}
		return roots;
	}

	if (!/\.(m|c)?ts$/i.test(options.file)) {
		return roots;
	}

	for (const mod of options.modules || []) {
		addRoot(mod);
	}

	for (const mod of options.getModulesByFile?.(options.file) || []) {
		addRoot(mod);
	}

	if (!roots.length) {
		addRoot(options.getModuleById(options.file));
	}

	return roots;
}

// Angular narrowing: a TS/JS file needs to invalidate its transitive
// importers only when it carries Angular semantics (a top-level @Component,
// @Directive, @Pipe, @Injectable, or @NgModule decorator). Files that only
// export constants, types, enums, plain functions, or plain classes are
// "leaf" modules — ES modules' live bindings deliver the new exports to
// importers automatically once V8 re-evaluates the changed module. Forcing
// every importer to re-transform on a constants edit is what produces the
// large invalidation waves that dominate the `refresh` phase on
// constants-style edits in big apps.
//
// Regex anchors at line start with only whitespace before `@Decorator(` so
// we don't false-match on string literals, JSDoc references, or commented-
// out blocks. Tests pin the matching/non-matching shapes that have come up
// in real Angular sources.
const ANGULAR_SEMANTIC_DECORATOR_REGEX = /^[ \t]*@(?:Component|Directive|Pipe|Injectable|NgModule)\b\s*\(/m;

export function angularSourceHasSemanticDecorator(source: string): boolean {
	if (!source || source.length === 0) return false;
	return ANGULAR_SEMANTIC_DECORATOR_REGEX.test(source);
}

export function shouldInvalidateAngularTransitiveImporters(options: { flavor: string; file: string; source?: string | null }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	// Template-only (.html/.htm) edits change the component's view but never
	// its exported symbol shape, so importers of the component do not need to
	// re-transform. Skipping the transitive walk here is the single biggest
	// latency win for template HMR.
	if (!/\.(?:(m|c)?[jt]sx?)$/i.test(options.file)) {
		return false;
	}

	// When source is available, narrow to "files whose changes can affect
	// the Angular semantics of their importers". Files without a top-level
	// @Component/@Directive/@Pipe/@Injectable/@NgModule decorator are leaf
	// modules — invalidating the file itself is sufficient. When source is
	// undefined/null (e.g. ctx.read() failed or the caller didn't plumb it
	// through), fall back to the conservative behavior: invalidate
	// transitively.
	if (typeof options.source === 'string') {
		return angularSourceHasSemanticDecorator(options.source);
	}

	return true;
}

export function shouldSuppressDefaultViteHotUpdate(options: { flavor: string; file: string }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	return /\.(html|htm|ts)$/i.test(options.file);
}

export type PendingAngularReloadSuppressionEntry = {
	absPath: string;
	relPath: string;
	expiresAt: number;
};

export function normalizeHotReloadMatchPath(raw: string, root?: string): string {
	let normalized = String(raw || '')
		.split('?')[0]
		.replace(/\\/g, '/')
		.replace(/^file:\/\//, '');

	if (root) {
		const rootNormalized = root.replace(/\\/g, '/');
		if (normalized.startsWith(rootNormalized)) {
			normalized = normalized.slice(rootNormalized.length);
		}
	}

	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}

	return normalized;
}

/**
 * True when any candidate path matches a live (unexpired) suppression entry,
 * comparing every candidate against both the entry's absolute and
 * root-relative forms — payload paths arrive in either shape depending on the
 * emitter. Shared by both suppression predicates below.
 */
function matchesPendingSuppression(candidates: ReadonlyArray<string | null>, pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>, now: number): boolean {
	for (const entry of pendingEntries) {
		if (!entry || entry.expiresAt <= now) continue;
		for (const candidate of candidates) {
			if (candidate && (candidate === entry.absPath || candidate === entry.relPath)) {
				return true;
			}
		}
	}
	return false;
}

/**
 * True when Analog's in-place component metadata event targets the same TS
 * file already owned by a pending `ns:angular-update` reboot. A single save
 * must never both rebuild the Angular root and then run `ɵɵreplaceMetadata`
 * against that freshly rebuilt routed component tree.
 */
export function shouldSuppressAngularComponentUpdatePayload(options: { payload: any; pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>; root?: string; now?: number }): boolean {
	const { payload, pendingEntries, root } = options;
	const now = options.now ?? Date.now();
	if (!payload || payload.type !== 'custom' || payload.event !== 'angular:component-update') {
		return false;
	}

	const rawId = payload?.data?.id;
	if (typeof rawId !== 'string' || !rawId) {
		return false;
	}

	let componentFile = rawId;
	try {
		componentFile = decodeURIComponent(rawId);
	} catch {}
	// Class names never contain `@`, but a scoped directory may. Analog uses the
	// final `@` as the path/class delimiter.
	const classDelimiter = componentFile.lastIndexOf('@');
	componentFile = classDelimiter >= 0 ? componentFile.slice(0, classDelimiter) : componentFile;
	if (!componentFile) {
		return false;
	}

	const componentAbs = normalizeHotReloadMatchPath(componentFile);
	const componentRel = normalizeHotReloadMatchPath(componentFile, root);
	return matchesPendingSuppression([componentAbs, componentRel], pendingEntries, now);
}

export function shouldSuppressViteFullReloadPayload(options: { payload: any; pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>; root?: string; now?: number }): boolean {
	const { payload, pendingEntries, root } = options;
	const now = options.now ?? Date.now();

	if (!payload || payload.type !== 'full-reload') {
		return false;
	}

	const payloadPath = typeof payload.path === 'string' && payload.path !== '*' ? normalizeHotReloadMatchPath(payload.path, root) : null;
	const payloadTriggeredBy = typeof payload.triggeredBy === 'string' ? normalizeHotReloadMatchPath(payload.triggeredBy, root) : null;
	return matchesPendingSuppression([payloadTriggeredBy, payloadPath], pendingEntries, now);
}
