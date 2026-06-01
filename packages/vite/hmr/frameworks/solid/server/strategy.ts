import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import { isRuntimeGraphExcludedPath } from '../../../server/runtime-graph-filter.js';
import { canonicalizeTransformRequestCacheKey, collectAngularTransitiveImportersForInvalidation } from '../../../server/transform-cache-invalidation.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';

// Solid server strategy for NativeScript HMR.
// For Solid we don't have .vue-style SFCs today; this strategy mainly
// ensures Solid runtime imports can be rewritten to vendor when needed
// and allows future per-file processing hooks.

const SOLID_FILE_PATTERN = /\.(tsx?|jsx?)$/i;
const SOLID_APP_PREFIX = `${getProjectAppVirtualPath()}/`;

export const solidServerStrategy: FrameworkServerStrategy = {
	flavor: 'solid',
	matchesFile(id: string) {
		// Treat app TS/TSX/JS/JSX under the configured app root as Solid candidates.
		return SOLID_FILE_PATTERN.test(id) && id.startsWith(SOLID_APP_PREFIX);
	},
	// Suppress the prologue's common-block delta broadcast: Solid HMR depends on
	// the client re-fetching the just-changed module to drive
	// `solid-refresh.patchRegistry`, so the broadcast must come AFTER this
	// handler purges the transform caches (see handleHotUpdate's tail). Otherwise
	// the client's evict + re-import races the server's invalidation and serves
	// the previous save's transform.
	deferDeltaBroadcast: true,
	// HMR: emit a graph delta for a changed app TSX/TS/JSX file, then bust the
	// shared + Vite transform caches (file + transitive importers) so the
	// client's re-import evaluates fresh code. Reached via the dispatcher's
	// delegation seam after the shared prologue.
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { root, metrics, emitSummary } = state;
		const { moduleGraph, verbose, sharedTransformRequest } = deps;
		const { file, server } = ctx;
		const isSolidFile = /\.(tsx?|jsx?)$/i.test(file);
		if (!isSolidFile) return;
		metrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			if (verbose) console.log('[hmr-ws][solid] app file hot update', { file, rel });
			// The prologue's common graph-update block may have already emitted a
			// delta if the file was in Vite's module graph. This forces emission
			// for files it missed (e.g. new file, or moduleGraph mismatch).
			const normalizedId = moduleGraph.normalizeGraphId(rel);
			const existing = moduleGraph.get(normalizedId);
			if (!existing) {
				// Module not in graph yet — force upsert with timestamp-based
				// hash so the client sees a change.
				moduleGraph.upsert(rel, `/* solid-hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });
			}
			// Log what we're sending so devs can trace the flow on the server side.
			if (verbose) {
				const gm = moduleGraph.get(normalizedId);
				console.log('[hmr-ws][solid] delta module', { id: gm?.id, hash: gm?.hash });
			}
			// Purge the shared transform-request cache AND Vite's own
			// moduleGraph transformResult cache for the changed file
			// AND every transitive importer.
			//
			// Why this matters for Solid HMR specifically:
			//  - The HMR client evicts V8's module cache for the
			//    canonical /ns/m/<path> URL and re-imports the module.
			//  - The dev server resolves /ns/m/* by calling
			//    `sharedTransformRequest(...)`, which has a 60s TTL on
			//    transform results to amortize cost across HMR
			//    cycles. The shared cache wraps `server.transformRequest`,
			//    which itself caches the compiled output on each
			//    `ModuleNode.transformResult`. Both layers must be
			//    invalidated, or the re-import resolves to whatever
			//    the previous save populated.
			//  - Without invalidation at *both* layers, the second
			//    save of a file within the cache window returns the
			//    FIRST save's transform — V8 evaluates stale code,
			//    `solid-refresh.patchRegistry` runs against an
			//    unchanged source body, and the visible page picks
			//    up the previous save's edit instead of the current
			//    one (the "one-save-behind" symptom users reported).
			//
			// Critically, transitive importers must also be invalidated
			// because TanStack file-based routing (and similar frameworks)
			// use route files that statically import their components.
			// When `home.tsx` changes, `routes/index.tsx`'s transform
			// output references the imported home module identity. Even
			// though the route file's source bytes did not change, its
			// *resolved* import target has — and its cached transform
			// might still encode the previous resolution. Forcing a
			// fresh transform of the importer guarantees the route
			// file's `import Home from ...` re-resolves against the
			// freshly evaluated home module on V8 side.
			//
			// The transitive walk is bounded (max depth 16, node_modules /
			// virtual ids excluded) so vendor packages stay hot.
			try {
				const projectRoot = server.config.root || process.cwd();
				const cacheInvalidationUrls = new Set<string>();
				const addCacheKey = (rawId: string | null | undefined) => {
					const id = String(rawId || '');
					if (!id) return;
					const cacheKey = canonicalizeTransformRequestCacheKey(id, projectRoot);
					cacheInvalidationUrls.add(cacheKey);
					const noQuery = cacheKey.replace(/\?.*$/, '');
					const stripped = noQuery.replace(/\.(?:[mc]?[jt]sx?)$/i, '');
					if (stripped !== noQuery) {
						cacheInvalidationUrls.add(stripped);
					}
				};
				addCacheKey(file);
				const rootModules = server.moduleGraph.getModulesByFile?.(file);
				const transitiveImporters = collectAngularTransitiveImportersForInvalidation({
					modules: rootModules ? Array.from(rootModules) : [],
					isExcluded: (id) => id.includes('/node_modules/') || isRuntimeGraphExcludedPath(id),
					maxDepth: 16,
				});
				// Invalidate Vite's moduleGraph for the changed file +
				// every transitive importer so `server.transformRequest`
				// re-runs the transform pipeline instead of returning
				// the cached `ModuleNode.transformResult`. We call
				// `onFileChange` (Vite's authoritative file-changed
				// signal — walks all module variants including `?v=`,
				// `?import`, `?t=`) AND per-module `invalidateModule`
				// for transitive importers (which onFileChange
				// doesn't reach).
				try {
					server.moduleGraph.onFileChange(file);
				} catch {}
				if (rootModules) {
					for (const mod of rootModules) {
						try {
							server.moduleGraph.invalidateModule(mod);
						} catch {}
					}
				}
				for (const mod of transitiveImporters) {
					addCacheKey(mod?.id);
					try {
						server.moduleGraph.invalidateModule(mod as any);
					} catch {}
				}
				if (cacheInvalidationUrls.size && sharedTransformRequest) {
					sharedTransformRequest.invalidateMany(cacheInvalidationUrls);
					if (verbose) {
						console.log('[hmr-ws][solid] purged shared transform cache entries:', cacheInvalidationUrls.size, 'transitiveImporters=', transitiveImporters.length);
					}
				}
				// Sledgehammer: nuke EVERY entry in sharedTransformRequest's
				// result cache. The targeted `invalidateMany` above only
				// clears keys we know about. The `/ns/m/` handler iterates
				// a long list of candidate extensions (`.ts`, `.js`, `.tsx`,
				// `.jsx`, `.mjs`, `.mts`, `.cts`, `.vue`, `index.*`) and
				// EACH candidate is a separate cache key. If a previous
				// serve populated cache for `/src/components/home.js` (via
				// extension fallback that resolves to `home.tsx`), our
				// targeted invalidate misses it and iOS HITs the stale
				// entry — serving the previous save's transformed code.
				try {
					sharedTransformRequest.clear();
				} catch {}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] transform cache invalidation failed', e);
			}
			// Re-run the transform AFTER all caches are invalidated, then
			// re-upsert the graph so the broadcast hash matches the freshly-
			// transformed content. The prologue's common upsert block ran
			// `server.transformRequest` BEFORE invalidation — at that
			// moment Vite's auto-invalidate hadn't fired yet (it runs after
			// `plugin.handleHotUpdate`), so the result it cached was the
			// previous save's. Without this re-transform, the broadcast
			// carries a stale hash and iOS evaluates the previous save's
			// bytes ("one save behind").
			//
			// We pre-populate the cache for every extension variant Vite's
			// /ns/m/ handler might try, so the first request from iOS hits
			// fresh data regardless of which candidate it resolves first.
			try {
				const ext = file.match(/\.(?:[mc]?[jt]sx?)$/i)?.[0] || '';
				const baseSpec = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
				const baseNoExt = ext ? baseSpec.replace(/\.(?:[mc]?[jt]sx?)$/i, '') : baseSpec;
				const candidates = Array.from(new Set([baseSpec, baseNoExt, baseNoExt + '.ts', baseNoExt + '.tsx', baseNoExt + '.js', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', file]));
				let freshCode = '';
				for (const cand of candidates) {
					try {
						const fresh = await sharedTransformRequest(cand, 30000);
						if (fresh?.code && !freshCode) freshCode = fresh.code;
					} catch {}
				}
				if (freshCode) {
					const existingGm = moduleGraph.get(normalizedId);
					const existingDeps = existingGm?.deps || [];
					moduleGraph.upsert(normalizedId, freshCode, existingDeps as string[], {
						broadcastDelta: false,
					});
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation re-transform failed', e);
			}
			// Broadcast the (now-fresh) delta here, AFTER cache invalidation. The
			// prologue suppresses the common-block broadcast for this flavor (via
			// `deferDeltaBroadcast`), so emitting it now ensures the client's
			// eviction + re-import doesn't race the server's cache invalidation.
			try {
				const gm = moduleGraph.get(normalizedId);
				if (gm) {
					moduleGraph.emitDelta([gm], []);
					if (verbose) {
						console.log('[hmr-ws][solid] broadcast delta after cache invalidation', { id: gm.id, hash: gm.hash });
					}
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation broadcast failed', e);
			}
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][solid] failed to handle hot update for', file, e);
		}
		emitSummary();
	},
	// preClean/rewriteFrameworkImports/postClean/ensureVersionedImports default to
	// identity: Solid HMR runs through Vite's solid-refresh plugin + the generic
	// vendor bridge, and has no dedicated HTTP endpoints to version.
	//
	// Solid HMR: patch @solid-refresh's $$refreshESM to do inline patching
	// during module re-evaluation instead of deferring to hot.accept() callback.
	// In NativeScript's HTTP ESM environment, accept callbacks are registered
	// but not invoked by the HMR client. By adding a direct patchRegistry()
	// call when hot.data already has a stored registry, component updates
	// apply immediately when the module re-evaluates.
	transformNodeModule(code: string, moduleId: string, verbose = false): string {
		if (!moduleId.includes('@solid-refresh')) {
			return code;
		}
		const PATCH_SENTINEL = '/* __ns_solid_refresh_patched__ */';
		const alreadyPatched = code.includes(PATCH_SENTINEL);
		if (verbose) {
			console.log('[hmr-ws][solid] @solid-refresh patch check:', { spec: moduleId, alreadyPatched, codeLen: code.length });
		}
		if (alreadyPatched) {
			return code;
		}
		let patchedCode = code;

		// Patch 1: Bypass shouldWarnAndDecline() — the vendor-bundled solid-js
		// may not have the 'development' condition active, making DEV empty/undefined.
		// In NativeScript HMR mode we are always in dev, so force it to return false.
		const declineCheck = 'function shouldWarnAndDecline() {';
		if (patchedCode.includes(declineCheck)) {
			patchedCode = patchedCode.replace(declineCheck, `${PATCH_SENTINEL}\nfunction shouldWarnAndDecline() { return false; /* NS HMR: always allow refresh */ }\nfunction __original_shouldWarnAndDecline() {`);
			if (verbose) {
				console.log('[hmr-ws][solid] bypassed shouldWarnAndDecline() for NativeScript HMR');
			}
		}

		// Patch 2: Force createMemo path in createProxy.
		// Without the 'development' condition, $DEVCOMP is not set on components,
		// so createProxy falls through to `return s(props)` — a direct call with
		// no reactive subscription. When patchComponent fires update() (the signal
		// setter), nobody is listening. By forcing the createMemo path, HMRComp
		// subscribes to the signal and re-renders when the component changes.
		const proxyCondition = 'if (!s || $DEVCOMP in s) {';
		if (patchedCode.includes(proxyCondition)) {
			patchedCode = patchedCode.replace(proxyCondition, 'if (true) { /* NS HMR: always use createMemo for reactive HMR updates */');
			if (verbose) {
				console.log('[hmr-ws][solid] forced createMemo path in createProxy for NativeScript HMR');
			}
		}

		// Patch 2b (NS HMR escape hatch): expose `source` on the proxy
		// itself via a non-enumerable, well-known symbol-ish key. This lets
		// our HMR remount path bypass solid-refresh's proxy chain and call
		// the freshly-patched underlying Home function directly. solid-refresh's
		// proxy wraps everything in nested createMemo's, which under
		// universal-renderer + nested-context (TanStack RouterContextProvider)
		// causes accumulating zombie memos that all subscribe to M_initial.source
		// — the visible symptom is "every other save applies".
		//
		// With this hatch we can do `proxy.__$$ns_resolve()` to obtain the
		// current underlying component (e.g. M_initial.proxy after first save,
		// or the actual Home function on the deepest hop) and then call
		// untrack(() => extract until we reach the actual function), then mount
		// against THAT function — no HMRComp memo proxy chain at the page level.
		// NS HMR escape hatch: stash `source` on the HMRComp function
		// itself AND short-circuit the Proxy's `get` handler so that
		// `proxy.__$ns_resolveSource` returns our exposed function.
		// Without the get-handler short-circuit, accessing the property
		// on the Proxy goes through `return source()[property]` — which
		// asks the *current source value* (which may itself be another
		// solid-refresh proxy or the underlying user function) for the
		// property. The user function doesn't have `__$ns_resolveSource`,
		// and a chained proxy would re-enter its own get handler. Either
		// way we end up with `undefined` at the page-level remount and
		// can't unwrap.
		//
		// NOTE: `$$` in String.prototype.replace replacement is treated
		// as a literal `$`. We use a single `$` to avoid that footgun.
		// Match only the unique opening fragment to avoid getting tripped up
		// by whitespace differences after the AST normalizer ran.
		const newProxyMarker = `if (property === 'location' || property === 'name') {`;
		if (patchedCode.includes(newProxyMarker)) {
			// 1. Inject `__$ns_resolveSource` as a property on the HMRComp
			//    function itself (so its closure captures `source`).
			//    CRITICAL: assign at module-eval time (right after HMRComp
			//    is defined / before `return new Proxy(...)`), NOT inside
			//    the HMRComp body — the body only runs when the proxy is
			//    called, so before first call the property is undefined
			//    and the page-level remount unwrap finds nothing.
			const setupMarker = `setComponentProperty(HMRComp, 'name', refreshName);`;
			patchedCode = patchedCode.replace(setupMarker, `HMRComp.__$ns_resolveSource = function() { return source(); }; ${setupMarker}`);
			// 2. Make the Proxy `get` handler short-circuit our property
			//    so callers can do `proxy.__$ns_resolveSource()` without
			//    going through `source()[property]` (which would unwrap one
			//    hop early or reach the user function which doesn't have it).
			patchedCode = patchedCode.replace(newProxyMarker, `if (property === '__$ns_resolveSource') { return HMRComp.__$ns_resolveSource; } ${newProxyMarker}`);
			if (verbose) {
				console.log('[hmr-ws][solid] exposed __$ns_resolveSource on createProxy for NS HMR escape hatch');
			}
		}

		// Patch 3: Inline patchRegistry call so updates apply immediately
		// on module re-evaluation (accept callbacks are not invoked by the HMR client).
		//
		// The injected diagnostic logs are gated on
		// `globalThis.__NS_ENV_VERBOSE__` so they're silent in
		// normal use but resurface immediately when the user
		// re-runs with verbose logging enabled. The flag is
		// seeded by `mainEntryPlugin` from the same `verbose`
		// option that drives this server-side log gating.
		// Without these the visible HMR signal is just "did it
		// apply" — with them, devs can answer "did `hot.data`
		// persist", "did `patchRegistry` actually swap the
		// proxy's signal source", and "did the registry
		// component count change" without reaching for an
		// inspector.
		const marker = 'hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;';
		if (patchedCode.includes(marker)) {
			const patchCode = [
				`var __nsRefreshVerbose = (typeof globalThis !== 'undefined') && !!globalThis.__NS_ENV_VERBOSE__;`,
				`if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] hot.data has SOLID_REFRESH=', !!(hot.data && hot.data[SOLID_REFRESH]), 'registry components=', registry.components ? registry.components.size : 0);`,
				`if (hot.data[SOLID_REFRESH]) {`,
				`  var __nsOldComponents = hot.data[SOLID_REFRESH].components ? hot.data[SOLID_REFRESH].components.size : 0;`,
				`  var __nsShouldInvalidate = patchRegistry(hot.data[SOLID_REFRESH], registry);`,
				`  if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] patched: oldComponents=', __nsOldComponents, 'newComponents=', registry.components ? registry.components.size : 0, 'shouldInvalidate=', __nsShouldInvalidate);`,
				`} else {`,
				`  if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] first load — no prior registry to patch');`,
				`}`,
			].join('\n    ');
			patchedCode = patchedCode.replace(marker, `${patchCode}\n    ${marker}`);
			if (verbose) {
				console.log('[hmr-ws][solid] added inline patchRegistry (with diagnostics) for NativeScript HMR');
			}
		}

		return patchedCode;
	},
	// ── pin solid-js to the canonical HTTP dev.js URL ─────────────────────
	// The vendor bundle
	// externalizes `solid-js` for this flavor, so all three import sites
	// (vendor's externalized `import 'solid-js'`, user code's alias-rewritten
	// path, and `@solid-refresh`'s rewritten import) MUST converge on this one
	// URL — V8's ESM loader dedupes by URL, giving a single reactive graph.
	// No trailing-slash prefix: subpaths (solid-js/store, /web) resolve via
	// HTTP from discoverInstalledPackages().
	importMapEntries(origin: string) {
		return {
			'solid-js': `${origin}/ns/m/node_modules/solid-js/dist/dev.js`,
		};
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		// For now we rely on the generic pipeline; no per-file Solid SFC registry.
		const { filePath, server, verbose } = ctx;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			if (verbose) {
				console.log(`[solid-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[solid-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(_ctx: FrameworkRegistryContext) {
		// No Solid registry messaging yet; HTTP-only boot imports app modules directly.
		return;
	},
};
