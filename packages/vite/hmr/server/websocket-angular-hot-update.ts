import { getProjectAppVirtualPath } from '../../helpers/utils.js';
import { isRuntimeGraphExcludedPath, normalizeRuntimeGraphPath } from './runtime-graph-filter.js';

const APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;

export type HotUpdateGraphModuleLike = {
	id?: string | null;
	importedModules?: Iterable<{ id?: string | null }>;
	importers?: Iterable<HotUpdateGraphModuleLike>;
};

export function canonicalizeTransformRequestCacheKey(url: string, projectRoot: string): string {
	if (!url) return url;

	const [rawPath, rawQuery = ''] = url.split('?', 2);
	let normalizedPath = rawPath;
	const root = projectRoot ? projectRoot.replace(/\\/g, '/') : '';

	if (normalizedPath.startsWith('/@fs/')) {
		const fsPath = normalizedPath.slice('/@fs'.length).replace(/\\/g, '/');
		if (root && fsPath.startsWith(root)) {
			const rel = fsPath.slice(root.length);
			normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
		}
	} else if (root && normalizedPath.replace(/\\/g, '/').startsWith(root)) {
		const rel = normalizedPath.replace(/\\/g, '/').slice(root.length);
		normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
	}

	if (!rawQuery) {
		return normalizedPath;
	}

	const params = new URLSearchParams(rawQuery);
	params.delete('t');
	params.delete('v');
	const kept = Array.from(params.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
		if (leftKey === rightKey) {
			return leftValue.localeCompare(rightValue);
		}
		return leftKey.localeCompare(rightKey);
	});
	if (!kept.length) {
		return normalizedPath;
	}

	const normalizedQuery = new URLSearchParams();
	for (const [key, value] of kept) {
		normalizedQuery.append(key, value);
	}

	return `${normalizedPath}?${normalizedQuery.toString()}`;
}

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
			try {
				console.info(`[ns-hmr-diag][server] collectGraphUpdateModulesForHotUpdate(html) file=${options.file} importersSeen=${importerIdsSeen.length} importersAccepted=${importerIdsAccepted.length} fellBackToFile=${fellBackToFile} targets=${targets.size}`);
				if (importerIdsSeen.length) {
					console.info(`[ns-hmr-diag][server] importersSeen sample=`, importerIdsSeen.slice(0, 8));
				}
				if (importerIdsAccepted.length) {
					console.info(`[ns-hmr-diag][server] importersAccepted sample=`, importerIdsAccepted.slice(0, 8));
				}
			} catch {}
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

export type TransitiveImporterModuleLike = {
	id?: string | null;
	file?: string | null;
	importers?: Iterable<TransitiveImporterModuleLike> | null;
};

export function collectAngularTransitiveImportersForInvalidation(options: { modules: Iterable<TransitiveImporterModuleLike> | undefined | null; isExcluded?: (id: string) => boolean; maxDepth?: number }): TransitiveImporterModuleLike[] {
	const visited = new Set<TransitiveImporterModuleLike>();
	const collected = new Map<string, TransitiveImporterModuleLike>();
	const isExcluded = options.isExcluded ?? ((id: string) => id.includes('/node_modules/') || isRuntimeGraphExcludedPath(id));
	const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 16));

	const normalizeId = (value: string | null | undefined): string => normalizeRuntimeGraphPath(value ?? '');

	const walk = (mod: TransitiveImporterModuleLike | undefined | null, depth: number): void => {
		if (!mod || visited.has(mod)) {
			return;
		}
		visited.add(mod);

		if (depth >= maxDepth) {
			return;
		}

		const importers = mod.importers;
		if (!importers) {
			return;
		}

		for (const importer of importers) {
			if (!importer) continue;
			const importerId = normalizeId(importer.id);
			if (!importerId) {
				walk(importer, depth + 1);
				continue;
			}
			if (isExcluded(importerId)) {
				continue;
			}
			if (!collected.has(importerId)) {
				collected.set(importerId, importer);
			}
			walk(importer, depth + 1);
		}
	};

	for (const mod of options.modules || []) {
		walk(mod, 0);
	}

	return Array.from(collected.values());
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

