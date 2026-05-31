import type { TransformResult, ViteDevServer } from 'vite';
import * as path from 'path';

import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';

import { sanitizeStrayCoreReferences } from './core-sanitize.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { isRuntimeGraphExcludedPath } from './runtime-graph-filter.js';
import { buildPiniaVendorShim, buildVueVendorShim } from './vendor-bare-module-shims.js';
import { getNumericServeVersionTag, rewriteNsMImportPathForHmr } from './websocket-ns-m-paths.js';
import { filterExistingNodeModulesTransformCandidates, getBlockedDeviceNodeModulesReason, resolveCandidateFilePath, stripDecoratedServePrefixes, tryReadRawExplicitJavaScriptModule } from './websocket-module-specifiers.js';
import { assertNoOptimizedArtifacts, buildBootProgressSnippet, dedupeRtNamedImportsAgainstDestructures, deduplicateLinkerImports, ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, ensureVersionedRtImports, expandStarExports, hoistTopLevelStaticImports, MODULE_IMPORT_ANALYSIS_PLUGINS, wrapCommonJsModuleForDevice } from './websocket-served-module-helpers.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';

const babelTraverse: any = (traverse as any)?.default || (traverse as any);

type ProcessCodeForDeviceFn = (code: string, isVitePreBundled: boolean, preserveVendorImports?: boolean, isNodeModule?: boolean, sourceId?: string) => string;
type RewriteImportsFn = (code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose?: boolean, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp?: boolean) => string;
type CleanCodeFn = (code: string, strategy: FrameworkServerStrategy) => string;
type SharedTransformRequestFn = (url: string, timeoutMs?: number) => Promise<TransformResult | null>;
type CollectImportDependenciesFn = (code: string, importerPath: string) => Set<string>;
type UpsertGraphModuleFn = (rawId: string, code: string, deps: string[], options?: { bumpVersion?: boolean; emitDeltaOnInsert?: boolean; broadcastDelta?: boolean }) => void;

/**
 * Dependencies the `/ns/m` device module server needs from the HMR plugin
 * closure. The transform/codegen functions (`cleanCode`, `processCodeForDevice`,
 * `rewriteImports`, `prepareAngularEntryForDevice`, `getServerOrigin`,
 * `sharedTransformRequest`, `collectImportDependencies`) live in `websocket.ts`;
 * injecting them keeps the module server in its own file without a circular
 * import back into the plugin.
 */
export interface RegisterNsModuleServerRouteOptions {
	verbose: boolean;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
	getServerOrigin(server: ViteDevServer): string;
	cleanCode: CleanCodeFn;
	processCodeForDevice: ProcessCodeForDeviceFn;
	rewriteImports: RewriteImportsFn;
	prepareAngularEntryForDevice: RewriteImportsFn;
	sharedTransformRequest: SharedTransformRequestFn;
	collectImportDependencies: CollectImportDependenciesFn;
	ensureInitialGraphPopulationStarted(server: ViteDevServer): void;
	upsertGraphModule: UpsertGraphModuleFn;
}

/**
 * Registers the `/ns/m/*` device module server: the HTTP endpoint every
 * NativeScript device uses to fetch app/source modules (and AnalogJS Angular
 * `/@ng/component` live-reload requests) as device-ready ESM. This is the
 * single hottest route in the HMR server.
 */
