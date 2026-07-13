import type { TransformResult, ViteDevServer } from 'vite';

import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';

import { sanitizeStrayCoreReferences } from './core-sanitize.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { isRuntimeGraphExcludedPath } from './runtime-graph-filter.js';
import { buildPiniaVendorShim, buildVueVendorShim } from './vendor-bare-module-shims.js';
import { collapseLegacyNsMTags } from './websocket-ns-m-paths.js';
import { createNsMRequestContext, resolveNsMTransformedModule } from './websocket-ns-m-request.js';
import { setDeviceModuleHeaders } from './route-helpers.js';
import { CSS_MODULE_RE, buildCssRegisterSnippetFromVar, normalizeCssForDevice } from './css-device-module.js';
import { assertNoOptimizedArtifacts, buildBootProgressSnippet, canonicalizeRtImports, classifyServedModule, dedupeRtNamedImportsAgainstDestructures, deduplicateLinkerImports, ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, expandStarExports, hoistTopLevelStaticImports, MODULE_IMPORT_ANALYSIS_PLUGINS, wrapCommonJsModuleForDevice } from './websocket-served-module-helpers.js';
import { cleanCode, collectImportDependencies, isWorkerEntryModuleId, processCodeForDevice, rewriteImports } from './websocket-device-transform.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';
import { getServerOrigin } from './server-origin.js';
import { createNsMResponseMemo } from './ns-m-response-memo.js';
import { getSharedDepsBundleService, registerDepsBundleRoute, type DepsBundleService } from './deps-bundle.js';
import type { FrameworkServedModuleContext, FrameworkServerStrategy } from './framework-strategy.js';

const babelTraverse: any = (traverse as any)?.default || (traverse as any);

type SharedTransformRequestFn = (url: string, timeoutMs?: number) => Promise<TransformResult | null>;
type UpsertGraphModuleFn = (rawId: string, code: string, deps: string[], options?: { bumpVersion?: boolean; emitDeltaOnInsert?: boolean; broadcastDelta?: boolean }) => void;

/**
 * Plugin-closure dependencies the `/ns/m` device module server needs. The pure
 * transform/codegen functions are imported directly from
 * `websocket-device-transform.ts`; only genuine plugin state (graph version,
 * strategy, shared transform runner, graph upsert) is injected here.
 */
export interface RegisterNsModuleServerRouteOptions {
	verbose: boolean;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
	sharedTransformRequest: SharedTransformRequestFn;
	ensureInitialGraphPopulationStarted(server: ViteDevServer): void;
	upsertGraphModule: UpsertGraphModuleFn;
	/**
	 * Injectable deps-bundle service (testability seam). When omitted, the
	 * shared process-wide service is used — null when `NS_DEPS_PER_MODULE=1`
	 * forces per-module node_modules serving.
	 */
	depsBundle?: DepsBundleService | null;
	/**
	 * Live-broadcast gate for AnalogJS `/@ng/component` metadata fetches.
	 * When provided, only fetches whose `(c, t)` pair matches a recorded
	 * `angular:component-update` broadcast are delegated to Analog's
	 * middleware; everything else — most importantly the boot-time
	 * `<Class>_HmrLoad(Date.now())` fetch every compiled component issues on
	 * evaluation — is answered with the empty no-update stub. See the ledger
	 * in `websocket-angular-hot-update.ts` for the full failure mode this
	 * prevents (post-edit relaunch → boot-time `ɵɵreplaceMetadata` on the
	 * root component → white screen).
	 */
	isLiveAngularComponentUpdateFetch?(componentId: string, timestamp: number): boolean;
}

/**
 * Registers the `/ns/m/*` device module server: the HTTP endpoint every
 * NativeScript device uses to fetch app/source modules (and AnalogJS Angular
 * `/@ng/component` live-reload requests) as device-ready ESM. This is the
 * single hottest route in the HMR server.
 */