function isExtensionlessAngularAppTransformCandidate(id: string): boolean {
	return id.startsWith(APP_VIRTUAL_WITH_SLASH) && /\.(?:[mc]?[jt]sx?)$/i.test(id);
}

function addAngularTransformCacheInvalidationUrl(targets: Set<string>, rawId: string | null | undefined, projectRoot?: string): void {
	const id = String(rawId || '');
	if (!id) {
		return;
	}

	const cacheKey = projectRoot ? canonicalizeTransformRequestCacheKey(id, projectRoot) : id;
	targets.add(cacheKey);

	const normalizedId = cacheKey.replace(/\?.*$/, '');
	if (!isExtensionlessAngularAppTransformCandidate(normalizedId)) {
		return;
	}

	targets.add(normalizedId.replace(/\.(?:[mc]?[jt]sx?)$/i, ''));
}

export function collectAngularTransformCacheInvalidationUrls(options: { file: string; isTs: boolean; hotUpdateRoots: Iterable<{ id?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null }>; projectRoot?: string }): string[] {
	const urls = new Set<string>();

	if (options.isTs) {
		addAngularTransformCacheInvalidationUrl(urls, options.file, options.projectRoot);
	}

	for (const mod of options.hotUpdateRoots || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	for (const mod of options.transitiveImporters || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	return Array.from(urls);
}

// Stable URL + Explicit Invalidation.
//
// Compute the set of fully-qualified `/ns/m/<rel>` URLs that the runtime
// should drop from `g_moduleRegistry` before re-importing main.ts. The
// set must satisfy these invariants:
//
// * The changed file itself (so V8 fetches the new source).
// * Every transitive importer up to the entry (so the new exports are
//   re-bound; ESM live bindings only "see" new exports if the importer
//   re-evaluates).
// * No `/node_modules/` paths (vendor packages are stable in dev; evicting
//   them would force unnecessary re-fetch + re-transform).
// * No virtual / runtime-graph-excluded ids (e.g. `\0` rollup virtuals).
// * No duplicates — the set is deduped on canonical relative path.
//
// The output URLs are origin-absolute (e.g.
// `http://localhost:5173/ns/m/src/main.ts`) so the runtime can feed the
// list directly into `__nsInvalidateModules` without any further
// resolution work. The runtime canonicalizer collapses any residual
// `__ns_hmr__/<tag>/` or `__ns_boot__/b1/` segments, so the effective
// registry key is `/ns/m/<rel>` regardless of any tag a stale V8 cache
// entry might still carry.
//
// Extensionless canonical key.
//
// Vite emits ES module import statements with extensions stripped (this
// is how `resolve.extensions` works for Angular/TS apps), so V8 in the
// NativeScript iOS runtime keys `g_moduleRegistry` by the extensionless
// URL it sees in the import statement. Concretely, an import like
//   import { AppComponent } from './app.component';
// inside `main.ts` is rewritten by Vite to
//   import { AppComponent } from '/ns/m/src/app/app.component';
// and V8 stores the resulting module under the key
//   http://localhost:5173/ns/m/src/app/app.component
// (no `.ts` extension). The `moduleGraph` ids on the server, however,
// are absolute file paths that DO carry the extension, so a naive
// eviction set built from `mod.id` keys against `.../app.component.ts`
// — which never matches the registry entry. The runtime reports
// `[resolver][remove:miss]`, the cached module survives, ESM live
// bindings continue to point at the OLD constants module, and the user
// sees no visual update despite a clean HMR cycle.
//
// Workaround: for any path ending in `.ts/.tsx/.js/.jsx/.mjs/.mts/
// .cjs/.cts`, emit BOTH the extensioned URL AND the extension-stripped
// canonical URL. The runtime evicts whichever shape V8 actually has;
// the other is a harmless `remove:miss`. Cost: at most 2x URLs in
// `evictPaths` (still tiny relative to the JSON payload).
//
// Returning a `Set` of URLs (rather than an array) lets the caller
// collapse multiple sources (changed file + roots + transitive
// importers) without paying for an extra dedup pass.

function normalizeAngularEvictRelativeId(rawId: string | null | undefined, projectRoot: string | undefined): string | null {
	if (!rawId) return null;
	let id = String(rawId).split('?')[0].replace(/\\/g, '/');
	if (!id) return null;
	if (id.startsWith('file://')) {
		id = id.slice('file://'.length);
	}
	const root = projectRoot ? projectRoot.replace(/\\/g, '/').replace(/\/$/, '') : '';
	if (root && id.startsWith(root)) {
		id = id.slice(root.length);
	}
	if (!id.startsWith('/')) {
		id = '/' + id;
	}
	if (id.includes('/node_modules/')) {
		return null;
	}
	if (isRuntimeGraphExcludedPath(id)) {
		return null;
	}
	// Reject virtual ids — they aren't fetchable over /ns/m/.
	if (id.includes('\0') || id.includes('/@id/') || id.includes('/@fs/')) {
		return null;
	}
	return id;
}

export function collectAngularEvictionUrls(options: { file: string; hotUpdateRoots?: Iterable<{ id?: string | null; file?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null; file?: string | null }>; projectRoot: string; origin: string; bootstrapEntry?: string | null }): string[] {
	const urls = new Set<string>();
	const origin = String(options.origin || '').replace(/\/$/, '');
	const root = options.projectRoot;

	const addRel = (rel: string | null) => {
		if (!rel) return;
		// Final defense: never emit non-/ns/m URLs for eviction; the runtime
		// would map them to a different cache namespace.
		urls.add(`${origin}/ns/m${rel}`);
		// V8 in the iOS runtime keys `g_moduleRegistry` by the URL Vite
		// emitted in the *generated* import statement, which strips JS/TS
		// extensions (see the extensionless-key block above). So the
		// canonical registry key for an app TS/JS module is the
		// extensionless form. Emit it alongside the `.ts` form so the
		// explicit eviction matches whatever shape the runtime actually
		// stored. This cannot false-positive: at most one of the two URLs
		// maps to a real entry, and `__nsInvalidateModules` treats unknown
		// keys as no-ops.
		const extMatch = rel.match(/\.(?:[mc]?[jt]sx?)$/i);
		if (extMatch) {
			urls.add(`${origin}/ns/m${rel.slice(0, -extMatch[0].length)}`);
		}
	};

	addRel(normalizeAngularEvictRelativeId(options.file, root));

	for (const mod of options.hotUpdateRoots || []) {
		addRel(normalizeAngularEvictRelativeId(mod?.id || mod?.file, root));
	}

	for (const mod of options.transitiveImporters || []) {
		addRel(normalizeAngularEvictRelativeId(mod?.id || mod?.file, root));
	}

	// The bootstrap entry must always be evicted: V8's `import(entry)` is a
	// no-op if the cache entry is still live, and the entire HMR cycle
	// hinges on re-evaluating main.ts. The transitive walk usually catches
	// this naturally (every component reaches main via importer chains),
	// but include it explicitly as an invariant — covers edge cases like a
	// hand-rolled `@nativescript/hmr-strategy` overriding the candidates,
	// or a pristine app whose graph hasn't yet linked main into the
	// importer set.
	if (typeof options.bootstrapEntry === 'string' && options.bootstrapEntry) {
		addRel(normalizeAngularEvictRelativeId(options.bootstrapEntry, root));
	}

	return Array.from(urls);
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

export function shouldSuppressViteFullReloadPayload(options: { payload: any; pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>; root?: string; now?: number }): boolean {
	const { payload, pendingEntries, root } = options;
	const now = options.now ?? Date.now();

	if (!payload || payload.type !== 'full-reload') {
		return false;
	}

	const payloadPath = typeof payload.path === 'string' && payload.path !== '*' ? normalizeHotReloadMatchPath(payload.path, root) : null;
	const payloadTriggeredBy = typeof payload.triggeredBy === 'string' ? normalizeHotReloadMatchPath(payload.triggeredBy, root) : null;

	for (const entry of pendingEntries) {
		if (!entry || entry.expiresAt <= now) {
			continue;
		}

		if (payloadTriggeredBy === entry.absPath || payloadTriggeredBy === entry.relPath || payloadPath === entry.relPath || payloadPath === entry.absPath) {
			return true;
		}
	}

	return false;
}