export function registerNsModuleServerRoute(server: ViteDevServer, options: RegisterNsModuleServerRouteOptions): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/m')) return next();
			// Closure deps injected by createHmrWebSocketPlugin (see websocket.ts).
			const verbose = options.verbose;
			const APP_VIRTUAL_WITH_SLASH = options.appVirtualWithSlash;
			const sfcFileMap = options.sfcFileMap;
			const depFileMap = options.depFileMap;
			const getServerOrigin = options.getServerOrigin;
			const cleanCode = options.cleanCode;
			const processCodeForDevice = options.processCodeForDevice;
			const rewriteImports = options.rewriteImports;
			const prepareAngularEntryForDevice = options.prepareAngularEntryForDevice;
			const sharedTransformRequest = options.sharedTransformRequest;
			const collectImportDependencies = options.collectImportDependencies;
			const ensureInitialGraphPopulationStarted = options.ensureInitialGraphPopulationStarted;
			const strategy = options.getStrategy();
			// Delegate AnalogJS Angular component live-reload endpoints.
			//
			// Angular 21's `ɵɵgetReplaceMetadataURL` (in @angular/core
			// _debug_node-chunk.mjs) builds the metadata-replacement URL as
			// `new URL('./@ng/component?c=<id>&t=<ts>', import.meta.url).href`.
			// Because `import.meta.url` for a NS-served module is
			// `http://host:port/ns/m/<project-relative>/component.ts`, the
			// resolved metadata URL ends up *nested* under the component's
			// directory: `/ns/m/<dir>/@ng/component?c=...&t=...`.
			//
			// AnalogJS's `liveReloadPlugin` registers a middleware that matches
			// `/@ng/component` anywhere in `req.url` and returns either an empty
			// module body (no HMR update available) or the metadata-replacement
			// code (after a save invalidates the file). Without this delegation
			// the NS `/ns/m/` middleware would treat the path as a file lookup,
			// fail to resolve `@ng/component` against disk, and respond with
			// 404 — which surfaces as `HTTP fetch/compile failed` at the
			// component's own `_HmrLoad(Date.now())` call on initial boot and
			// blocks Angular component bootstrapping.
			//
			// Calling `next()` here lets AnalogJS's middleware (or any other
			// middleware later in the chain) handle the request. Analog's
			// middleware reads only the `?c=` query string and is pathname-
			// agnostic, so we don't need to rewrite `req.url` for it to work.
			//
			// HOWEVER: AnalogJS responds with an EMPTY body (`res.end('')`)
			// for non-invalidated component IDs (initial boot, before any
			// file save). The iOS HTTP ESM loader's
			// `LoadHttpModuleForUrl` (ModuleInternalCallbacks.mm) treats an
			// empty body as a fetch failure (`body.empty() → reject`), even
			// when the HTTP status is 200 OK. That bubbles up as
			// `HTTP fetch/compile failed` at the device's `__ns_import(...)`
			// inside each component's `_HmrLoad(Date.now())` and crashes
			// Angular's component bootstrap. To make Analog's empty
			// "no-update" response acceptable to the iOS loader, we wrap
			// `res.write` / `res.end` and substitute a minimal valid ESM
			// module body (`export {}`) when downstream writes nothing.
			// Non-empty bodies (real HMR update payloads after a save)
			// pass through unchanged.
			if (urlObj.pathname.includes('/@ng/component')) {
				const chunks: string[] = [];
				const origWrite = res.write.bind(res);
				const origEnd = res.end.bind(res);
				let ended = false;
				const captureChunk = (chunk: unknown): void => {
					if (chunk == null) return;
					if (typeof chunk === 'string') {
						chunks.push(chunk);
					} else if (Buffer.isBuffer(chunk)) {
						chunks.push(chunk.toString('utf8'));
					} else {
						chunks.push(String(chunk));
					}
				};
				(res as any).write = function (chunk?: unknown, ..._args: unknown[]): boolean {
					captureChunk(chunk);
					return true;
				};
				(res as any).end = function (chunk?: unknown, ..._args: unknown[]): unknown {
					if (ended) return true;
					ended = true;
					captureChunk(chunk);
					let body = chunks.join('');
					if (body.length === 0) {
						body = '// [ns:m] empty Angular component metadata — substituted with valid empty module to satisfy iOS HTTP loader (rejects empty bodies)\nexport {};\n';
					}
					try {
						res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
					} catch {}
					return (origEnd as (data: string) => unknown)(body);
				};
				return next();
			}
			// Previously we awaited `populateInitialGraph(server)` here so
			// graphVersion would be non-zero for the first /ns/m request.
			// That gave deterministic URL tags but blocked the cold boot on a
			// full src/ tree walk (hundreds of transformRequest calls, 3-6s).
			//
			// graphVersion now starts at 1 and stays stable during cold boot
			// (see `upsertGraphModule`'s bumpVersion option and the inline
			// comment at the graphVersion declaration). We kick off the
			// initial population in the background so it doesn't block the
			// first response. `handleHotUpdate` awaits the same promise so
			// the first HMR event still sees a fully populated graph.
			ensureInitialGraphPopulationStarted(server);
			// Cold-boot counter is now hooked via the leading boot-trace
			// middleware (see `configureServer` — it records the request
			// and tracks finish() via res.on('close'/'finish')). This
			// handler used to record here but that missed the
			// round-trip timing and didn't track per-route breakdowns.
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			// Disable caching for dev ESM endpoints to avoid device-side stale module reuse
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			// Support both query (?path=/abs) and path-style (/ns/m/abs)
			let spec = urlObj.searchParams.get('path') || '';
			// Optional graph version pin for deterministic boot
			let forcedVer = urlObj.searchParams.get('v');
			let bootTaggedRequest = false;
			if (!spec) {
				const base = '/ns/m';
				let rest = urlObj.pathname.slice(base.length);
				if (rest && rest !== '/') spec = rest;
			}
			// Special-case stub for anomalous '@' imports emitted as '/__invalid_at__.mjs'
			if (spec === '/__invalid_at__.mjs' || spec === '__invalid_at__.mjs') {
				res.statusCode = 200;
				res.end("// invalid '@' import stub\nexport {}\n");
				return;
			}
			if (!spec) {
				res.statusCode = 200;
				res.end('export {}\n');
				return;
			}
			const serverRoot = (server.config?.root || process.cwd()) as string;
			const monorepoWorkspaceRoot = getMonorepoWorkspaceRoot(serverRoot);
			spec = spec.replace(/[?#].*$/, '');
			// Accept path-based boot/HMR prefixes:
			//   /ns/m/__ns_boot__/b1/<real-spec>
			//   /ns/m/__ns_hmr__/<tag>/<real-spec>
			//   /ns/m/__ns_boot__/b1/__ns_hmr__/<tag>/<real-spec>
			// The iOS HTTP ESM loader canonicalizes cache keys by stripping query params,
			// so we must carry the cache-buster in the path.
			try {
				const decorated = stripDecoratedServePrefixes(spec);
				spec = decorated.cleanedSpec;
				bootTaggedRequest = decorated.bootTaggedRequest;
				forcedVer ||= decorated.forcedVer;
			} catch {}
			// Normalize absolute filesystem paths back to project-relative ids (e.g. /src/app.ts)
			try {
				const toPosix = (p: string) => p.replace(/\\/g, '/');
				const rootPosix = toPosix(serverRoot);
				const specPosix = toPosix(spec);
				// If spec is an absolute path under the project root, convert to '/'+relative
				const isAbsFs = /^\//.test(specPosix) || /^[A-Za-z]:\//.test(spec); // posix or win drive
				if (isAbsFs) {
					let rel = specPosix.startsWith(rootPosix) ? specPosix.slice(rootPosix.length) : require('path').posix.relative(rootPosix, specPosix);
					if (!rel.startsWith('..')) {
						if (!rel.startsWith('/')) rel = '/' + rel;
						// Ensure leading '/src' style when path maps into src
						spec = rel;
					}
				}
			} catch {}
			// Serve Vite virtual modules (/@id/ prefix). These are internal
			// virtual modules (e.g., \0nsvite:nsconfig-json for ~/package.json)
			// that don't exist on disk. Decode the ID and load via plugin container.
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
			if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
			if (spec.startsWith('./')) spec = spec.slice(1);
			const blockedNodeModulesReason = getBlockedDeviceNodeModulesReason(spec);
			if (blockedNodeModulesReason) {
				res.statusCode = 404;
				res.end(`// [ns:m] blocked device import\nthrow new Error(${JSON.stringify(`[ns/m] ${blockedNodeModulesReason}`)});\nexport {};\n`);
				return;
			}
			if (!spec.startsWith('/')) spec = '/' + spec;
			const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
			const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
			const candidates = [...(hasExt ? [spec] : []), baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs'];
			const transformCandidates = filterExistingNodeModulesTransformCandidates(spec, candidates, serverRoot, monorepoWorkspaceRoot);
			let transformed: TransformResult | null = null;
			let resolvedCandidate: string | null = null;
			const rawExplicitModule = tryReadRawExplicitJavaScriptModule(spec, serverRoot);
			if (rawExplicitModule) {
				transformed = { code: rawExplicitModule.code } as TransformResult;
				resolvedCandidate = rawExplicitModule.resolvedId;
			}
			// Queue and dedupe transformRequest calls so heavy app graphs do not
			// overwhelm Vite with concurrent work. Slow-transform warnings start only
			// when the transform actually begins executing, and requests stay pending
			// until Vite returns a real result.
			const transformWithTimeout = (url: string, timeoutMs = 120000): Promise<TransformResult | null> => {
				return sharedTransformRequest(url, timeoutMs);
			};
			if (!transformed?.code) {
				for (const cand of transformCandidates) {
					try {
						const r = await transformWithTimeout(cand);
						if (r?.code) {
							transformed = r;
							resolvedCandidate = cand;
							break;
						}
					} catch {}
				}
			}
			// Fallback 1: ask Vite to resolve the id, then transform the resolved id (handles aliases and virtual ids)
			if (!transformed?.code) {
				try {
					const rid = await server.pluginContainer?.resolveId?.(spec, undefined);
					const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
					if (ridStr) {
						const r = await transformWithTimeout(ridStr);
						if (r?.code) {
							transformed = r;
							resolvedCandidate = ridStr;
						}
					}
				} catch {}
			}
			// Fallback 1b: if spec is a /node_modules/ path, extract bare specifier
			// and try resolveId with that. This handles package.json "exports" field
			// resolution (e.g., solid-js/jsx-runtime → solid-js/dist/solid.js).
			if (!transformed?.code && spec.includes('/node_modules/')) {
				try {
					const nmIdx = spec.lastIndexOf('/node_modules/');
					const bare = spec.slice(nmIdx + '/node_modules/'.length);
					if (bare && !bare.startsWith('.')) {
						const rid = await server.pluginContainer?.resolveId?.(bare, undefined);
						const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
						if (ridStr) {
							const r = await sharedTransformRequest(ridStr);
							if (r?.code) {
								transformed = r;
								resolvedCandidate = ridStr;
							}
						}
					}
				} catch {}
			}
			// Fallback 2: try /@fs absolute path under project root (Vite file system alias).
			// In a monorepo with hoisted node_modules the file may live above
			// `serverRoot`, so try the workspace root next.
			if (!transformed?.code) {
				try {
					const toPosix = (p: string) => p.replace(/\\/g, '/');
					const rootsToTry = [serverRoot, ...(monorepoWorkspaceRoot && path.resolve(monorepoWorkspaceRoot) !== path.resolve(serverRoot) ? [monorepoWorkspaceRoot] : [])];
					for (const root of rootsToTry) {
						const rootPosix = toPosix(root).replace(/\/$/, '');
						const absPosix = `${rootPosix}${spec.startsWith('/') ? '' : '/'}${spec}`;
						const fsId = `/@fs${absPosix}`;
						if (resolveCandidateFilePath(fsId, serverRoot, monorepoWorkspaceRoot)) {
							const r = await transformWithTimeout(fsId);
							if (r?.code) {
								transformed = r;
								resolvedCandidate = fsId;
								break;
							}
						}
					}
				} catch {}
			}
			// Fallback 3: try adding ?import to hint Vite's transform pipeline
			if (!transformed?.code) {
				for (const cand of transformCandidates) {
					try {
						const r = await transformWithTimeout(`${cand}${cand.includes('?') ? '&' : '?'}import`);
						if (r?.code) {
							transformed = r;
							resolvedCandidate = `${cand}?import`;
							break;
						}
					} catch {}
				}
			}
			// Solid HMR: patch @@solid-refresh's $$refreshESM to do inline patching
			// during module re-evaluation instead of deferring to hot.accept() callback.
			// In NativeScript's HTTP ESM environment, accept callbacks are registered
			// but not invoked by the HMR client. By adding a direct patchRegistry()
			// call when hot.data already has a stored registry, component updates
			// apply immediately when the module re-evaluates.
			try {
				if (transformed?.code && strategy?.flavor === 'solid' && (resolvedCandidate || spec || '').includes('@solid-refresh')) {
					const PATCH_SENTINEL = '/* __ns_solid_refresh_patched__ */';
					const alreadyPatched = transformed.code.includes(PATCH_SENTINEL);
					if (verbose) {
						console.log('[hmr-ws][solid] @solid-refresh patch check:', { spec: resolvedCandidate || spec, alreadyPatched, codeLen: transformed.code.length });
					}
					if (!alreadyPatched) {
						let patchedCode = transformed.code;

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

						// Work on a copy to avoid mutating Vite's cached TransformResult
						transformed = { ...transformed, code: patchedCode };
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
						if (strategy?.flavor === 'typescript') {
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
				// Generic bare module resolution via Vite plugin container
				if (isBare) {
					try {
						const resolved = await server.pluginContainer?.resolveId?.(spec, undefined);
						const resolvedId = typeof resolved === 'string' ? resolved : resolved?.id || null;
						if (resolvedId) {
							const r = await server.transformRequest(resolvedId);
							if (r?.code) {
								transformed = r;
								resolvedCandidate = resolvedId;
							}
						}
					} catch {}
				}
				if (!transformed?.code) {
					// Emit a module that throws with context for easier on-device debugging
					try {
						const tried = Array.from(new Set(transformCandidates.length > 0 ? transformCandidates : candidates)).slice(0, 12);
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
			}
			let code = transformed.code;
			// Prepend guard to capture any URL-based require attempts
			code = REQUIRE_GUARD_SNIPPET + code;
			code = cleanCode(code, strategy);
			const isNodeMod = /(?:^|\/)node_modules\//.test(resolvedCandidate || spec || '');
			code = processCodeForDevice(code, false, true, isNodeMod, resolvedCandidate || spec);
			// Solid HMR: The NativeScript iOS/Android runtime provides import.meta.hot
			// natively (via InitializeImportMetaHot in HMRSupport.mm) with C++-backed
			// persistent hot.data that survives across module re-evaluations.
			// cleanCode() strips Vite's __vite__createHotContext assignment, which is
			// correct — the runtime's native hot context is better.
			const projectRoot = server.config?.root || process.cwd();
			const serverOrigin = getServerOrigin(server);
			if (strategy?.flavor === 'angular') {
				code = prepareAngularEntryForDevice(code, resolvedCandidate || spec, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, serverOrigin, true);
			} else {
				code = rewriteImports(code, resolvedCandidate || spec, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, serverOrigin, true);
			}

			// Expand `export * from "url"` into explicit named re-exports.
			// NativeScript's HTTP ESM loader may not propagate star-re-exports across
			// HTTP module boundaries (the namespace object gets direct exports but
			// misses re-exported names). By expanding to `export { a, b } from "url"`,
			// the engine sees explicit named exports and resolves them correctly.
			try {
				code = await expandStarExports(code, server, server.config?.root || process.cwd(), verbose, sharedTransformRequest);
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
				code = ensureGuardPlainDynamicImports(code, getServerOrigin(server));
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
			// Defensive export normalization: if a module defines `routes` and only exports it named,
			// add a default export alias so both `import { routes }` and `import routes` work.
			try {
				if (!/\bexport\s+default\b/.test(code)) {
					const hasNamedRoutes = /\bexport\s*\{\s*routes\s*\}/.test(code);
					const hasConstRoutes = /\bconst\s+routes\s*=/.test(code) || /\bvar\s+routes\s*=/.test(code) || /\blet\s+routes\s*=/.test(code);
					if (hasNamedRoutes && hasConstRoutes) {
						code += `\nexport default routes;\n`;
					}
				}
			} catch {}

			// `/ns/rt` and `/ns/core` URL versioning.
			//
			// Older versions of the server emitted `/ns/rt/<ver>` and
			// `/ns/core/<ver>` so V8's HTTP module cache would see a
			// fresh URL on every save. The runtime canonicalizer
			// (`CanonicalizeHttpUrlKey` in HMRSupport.mm) collapses
			// these version segments to the bare `/ns/rt` and
			// `/ns/core` keys before lookup, so V8 actually saw a
			// single cache entry — but the server was doing extra
			// work to inject a version segment that the runtime then
			// immediately stripped. Now that the runtime supports
			// explicit eviction (and these bridge endpoints don't
			// change at HMR time anyway), the version segment is
			// purely vestigial.
			//
			// Rather than rip the helpers out (which would touch
			// every ensureVersionedImports caller and risk bumping
			// older runtimes), we keep them but pass `verNum=0`. The
			// helpers still normalize URL shape (strip the absolute
			// origin prefix when present) but emit a stable
			// `/ns/rt/0` / `/ns/core/0` URL — which collapses to
			// `/ns/rt` / `/ns/core` in the runtime.
			try {
				const verNum = 0;
				code = ensureVersionedRtImports(code, getServerOrigin(server), verNum);
				code = strategy.ensureVersionedImports?.(code, getServerOrigin(server), verNum) ?? code;
			} catch {}
			// `/ns/m` URL finalize step.
			//
			// `rewriteNsMImportPathForHmr` is a canonicalizer: it
			// strips legacy `__ns_hmr__/<tag>/` segments and adds
			// `__ns_boot__/b1/` only for boot-tagged requests. The
			// `ver` parameter is preserved on the signature for API
			// compatibility but is ignored for app modules (cache
			// busting is driven by `__nsInvalidateModules`, not URL
			// versioning). We pass `'v0'` as a stable placeholder —
			// the canonicalizer emits the same URL regardless of
			// this value, but a constant placeholder makes the
			// contract explicit.
			//
			// SFC URLs (line below, `/ns/sfc/${verTag}/...`) still
			// embed a version because the Vue SFC pathway does not
			// yet have an eviction protocol. The runtime
			// canonicalizer does NOT strip `/ns/sfc/<ver>/`, so Vue
			// users still see per-save SFC re-fetches — that's a
			// known follow-up.
			try {
				const verTag = (() => {
					const numeric = getNumericServeVersionTag(forcedVer, Number(options.getGraphVersion() || 0));
					return numeric > 0 ? `v${numeric}` : 'v0';
				})();
				const origin = getServerOrigin(server);
				const rewritePath = (p: string) => rewriteNsMImportPathForHmr(p, 'v0', bootTaggedRequest);
				// /ns/m URL forms — all collapse to canonical stable
				// URLs via the Phase 3a rewriter.
				// 1) Static imports: import ... from "/ns/m/..."
				code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
				// 2) Side-effect imports: import "/ns/m/..."
				code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
				// 3) Dynamic imports: import("/ns/m/...")
				code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
				// 4) new URL("/ns/m/...", import.meta.url)
				code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
				// 5) __ns_import(new URL('/ns/m/...', import.meta.url).href)
				code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
				// 6) Force absolute HTTP for new URL('/ns/m/...', import.meta.url).href → canonical stable URL.
				try {
					code = code.replace(/new\s+URL\(\s*["'](\/ns\/m\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}${rewritePath(p1)}`)}`);
				} catch {}
				// 7) SFC URLs (Vue) — still versioned. See header comment.
				try {
					code = code.replace(/new\s+URL\(\s*["']\/ns\/sfc(\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}/ns/sfc/${verTag}${p1}`)}`);
				} catch {}
			} catch {}
			// Final guard: eliminate any lingering named imports from /ns/core to avoid
			// evaluation-time "does not provide an export named ..." in the device runtime.
			try {
				code = ensureDestructureCoreImports(code);
			} catch {}

			// Boot-time module graph progress: while the app is still replacing the
			// placeholder, emit lightweight progress updates as /ns/m modules begin
			// evaluating. This keeps the overlay moving during large initial graphs.
			try {
				if (bootTaggedRequest) {
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
									// Resolve to local project path and transform with same candidate logic as /ns/m handler
									let local = u.pathname.replace(/^\/ns\/m/, '');
									try {
										// Normalize project-relative path
										if (local.startsWith('@/')) local = APP_VIRTUAL_WITH_SLASH + local.slice(2);
										if (local.startsWith('./')) local = local.slice(1);
										if (!local.startsWith('/')) local = '/' + local;
										const hasExt = /(\.ts|\.tsx|\.js|\.jsx|\.mjs|\.mts|\.cts|\.vue)$/i.test(local);
										const baseNoExt = hasExt ? local.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : local;
										const cands = [...(hasExt ? [local] : []), baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs'];
										let t: TransformResult | null = null;
										for (const cand of cands) {
											try {
												const r = await server.transformRequest(cand);
												if (r?.code) {
													t = r;
													break;
												}
											} catch {}
											if (t?.code) break;
										}
										if (!t?.code) {
											try {
												const rid = await server.pluginContainer?.resolveId?.(local, undefined);
												const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
												if (ridStr) {
													const r2 = await server.transformRequest(ridStr);
													if (r2?.code) t = r2;
												}
											} catch {}
										}
										targetCode = t?.code || '';
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
			res.statusCode = 200;
			res.end(code);
		} catch (e) {
			console.warn('[sfc-asm] error serving', req.url, e && (e as any).message ? (e as any).message : e);
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
