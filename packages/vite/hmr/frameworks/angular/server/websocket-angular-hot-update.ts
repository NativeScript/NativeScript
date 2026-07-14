import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import { isRuntimeGraphExcludedPath } from '../../../server/runtime-graph-filter.js';
import { canonicalizeTransformRequestCacheKey } from '../../../server/transform-cache-invalidation.js';

const APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;

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

function isExtensionlessAngularAppTransformCandidate(id: string): boolean {
	return id.startsWith(APP_VIRTUAL_WITH_SLASH) && /\.(?:[mc]?[jt]sx?)$/i.test(id);
}

function addAngularTransformCacheInvalidationUrl(targets: Set<string>, rawId: string | null | undefined, projectRoot?: string, workspaceRoot?: string | null): void {
	const id = String(rawId || '');
	if (!id) {
		return;
	}

	const cacheKey = projectRoot ? canonicalizeTransformRequestCacheKey(id, projectRoot) : id;
	targets.add(cacheKey);

	// Workspace-lib modules are served (and therefore cached) under keys
	// project-root canonicalization can't produce: their workspace-relative
	// form (`/libs/...` — see `rewriteFsAbsoluteToNsM`) and/or their Vite
	// `/@fs/<abs>` form (how the /ns/m route addresses out-of-root files at
	// transform time). Add both candidates; unknown purge keys are no-ops.
	if (workspaceRoot) {
		const workspaceKey = canonicalizeTransformRequestCacheKey(id, workspaceRoot);
		if (workspaceKey !== cacheKey) {
			targets.add(workspaceKey);
			// The id is under the workspace root but outside the project root
			// (project canonicalization left it alone) — that's exactly the
			// class of file the /ns/m route transforms via its `/@fs/<abs>`
			// form, so purge that spelling as well.
			const idPath = id.split('?')[0].replace(/\\/g, '/');
			if (idPath.startsWith('/') && !idPath.startsWith('/@fs/') && idPath === cacheKey.split('?')[0]) {
				targets.add(`/@fs${idPath}`);
			}
		}
	}

	const normalizedId = cacheKey.replace(/\?.*$/, '');
	if (!isExtensionlessAngularAppTransformCandidate(normalizedId)) {
		return;
	}

	targets.add(normalizedId.replace(/\.(?:[mc]?[jt]sx?)$/i, ''));
}

export function collectAngularTransformCacheInvalidationUrls(options: { file: string; isTs: boolean; hotUpdateRoots: Iterable<{ id?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null }>; projectRoot?: string; workspaceRoot?: string | null }): string[] {
	const urls = new Set<string>();

	if (options.isTs) {
		addAngularTransformCacheInvalidationUrl(urls, options.file, options.projectRoot, options.workspaceRoot);
	}

	for (const mod of options.hotUpdateRoots || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot, options.workspaceRoot);
	}

	for (const mod of options.transitiveImporters || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot, options.workspaceRoot);
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
// list directly into `__NS_DEV__.invalidateModules` without any further
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

function stripEvictRootPrefix(id: string, root: string | null | undefined): string | null {
	if (!root) return null;
	const normalizedRoot = String(root).replace(/\\/g, '/').replace(/\/$/, '');
	if (!normalizedRoot) return null;
	if (id.startsWith(`${normalizedRoot}/`)) {
		return id.slice(normalizedRoot.length);
	}
	return null;
}