export function registerNsModuleServerRoute(server: ViteDevServer, options: RegisterNsModuleServerRouteOptions): void {
	// Final-response memo: repeat serves of an unchanged module (app restarts,
	// the boot-archive build, kickstart waves) skip the whole post-processing
	// pipeline. Keyed by a hash of Vite's transform output, so HMR edits
	// invalidate implicitly. `NS_VITE_HMR_DISABLE_NSM_MEMO=1` opts out.
	const memoDisabled = process.env.NS_VITE_HMR_DISABLE_NSM_MEMO === '1' || process.env.NS_VITE_HMR_DISABLE_NSM_MEMO === 'true';
	const responseMemo = createNsMResponseMemo();
	// Deps bundle (see deps-bundle.ts): once a boot recording exists, the
	// recorded node_modules closure is served as ONE esbuild payload and the
	// canonical /ns/m/node_modules/... URLs become thin registry shims.
	const depsBundle: DepsBundleService | null = options.depsBundle !== undefined ? options.depsBundle : getSharedDepsBundleService(server);
	if (depsBundle) {
		registerDepsBundleRoute(server, depsBundle);
	}
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/m')) return next();
			// Closure deps injected by createHmrWebSocketPlugin (see websocket.ts).
			const verbose = options.verbose;
			const APP_VIRTUAL_WITH_SLASH = options.appVirtualWithSlash;
			const sfcFileMap = options.sfcFileMap;
			const depFileMap = options.depFileMap;
			const sharedTransformRequest = options.sharedTransformRequest;
			const ensureInitialGraphPopulationStarted = options.ensureInitialGraphPopulationStarted;
			const strategy = options.getStrategy();
			// Framework request interception, BEFORE spec resolution. Angular
			// uses this to delegate AnalogJS `/@ng/component` live-reload
			// fetches (with the boot-fetch gate and iOS empty-body guard —
			// see frameworks/angular/server/ng-component-route.ts). Must run
			// first: an intercepted request must not kick off graph
			// population or the transform pipeline.
			if (
				strategy?.interceptModuleRequest?.({
					urlObj,
					res,
					next,
					isLiveComponentUpdateFetch: options.isLiveAngularComponentUpdateFetch,
				})
			) {
				return;
			}
			// graphVersion starts at 1 and stays stable during cold boot (see
			// `upsertGraphModule`'s bumpVersion option and the inline comment
			// at the graphVersion declaration), so the initial population can
			// run in the background without blocking the first response.
			// `handleHotUpdate` awaits the same promise so the first HMR
			// event still sees a fully populated graph.
			ensureInitialGraphPopulationStarted(server);
			// Cold-boot counting lives in the leading boot-trace middleware
			// (see `configureServer` — it records the request and tracks
			// finish() via res.on('close'/'finish')), not here: recording in
			// this handler would miss the round-trip timing and per-route
			// breakdowns.
			setDeviceModuleHeaders(res);
			// Inbound spec normalization is owned by createNsMRequestContext
			// (websocket-ns-m-request.ts): query/path-style spec extraction,
			// the anomalous-'@' and empty-spec stubs, legacy boot/HMR tag
			// stripping, absolute-filesystem → project-relative mapping,
			// `@/` aliasing, the blocked-device-import gate, and candidate
			// expansion. Its specs pin all of it.
			const serverRoot = (server.config?.root || process.cwd()) as string;
			const monorepoWorkspaceRoot = getMonorepoWorkspaceRoot(serverRoot);
			const contextResult = createNsMRequestContext(req.url || '', serverRoot, APP_VIRTUAL_WITH_SLASH, monorepoWorkspaceRoot);
			if (contextResult.kind === 'next') return next();
			if (contextResult.kind === 'response') {
				res.statusCode = contextResult.statusCode;
				res.end(contextResult.code);
				return;
			}
			const requestContext = contextResult.value;
			const spec = requestContext.spec;
			// Serve Vite virtual modules (/@id/ prefix) directly — these are
			// internal virtual modules (e.g., \0nsvite:nsconfig-json for
			// ~/package.json) that don't exist on disk and must NOT run
			// through the device post-processing pipeline below.
			if (spec.startsWith('/@id/')) {
				try {
					// First try Vite's transform pipeline directly
					const vr = await sharedTransformRequest(spec);
					if (vr?.code) {
						res.statusCode = 200;
						res.end(vr.code);
						return;
					}
				} catch {}
				try {
					// Fallback: decode the virtual module ID (__x00__ → \0) and
					// load through the plugin container directly
					const rawId = spec.slice('/@id/'.length).replace(/__x00__/g, '\0');
					const loadResult = await server.pluginContainer.load(rawId);
					if (loadResult) {
						const code = typeof loadResult === 'string' ? loadResult : loadResult.code;
						if (code) {
							res.statusCode = 200;
							res.end(code);
							return;
						}
					}
				} catch {}
			}

			// Worker-realm serves must NOT take the deps-bundle bridge: the
			// bundle evaluates the full dependency closure in the worker realm,
			// where Angular's injectables reject the entry evaluation
			// ("_PlatformLocation needs to be compiled using the JIT compiler").
			// Per-module serving gives the worker just the graphs it imports.
			// A request belongs to a worker realm when it carries `?ns_worker=1`
			// (propagated onto every /ns/m child specifier of a worker serve
			// below) OR when it IS a worker entry by filename — the runtime's
			// `new Worker(...)` fetch has no way to carry the marker itself.
			const isWorkerRealmRequest = urlObj.searchParams.get('ns_worker') === '1' || isWorkerEntryModuleId(spec);

			// Deps-bundle shim short-circuit: a bundled node_modules module is
			// served as a thin registry shim (see deps-bundle.ts) — the whole
			// transform pipeline below is skipped. Non-bundled specs (no
			// recording yet, CJS files, build failure) fall through unchanged.
			if (depsBundle && !isWorkerRealmRequest && spec.includes('/node_modules/')) {
				const shim = depsBundle.getShimForSpec(spec);
				if (shim) {
					res.statusCode = 200;
					res.end(shim);
					return;
				}
			}

			// A JS/TS `import './x.css'` reaches the device as a module request;
			// Vite's default CSS module needs a DOM, so it's a no-op on NativeScript.
			// Compile via `?inline` (full postcss/sass/@import, no DOM side effect),
			// register the result under the file's root-relative tag (matches the
			// `.css` live-edit tag so edits replace, not stack), and re-export the
			// string for `import css from './x.css'`. `app.css` has its own path.
			if (CSS_MODULE_RE.test(spec)) {
				try {
					const inlineRes = await sharedTransformRequest(`${spec}?inline`);
					const inlineCode = inlineRes?.code || '';
					// `?inline` output is `export default "<compiled css>"`.
					const m = inlineCode.match(/export\s+default\s+("(?:[^"\\]|\\.)*")\s*;?/s);
					if (m) {
						let css = '';
						try {
							css = JSON.parse(m[1]);
						} catch {}
						css = normalizeCssForDevice(css);
						const out = `// [ns:m][css] ${spec}\n` + `const __ns_css_text__ = ${JSON.stringify(css)};\n` + buildCssRegisterSnippetFromVar(spec, '__ns_css_text__') + `export default __ns_css_text__;\n`;
						res.statusCode = 200;
						res.end(out);
						return;
					}
					if (verbose) console.warn('[ns:m][css] unexpected ?inline output shape for', spec);
				} catch (cssErr) {
					if (verbose) console.warn('[ns:m][css] inline compile failed', spec, (cssErr as any)?.message);
				}
				// Fall through to default handling if inline compile produced nothing.
			}
			// Queue and dedupe transformRequest calls so heavy app graphs do not
			// overwhelm Vite with concurrent work. Slow-transform warnings start only
			// when the transform actually begins executing, and requests stay pending
			// until Vite returns a real result.
			const transformWithTimeout = async (url: string, timeoutMs = 120000): Promise<TransformResult | null> => {
				const r = await sharedTransformRequest(url, timeoutMs);
				// A type-only .ts module legitimately transforms to EMPTY code
				// (e.g. a workspace lib's `interfaces.ts` holding only `export
				// type ...`). Every candidate gate in the resolution pipeline
				// tests `r?.code` truthiness, so '' would cascade through all
				// fallbacks into a 404 "transform miss" — and one 404 in the
				// entry graph fails the whole dev-session boot. Normalize to
				// the canonical empty ESM module instead.
				if (r && typeof r.code === 'string' && r.code.trim() === '') {
					return { ...r, code: 'export {}\n' };
				}
				return r;
			};
			const resolvePluginContainerId = async (id: string): Promise<string | null> => {
				try {
					const resolved = await server.pluginContainer?.resolveId?.(id, undefined);
					return typeof resolved === 'string' ? resolved : resolved?.id || null;
				} catch {
					return null;
				}
			};
			const loadVirtualId = (id: string) => server.pluginContainer.load(id);
			// Canonical "spec → transformed module" resolution
			// (websocket-ns-m-request.ts): raw explicit JS read → transform
			// candidates → resolveId → bare node_modules specifier →
			// /@fs project+workspace roots → ?import hint.
			const resolution = await resolveNsMTransformedModule({
				context: requestContext,
				transformRequest: transformWithTimeout,
				resolveId: resolvePluginContainerId,
				loadVirtualId,
			});
			let transformed: TransformResult | null = resolution.transformed;
			const resolvedCandidate: string | null = resolution.resolvedCandidate;
			// Solid HMR: patch the served `@solid-refresh` runtime so $$refreshESM
			// applies registry updates inline on module re-evaluation. The full
			// patch (and its server-side diagnostics) lives in the Solid strategy's
			// `transformNodeModule` hook; every other flavor leaves the hook
			// undefined, so this is a no-op for them.
			try {
				if (transformed?.code && strategy?.transformNodeModule) {
					const patched = strategy.transformNodeModule(transformed.code, resolvedCandidate || spec || '', verbose);
					if (patched !== transformed.code) {
						// Work on a copy to avoid mutating Vite's cached TransformResult
						transformed = { ...transformed, code: patched };
					}
				}
			} catch {}
			// NOTE: Path-based cache busting for /ns/m/* imports is applied in the
			// finalize step below (after rewriteImports adds the /ns/m/ prefix).
			// The block here only handles TypeScript-specific graph population.
			try {
				if (transformed?.code) {
					const code = transformed.code;
					// TypeScript-specific graph population: when TS flavor is active
					// and this is an application module under the virtual app root,
					// upsert it into the HMR graph so ns:hmr-full-graph is non-empty.
					try {
						if (strategy?.flavor === 'typescript' || strategy?.flavor === 'react') {
							const id = (resolvedCandidate || spec).replace(/[?#].*$/, '');
							// Only track app modules (under APP_VIRTUAL_WITH_SLASH) and ts/js/tsx/jsx/mjs.
							const isApp = id.startsWith(APP_VIRTUAL_WITH_SLASH) || id.startsWith('/app/');
							if (isApp && /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i.test(id) && !isRuntimeGraphExcludedPath(id)) {
								const deps = Array.from(collectImportDependencies(code, id));
								if (verbose) {
									console.log('[hmr-ws][ts-graph] candidate', { id, depsCount: deps.length });
								}
								// Serve-time warm-up: no live edit happened, so don't bump
								// graphVersion.
								options.upsertGraphModule(id, code, deps, { bumpVersion: false });
							}
						}
					} catch {}
				}
			} catch {}
			// If transformRequest failed, handle bare-module vendor shims for 'vue' and 'pinia'
			if (!transformed?.code) {
				const bare = spec.startsWith('/') ? spec.slice(1) : spec;
				const isBare = bare && !bare.includes('/') && !/\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(bare);
				if (isBare && (bare === 'vue' || bare === 'nativescript-vue' || bare === 'pinia')) {
					const pkg = bare;
					let code = '';
					if (pkg === 'vue' || pkg === 'nativescript-vue') {
						code = buildVueVendorShim(pkg);
					} else if (pkg === 'pinia') {
						code = buildPiniaVendorShim();
					}
					res.statusCode = 200;
					res.end(code || 'export {}\n');
					return;
				}
				// (Bare specifiers already went through resolveId in the
				// resolution pipeline above — reaching here means a true miss.)
				// Emit a module that throws with context for easier on-device debugging
				try {
					const tried = Array.from(new Set(requestContext.transformCandidates.length > 0 ? requestContext.transformCandidates : requestContext.candidates)).slice(0, 12);
					const out = `// [ns:m] transform miss path=${spec} tried=${tried.length}\n` + `throw new Error(${JSON.stringify(`[ns/m] transform failed for ${spec} (tried ${tried.length} candidates).`)});\nexport {};\n`;
					res.statusCode = 404;
					res.end(out);
					return;
				} catch {
					res.statusCode = 404;
					res.end('export {}\n');
					return;
				}
			}
			// Final-response memo (see ns-m-response-memo.ts): identical
			// (spec, transform output, context) → identical served body, so repeat
			// serves skip the post-processing pipeline. The graph version in the
			// context conservatively invalidates on any live edit — star-export
			// expansion and the link-check read other modules, so this module's
			// own transform hash is not sufficient.
			// Worker-realm serves produce a DIFFERENT body (vendor imports as
			// per-module HTTP + ns_worker marker propagation) — keep the two
			// variants in separate memo slots.
			const memoContext = `${strategy?.flavor || ''}|${getServerOrigin(server)}|${options.getGraphVersion()}|${resolvedCandidate || ''}|${isWorkerRealmRequest ? 'worker' : 'main'}`;
			const memoKey = memoDisabled ? null : responseMemo.buildKey(spec, transformed.code, memoContext);
			if (memoKey) {
				const memoized = responseMemo.get(memoKey);
				if (memoized !== undefined) {
					res.statusCode = 200;
					res.end(memoized);
					return;
				}
			}
			let code = transformed.code;
			// Prepend guard to capture any URL-based require attempts
			code = REQUIRE_GUARD_SNIPPET + code;
			code = cleanCode(code, strategy);
			// Library code (node_modules, monorepo core source, dist vite package)
			// must skip the app-source passes inside processCodeForDevice (AST
			// normalization, /ns/rt helper-alias injection). One classification
			// point — see classifyServedModule for the full case list.
			const isNodeMod = classifyServedModule(resolvedCandidate || spec) === 'library';
			code = processCodeForDevice(code, false, true, isNodeMod, resolvedCandidate || spec, isWorkerRealmRequest ? { workerRealm: true } : undefined);
			// import.meta.hot is JS-owned: cleanCode() strips Vite's browser
			// __vite__createHotContext assignment and processCodeForDevice
			// injects the NS hot-context prelude (globalThis.__NS_HOT_REGISTRY__,
			// installed by the /__ns_dev__/client bootstrap) for app modules.
			const projectRoot = server.config?.root || process.cwd();
			const serverOrigin = getServerOrigin(server);
			// Served-module import rewrite, routed through the active framework
			// strategy. Angular overrides with its register-only entry pass
			// (`rewriteServedModule`); every other flavor falls through to the shared
			// `rewriteImports` default.
			const servedModuleCtx: FrameworkServedModuleContext = {
				moduleId: resolvedCandidate || spec,
				sfcFileMap,
				depFileMap,
				projectRoot,
				serverOrigin,
				verbose: !!verbose,
			};
			code = strategy?.rewriteServedModule ? strategy.rewriteServedModule(code, servedModuleCtx) : rewriteImports(code, servedModuleCtx.moduleId, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, serverOrigin, true);

			// Expand `export * from "url"` into explicit named re-exports.
			// NativeScript's HTTP ESM loader may not propagate star-re-exports across
			// HTTP module boundaries (the namespace object gets direct exports but
			// misses re-exported names). By expanding to `export { a, b } from "url"`,
			// the engine sees explicit named exports and resolves them correctly.
			try {
				code = await expandStarExports(code, server, server.config?.root || process.cwd(), verbose, sharedTransformRequest, resolvedCandidate || spec);
			} catch (e: any) {
				if (verbose) console.warn('[ns/m] export* expansion failed:', e?.message);
			}

			// Dedupe any /ns/rt named imports that duplicate destructured bindings off default /ns/rt
			try {
				code = dedupeRtNamedImportsAgainstDestructures(code);
			} catch {}
			code = ensureVariableDynamicImportHelper(code);
			// Final safety: guard any plain dynamic import(...) occurrences to reroute anomalous '@' specs
			try {
				code = ensureGuardPlainDynamicImports(code);
			} catch {}
			// Extra hardening before the fast-fail assertion: run the
			// consolidated stray-core-reference safety net. If any
			// rewrite occurred, leave a diagnostic marker so the
			// pipeline review log explains why the served code carries
			// it.
			try {
				const __before = code;
				code = sanitizeStrayCoreReferences(code);
				if (code !== __before) {
					code = `// [hmr-sanitize] core-literal->bridge\n` + code;
				}
			} catch {}
			// Final pass: deduplicate/resolve any bare-specifier imports that slipped
			// through the pipeline (e.g., extracted from JSDoc comments by import-splitting
			// regexes, or injected by the Angular linker on already-resolved code).
			try {
				code = deduplicateLinkerImports(code);
			} catch {}
			// CJS/UMD wrapping: if a module uses module.exports but has no ESM export default,
			// wrap it with CJS shims so the device HTTP ESM loader can consume it.
			// This handles npm packages that use CommonJS but aren't pre-bundled by Vite.
			//
			// Key constraints this must handle:
			//  - CJS modules often declare local vars with the same names as their exports
			//    (e.g. `function createLTTB() {...}; exports.createLTTB = createLTTB;`)
			//    so `export var { createLTTB }` would cause a duplicate declaration.
			//  - UMD modules reference `this` at top level (undefined in ESM) but
			//    typically fall back to `self` or `globalThis`.
			//  - `module`, `exports` must be shims since they don't exist in ESM.
			try {
				code = wrapCommonJsModuleForDevice(code, resolvedCandidate || null);
			} catch {}
			try {
				assertNoOptimizedArtifacts(code, `NS M ${resolvedCandidate || spec}`);
			} catch (e) {
				res.statusCode = 500;
				return void res.end(`throw new Error(${JSON.stringify((e as any)?.message || String(e))});\nexport {};`);
			}
			// Framework export normalization (e.g. the Vue/Solid/TS `routes`
			// default-export alias — see FrameworkServerStrategy.normalizeServedExports).
			try {
				code = strategy?.normalizeServedExports?.(code) ?? code;
			} catch {}

			// Every emitted endpoint URL is CANONICAL (unversioned).
			//
			// Module identity is literally the URL — a versioned
			// `/ns/rt/<ver>` / `/ns/core/<ver>` / `/ns/sfc/<ver>` would
			// create a second module realm. `canonicalizeRtImports` and the
			// strategy's `canonicalizeFrameworkImports` collapse any
			// versioned form (stale cached device code) back to the single
			// canonical URL.
			try {
				code = canonicalizeRtImports(code, getServerOrigin(server));
				code = strategy.canonicalizeFrameworkImports?.(code, getServerOrigin(server)) ?? code;
			} catch {}
			// `/ns/m` URL finalize step: collapse every emitted /ns/m URL form
			// (static/side-effect/dynamic imports, new URL(...) shapes, SFC
			// URLs) to the canonical stable form. Cache busting is driven by
			// `__NS_DEV__.invalidateModules` + the runtime's eviction nonce,
			// not URL decoration — see websocket-ns-m-paths.ts.
			try {
				code = collapseLegacyNsMTags(code, 'outbound-served-code', getServerOrigin(server));
			} catch {}
			// Final guard: eliminate any lingering named imports from /ns/core to avoid
			// evaluation-time "does not provide an export named ..." in the device runtime.
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}

			// Boot-time module graph progress: while the app is still replacing
			// the placeholder, emit lightweight progress updates as /ns/m app
			// modules begin evaluating. The snippet is SELF-GATING (it no-ops
			// once `__NS_HMR_BOOT_COMPLETE__` flips) so it is injected
			// unconditionally — no boot-tagged URL needed. node_modules are
			// deliberately skipped (the heartbeat's wall-clock axis covers
			// vendor stretches; see startBootImportHeartbeat).
			try {
				if (!isNodeMod) {
					const bootModuleLabel = String(spec || '').replace(/\\/g, '/');
					const bootProgressSnippet = buildBootProgressSnippet(bootModuleLabel);
					code = bootProgressSnippet + code;
					code = hoistTopLevelStaticImports(code);
				}
			} catch {}

			// Dev-only: link-check static imports to surface missing bindings early
			try {
				const devCheck = process.env.NODE_ENV !== 'production';
				if (devCheck) {
					const ast = babelParse(code, {
						sourceType: 'module',
						plugins: MODULE_IMPORT_ANALYSIS_PLUGINS,
					}) as any;
					const imports: Array<{ src: string; wantsDefault: boolean }> = [];
					babelTraverse(ast, {
						ImportDeclaration(p: any) {
							const src = p.node.source.value;
							if (typeof src !== 'string') return;
							const wantsDefault = p.node.specifiers.some((s: any) => s.type === 'ImportDefaultSpecifier');
							imports.push({ src, wantsDefault });
						},
					});
					// Resolve and verify each static import that asks for default
					for (const imp of imports) {
						if (!imp.wantsDefault) continue;
						// Only check our served endpoints and app modules
						if (/^https?:\/\/[^\s]+\/ns\//.test(imp.src) || /^https?:\/\/[^\s]+\/.+/.test(imp.src)) {
							const u = new URL(imp.src, 'http://localhost');
							// Fetch target module's sanitized code using server.transformRequest or by routing through our own endpoints heuristically
							let targetCode = '';
							try {
								if (u.pathname.startsWith('/ns/asm')) {
									// Reconstruct: call our own assembler handler to get code (preferred)
									const target = await server.transformRequest(imp.src.replace(/^https?:\/\/[^/]+/, ''));
									targetCode = target?.code || '';
								} else if (u.pathname.startsWith('/ns/sfc')) {
									// Delegator re-exports default from /ns/asm — skip; assembler will be checked when imported by upstream
									continue;
								} else if (u.pathname.startsWith('/ns/m')) {
									// Resolve the import target through the SAME
									// canonical pipeline the /ns/m route itself uses
									// (websocket-ns-m-request.ts) instead of a third
									// hand-rolled copy of candidate expansion.
									try {
										const targetContextResult = createNsMRequestContext(u.pathname, serverRoot, APP_VIRTUAL_WITH_SLASH, monorepoWorkspaceRoot);
										if (targetContextResult.kind === 'context') {
											const targetResolution = await resolveNsMTransformedModule({
												context: targetContextResult.value,
												transformRequest: async (url) => {
													try {
														return await server.transformRequest(url);
													} catch {
														return null;
													}
												},
												resolveId: resolvePluginContainerId,
												loadVirtualId,
											});
											targetCode = targetResolution.transformed?.code || '';
										}
									} catch {}
								} else if (u.pathname.startsWith('/ns/rt') || u.pathname.startsWith('/ns/core')) {
									// Bridges export named/default as needed; skip default check
									continue;
								}
							} catch {}
							if (!targetCode) continue;
							const hasDefault = /\bexport\s+default\b/.test(targetCode) || /export\s*\{\s*default\s*(?:as\s*default)?\s*\}/.test(targetCode);
							if (!hasDefault) {
								// CJS/UMD modules won't have `export default` — they get CJS-wrapped
								// by the serving pipeline. Only warn, don't fatally block the importer.
								const hasCjsPattern = /\bmodule\s*\.\s*exports\b/.test(targetCode) || /\bexports\s*\.\s*\w/.test(targetCode);
								if (hasCjsPattern) {
									if (verbose) {
										console.warn(`[ns:m][link-check] CJS module without export default: ${u.pathname} (will be CJS-wrapped at serve time)`);
									}
									continue;
								}
								const msg = `[link-check] Missing default export in ${u.pathname}${u.search} (imported by ${resolvedCandidate || spec})`;
								// Emit a module that throws to surface the exact offender
								res.statusCode = 200;
								res.end(`throw new Error(${JSON.stringify(msg)});\nexport {};`);
								return;
							}
						}
					}
				}
			} catch (eLC) {
				if (verbose) {
					console.warn('[ns:m][link-check] failed', (eLC as any)?.message || eLC);
				}
			}
			// Worker-realm marker propagation: every /ns/m child specifier in a
			// `?ns_worker=1` response carries the marker too, so the ENTIRE
			// worker module graph stays on per-module serving. Without this,
			// a worker entry's transitive app modules (e.g. a utils barrel
			// importing rxjs/@angular/core) resolve node_modules specs through
			// the deps-bundle bridge, dragging the full dependency closure —
			// Angular included — into the worker realm, where injectables
			// reject the entry evaluation ("_PlatformLocation needs to be
			// compiled using the JIT compiler").
			if (isWorkerRealmRequest) {
				code = code.replace(/((?:from\s*|import\s*\(?\s*|import\s+)["'])((?:https?:\/\/[^"']+)?\/ns\/m\/[^"']*?)(["'])/g, (full, pre: string, url: string, post: string) => {
					if (/[?&]ns_worker=1/.test(url)) return full;
					return `${pre}${url}${url.includes('?') ? '&' : '?'}ns_worker=1${post}`;
				});
			}

			// Only fully successful serves are memoized — every early-return
			// above (link-check throw module, 404 stubs, 500s) stays uncached.
			if (memoKey) {
				responseMemo.set(memoKey, code);
			}
			res.statusCode = 200;
			res.end(code);
		} catch (e) {
			console.warn('[sfc-asm] error serving', req.url, e && (e as any).message ? (e as any).message : e);
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
