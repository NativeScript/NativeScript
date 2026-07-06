import type { TransformResult, ViteDevServer } from 'vite';
import * as path from 'path';

import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';

import { sanitizeStrayCoreReferences } from './core-sanitize.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { isRuntimeGraphExcludedPath } from './runtime-graph-filter.js';
import { buildPiniaVendorShim, buildVueVendorShim } from './vendor-bare-module-shims.js';
import { canonicalizeNsMImportPath } from './websocket-ns-m-paths.js';
import { setDeviceModuleHeaders } from './route-helpers.js';
import { CSS_MODULE_RE, buildCssRegisterSnippetFromVar, normalizeCssForDevice } from './css-device-module.js';
import { filterExistingNodeModulesTransformCandidates, getBlockedDeviceNodeModulesReason, resolveCandidateFilePath, stripDecoratedServePrefixes, tryReadRawExplicitJavaScriptModule } from './websocket-module-specifiers.js';
import { assertNoOptimizedArtifacts, buildBootProgressSnippet, canonicalizeRtImports, classifyServedModule, dedupeRtNamedImportsAgainstDestructures, deduplicateLinkerImports, ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, expandStarExports, hoistTopLevelStaticImports, MODULE_IMPORT_ANALYSIS_PLUGINS, wrapCommonJsModuleForDevice } from './websocket-served-module-helpers.js';
import { cleanCode, collectImportDependencies, processCodeForDevice, rewriteImports } from './websocket-device-transform.js';
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

// Minimal valid ESM body for "no component update available": the iOS HTTP
// ESM loader (`LoadHttpModuleForUrl`) rejects empty bodies even on HTTP 200,
// so an actual empty response would crash the component's `_HmrLoad` import.
const NG_COMPONENT_NO_UPDATE_STUB = '// [ns:m] no Angular component update for this request — substituted with valid empty module to satisfy iOS HTTP loader (rejects empty bodies)\nexport {};\n';

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
				// Boot-fetch gate: every compiled component runs
				// `<Class>_HmrLoad(Date.now())` on evaluation, so every cold
				// boot hits this route for every component. Analog serves a
				// REAL metadata-replacement payload whenever the component's
				// module was invalidated at any point in the dev server's
				// lifetime (Vite's `lastInvalidationTimestamp` never resets),
				// and a boot-time `ɵɵreplaceMetadata` on the root component
				// tears down the PageRouterOutlet frame — the "relaunch after
				// an HMR edit → white screen" failure. Only fetches echoing a
				// forwarded `angular:component-update` broadcast's exact
				// `(id, t)` pair may reach Analog; a fresh boot already
				// evaluates the latest transformed source and never needs a
				// replacement payload.
				const isLiveUpdateFetch = options.isLiveAngularComponentUpdateFetch;
				if (isLiveUpdateFetch) {
					const componentId = urlObj.searchParams.get('c') || '';
					const timestampRaw = urlObj.searchParams.get('t');
					// `Number(null)` is 0 — require an actual `t` param.
					const timestamp = timestampRaw ? Number(timestampRaw) : NaN;
					if (!componentId || !Number.isFinite(timestamp) || !isLiveUpdateFetch(componentId, timestamp)) {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'text/javascript');
						res.setHeader('Cache-Control', 'no-cache');
						res.end(NG_COMPONENT_NO_UPDATE_STUB);
						return;
					}
				}
				const chunks: string[] = [];
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
						body = NG_COMPONENT_NO_UPDATE_STUB;
					}
					try {
						res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
					} catch {}
					return (origEnd as (data: string) => unknown)(body);
				};
				return next();
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
			// Support both query (?path=/abs) and path-style (/ns/m/abs)
			let spec = urlObj.searchParams.get('path') || '';
			if (!spec) {
				const base = '/ns/m';
				const rest = urlObj.pathname.slice(base.length);
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
			// Tolerate LEGACY path-based boot/HMR prefixes from stale cached
			// device code (`/ns/m/__ns_boot__/b1/…`, `/ns/m/__ns_hmr__/<tag>/…`).
			// Current servers never emit them — freshness is eviction-driven.
			try {
				spec = stripDecoratedServePrefixes(spec).cleanedSpec;
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

			// Deps-bundle shim short-circuit: a bundled node_modules module is
			// served as a thin registry shim (see deps-bundle.ts) — the whole
			// transform pipeline below is skipped. Non-bundled specs (no
			// recording yet, CJS files, build failure) fall through unchanged.
			if (depsBundle && spec.includes('/node_modules/')) {
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
			// Final-response memo (see ns-m-response-memo.ts): identical
			// (spec, transform output, context) → identical served body, so repeat
			// serves skip the post-processing pipeline. The graph version in the
			// context conservatively invalidates on any live edit — star-export
			// expansion and the link-check read other modules, so this module's
			// own transform hash is not sufficient.
			const memoContext = `${strategy?.flavor || ''}|${getServerOrigin(server)}|${options.getGraphVersion()}|${resolvedCandidate || ''}`;
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
			code = processCodeForDevice(code, false, true, isNodeMod, resolvedCandidate || spec);
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
			// `/ns/m` URL finalize step.
			//
			// `canonicalizeNsMImportPath` strips any `__ns_hmr__/<tag>/`
			// and `__ns_boot__/b1/` segments so every emitted URL is the
			// canonical stable form (cache busting is driven by
			// `__NS_DEV__.invalidateModules` + the runtime's eviction nonce, not
			// URL decoration).
			try {
				const origin = getServerOrigin(server);
				const rewritePath = (p: string) => canonicalizeNsMImportPath(p);
				// /ns/m URL forms — all collapse to canonical stable
				// URLs via the `rewriteNsMImportPathForHmr` rewriter.
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
				// 7) SFC URLs (Vue) — canonical, like everything else. Freshness
				// is driven by the Vue client evicting the SFC artifact URL set.
				try {
					code = code.replace(/new\s+URL\(\s*["']\/ns\/sfc(\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}/ns/sfc${p1}`)}`);
				} catch {}
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