function normalizeAngularEvictRelativeId(rawId: string | null | undefined, projectRoot: string | undefined, workspaceRoot?: string | null): string | null {
	if (!rawId) return null;
	let id = String(rawId).split('?')[0].replace(/\\/g, '/');
	if (!id) return null;
	if (id.startsWith('file://')) {
		id = id.slice('file://'.length);
	}
	// Vite spells any resolved id outside the configured `root` as
	// `/@fs/<abs-path>` — hoisted node_modules AND monorepo workspace libs.
	// Recover the absolute path so the root-stripping below can anchor it;
	// rejecting these outright (the old behavior) silently dropped every
	// workspace-lib importer from the eviction set.
	if (id.startsWith('/@fs/')) {
		id = id.slice('/@fs'.length);
	}
	// Project root first — matches the `/ns/m/<projectRel>` URL shape the
	// device uses for app-local modules. Then the monorepo workspace root:
	// `rewriteFsAbsoluteToNsM` mints workspace-lib device URLs as
	// `/ns/m/<workspaceRel>` (e.g. `/ns/m/libs/...`), so the eviction key for
	// an out-of-root lib module MUST be derived the same way. Deriving it
	// project-relative instead (the old behavior left the absolute path
	// intact) produces `/ns/m/Users/...` URLs the runtime reports as
	// `remove:miss` — the cached module survives and the reboot silently
	// re-imports stale lib code.
	id = stripEvictRootPrefix(id, projectRoot) ?? stripEvictRootPrefix(id, workspaceRoot) ?? id;
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

export function collectAngularEvictionUrls(options: { file: string; hotUpdateRoots?: Iterable<{ id?: string | null; file?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null; file?: string | null }>; projectRoot: string; origin: string; bootstrapEntry?: string | null; workspaceRoot?: string | null }): string[] {
	const urls = new Set<string>();
	const origin = String(options.origin || '').replace(/\/$/, '');
	const root = options.projectRoot;
	const workspaceRoot = options.workspaceRoot ?? null;

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
		// maps to a real entry, and `__NS_DEV__.invalidateModules` treats unknown
		// keys as no-ops.
		const extMatch = rel.match(/\.(?:[mc]?[jt]sx?)$/i);
		if (extMatch) {
			urls.add(`${origin}/ns/m${rel.slice(0, -extMatch[0].length)}`);
		}
	};

	addRel(normalizeAngularEvictRelativeId(options.file, root, workspaceRoot));

	for (const mod of options.hotUpdateRoots || []) {
		addRel(normalizeAngularEvictRelativeId(mod?.id || mod?.file, root, workspaceRoot));
	}

	for (const mod of options.transitiveImporters || []) {
		addRel(normalizeAngularEvictRelativeId(mod?.id || mod?.file, root, workspaceRoot));
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
		addRel(normalizeAngularEvictRelativeId(options.bootstrapEntry, root, workspaceRoot));
	}

	return Array.from(urls);
}

// ============================================================================
// `/@ng/component` live-broadcast ledger
// ============================================================================
//
// Every compiled component body (Analog `liveReload` mode) runs
// `<Class>_HmrLoad(Date.now())` at module-evaluation time — meaning EVERY
// cold boot fetches `/@ng/component?c=<id>&t=<now>` for every component.
// Analog's middleware serves the real `_UpdateMetadata` payload whenever the
// component's module carries a `lastInvalidationTimestamp` in Vite's module
// graph — state that persists until the dev server restarts. After any TS
// edit whose invalidation wave touches component modules, the NEXT app
// relaunch therefore boot-fetches real metadata-replacement payloads, and
// `ɵɵreplaceMetadata` runs after the root view commits. For the bootstrap
// component that recreates the root LView and tears down the
// `<page-router-outlet>` frame — the "relaunch to white screen" failure. The
// websocket bridge's root-component guard only covers the *event* path;
// boot-time fetches bypass it entirely.
//
// A fresh boot always evaluates the latest transformed source, so a boot-time
// replacement is never needed on NativeScript. The only legitimate consumer
// of a real payload is a live `angular:component-update` event — and the
// device echoes the server's exact broadcast timestamp back as `t`. This
// ledger records every broadcast the bridge forwards to `/ns-hmr` clients;
// the `/ns/m` middleware only delegates `(c, t)` pairs that match a recorded
// broadcast to Analog and answers everything else with the empty no-update
// stub (see `registerNsModuleServerRoute`'s
// `isLiveAngularComponentUpdateFetch`).

/**
 * Decode an Analog component id (`src%2Fapp%2F…%40Class`) to its canonical
 * form (`src/app/….ts@Class`) — the shape `URLSearchParams` yields for the
 * `c` query param on the device's metadata fetch.
 */
export function normalizeAngularComponentUpdateId(raw: unknown): string | null {
	if (typeof raw !== 'string' || !raw) return null;
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}

const MAX_RECORDED_TIMESTAMPS_PER_COMPONENT = 16;

export interface AngularComponentUpdateLedger {
	/** Record a forwarded `angular:component-update` payload (`{ id, timestamp }`). */
	record(data: unknown): void;
	/** True when `(componentId, timestamp)` matches a recorded broadcast. */
	isLive(componentId: string, timestamp: number): boolean;
}

export function createAngularComponentUpdateLedger(): AngularComponentUpdateLedger {
	const broadcasts = new Map<string, number[]>();
	return {
		record(data) {
			const id = normalizeAngularComponentUpdateId((data as { id?: unknown } | null | undefined)?.id);
			const timestamp = (data as { timestamp?: unknown } | null | undefined)?.timestamp;
			if (!id || typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return;
			const list = broadcasts.get(id) ?? [];
			list.push(timestamp);
			if (list.length > MAX_RECORDED_TIMESTAMPS_PER_COMPONENT) list.shift();
			broadcasts.set(id, list);
		},
		isLive(componentId, timestamp) {
			return (broadcasts.get(componentId) ?? []).includes(timestamp);
		},
	};
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
