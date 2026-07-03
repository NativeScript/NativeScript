import type { TransformResult, ViteDevServer } from 'vite';

import { isDirectoryIndexFilename, rewriteSpecifiersForDevice, type RelativeBase } from './core-sanitize.js';
import { buildDefaultExportFooter, buildShapeInstallHeader, hasNamespaceReExport, rewriteNamespaceReExportsForShape } from './ns-core-cjs-shape.js';
import { getCliFlags } from '../../helpers/cli-flags.js';
import { normalizeCoreSub as normalizeCoreSubCanonical } from '../../helpers/ns-core-url.js';
import { parseCoreBridgeRequest, resolveRuntimeCoreModulePath, collectStaticExportNamesFromFile } from './websocket-core-bridge.js';
import { setDeviceModuleHeaders } from './route-helpers.js';
import { getServerOrigin } from './server-origin.js';
import { resolveVerboseFlag } from '../../helpers/logging.js';
import { CORE_BUNDLE_PATH, buildCoreMainShimCode, buildCoreSubShimCode, getSharedCoreBundleService, isCorePerModuleServingEnabled, type CoreBundleService } from './core-bundle.js';

type SharedTransformRequestFn = (url: string, timeoutMs?: number) => Promise<TransformResult | null>;

/**
 * Plugin-closure dependencies the `/ns/core` bridge needs: the shared transform
 * runner (holds/derives per-server state and doubles as a testability seam),
 * injected to keep the bridge in its own module. The device origin comes from
 * the directly-imported `getServerOrigin` (spy via the module in tests).
 */
export interface RegisterNsCoreRouteOptions {
	getGraphVersion(): number;
	sharedTransformRequest: SharedTransformRequestFn;
	/**
	 * Injectable core-bundle service (testability seam). When omitted, the
	 * shared process-wide service is used — unless `NS_CORE_PER_MODULE=1`
	 * disables bundle mode entirely.
	 */
	coreBundle?: CoreBundleService | null;
}

/**
 * Registers the `@nativescript/core` device bridge on the dev server:
 *   - a catch-all that rewrites stray `/node_modules/@nativescript/core/*`
 *     requests to the canonical `/ns/core[/<sub>]` URL,
 *   - `GET /ns/core-bundle.mjs` (bundle mode) — the single-eval core bundle, and
 *   - `GET /ns/core[/<sub>]` — the canonical core URL space. In bundle mode
 *     (default) these serve thin shims over the bundle; with
 *     `NS_CORE_PER_MODULE=1` (core maintainers editing core source in the
 *     monorepo) each core module is served/transformed individually so core
 *     edits participate in HMR. Either way this URL family is the ONE place
 *     @nativescript/core reaches the device (single module realm, shared class
 *     identities, one-time `register()`).
 */
export function registerNsCoreRoute(server: ViteDevServer, options: RegisterNsCoreRouteOptions): void {
	const verbose = resolveVerboseFlag();
	const coreBundle: CoreBundleService | null = options.coreBundle !== undefined ? options.coreBundle : isCorePerModuleServingEnabled() ? null : getSharedCoreBundleService(server);

	if (coreBundle) {
		// Warm the bundle build in the background so the first device request
		// doesn't pay the esbuild cost (parallels the vendor bundle warmup).
		void coreBundle.ensureBuilt();

		// GET /ns/core-bundle.mjs — the single-eval core payload.
		server.middlewares.use(async (req, res, next) => {
			try {
				const urlObj = new URL(req.url || '', 'http://localhost');
				if (urlObj.pathname !== CORE_BUNDLE_PATH) return next();
				const state = await coreBundle.ensureBuilt();
				if (!state) {
					res.statusCode = 503;
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: 'core-bundle-build-failed' }));
					return;
				}
				setDeviceModuleHeaders(res);
				res.statusCode = 200;
				res.end(state.code);
			} catch (e) {
				console.warn('[ns-core-bundle] serve failed:', (e as any)?.message);
				next();
			}
		});
	}

	// Per-sub named-export discovery for bundle-mode shims, memoized for the
	// session (same disk walker the per-module bridge uses for its own
	// export-name guarantees; see collectStaticExportOriginsFromFile).
	const subExportNamesCache = new Map<string, Promise<string[]>>();
	const resolveModuleIdViaVite = async (moduleId: string): Promise<string | null> => {
		const resolved = await server.pluginContainer?.resolveId?.(moduleId, undefined);
		return typeof resolved === 'string' ? resolved : resolved?.id || null;
	};
	const getSubShimExportNames = (canonicalSub: string): Promise<string[]> => {
		let pending = subExportNamesCache.get(canonicalSub);
		if (!pending) {
			pending = (async () => {
				try {
					const modulePath = await resolveRuntimeCoreModulePath(canonicalSub, resolveModuleIdViaVite);
					if (!modulePath) return [];
					return collectStaticExportNamesFromFile(modulePath);
				} catch {
					return [];
				}
			})();
			subExportNamesCache.set(canonicalSub, pending);
		}
		return pending;
	};
	const warnedFallbackSubs = new Set<string>();
	// Catch-all redirect for stray /node_modules/@nativescript/core/*
	// requests — route them to the /ns/core bridge so they get the same
	// __DEV__/__IOS__ preamble and specifier rewriting. Without this,
	// Vite's default /node_modules/ handler serves the raw file, which
	// references bare __DEV__ and crashes at module eval.
	server.middlewares.use((req, _res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			const coreNmPrefix = '/node_modules/@nativescript/core';
			if (!urlObj.pathname.startsWith(coreNmPrefix)) return next();
			const sub = urlObj.pathname.slice(coreNmPrefix.length).replace(/^\/+/, '');
			if (sub === '' || sub === 'index.js' || sub === 'index') {
				req.url = `/ns/core`;
			} else {
				req.url = `/ns/core/${sub}`;
			}
			return next();
		} catch {
			return next();
		}
	});

	// 2.6) ESM bridge for @nativescript/core: GET /ns/core[/<sub>]
	//
	// Since bundle.mjs no longer bundles @nativescript/core (it is
	// declared external in the rolldown config under HMR), this
	// endpoint is the ONE place core is evaluated. Every consumer —
	// bundle.mjs's own `@nativescript/core*` imports (resolved to
	// full HTTP URLs in the entry virtual module), externalized
	// vendor packages, HTTP-served app modules — all end up here.
	// No more proxy bridge, no enumeration, no namespace detection,
	// no prototype-polluted maps. We just serve Vite's authoritative
	// transformed module content.
	//
	// iOS caches by URL path, so each unique URL is evaluated exactly
	// once per app lifetime. Every class identity is shared, every
	// `register()` side effect runs once, every `Application` reference
	// is the same iosApp singleton. The entire class of "does not
	// provide an export named X" and "Cannot redefine property" errors
	// is eliminated by construction.
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			const coreRequest = parseCoreBridgeRequest(urlObj.pathname, urlObj.searchParams, Number(options.getGraphVersion() || 0));
			if (!coreRequest) return next();
			// Non-canonical incoming URL — every emitter is supposed
			// to canonicalize before hitting the device. Promote the
			// drift to a 301 redirect so iOS still gets the file at
			// the canonical URL (no realm split) but the offending
			// caller is forced to update. We log the offending raw
			// pathname so the regression source is easy to find.
			if (coreRequest.canonicalPath) {
				// Diagnostic only — the 301 below transparently serves the canonical file, so this is not a user-facing problem.
				if (verbose) {
					try {
						console.warn(`[ns-core-bridge] 301 ${urlObj.pathname}${urlObj.search} → ${coreRequest.canonicalPath} (non-canonical core URL — please update emitter)`);
					} catch {}
				}
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Location', coreRequest.canonicalPath);
				res.statusCode = 301;
				res.end();
				return;
			}
			setDeviceModuleHeaders(res);
			const { normalizedSub, sub } = coreRequest;

			// BUNDLE MODE (default): serve thin shims over /ns/core-bundle.mjs.
			// The canonical URL space is unchanged — only the response bodies
			// differ. Fall through to the per-module pipeline below when the
			// bundle build failed or when the requested subpath was excluded
			// from bundle enumeration (e.g. debugger/ modules). That fallback
			// is realm-safe: the per-module response's own core imports are
			// rewritten to `/ns/core/<sub>` URLs, which resolve to shims that
			// join the bundle realm.
			if (coreBundle) {
				const bundleState = await coreBundle.ensureBuilt();
				if (bundleState) {
					const canonicalSubForShim = normalizeCoreSubCanonical(normalizedSub || sub || '');
					if (!canonicalSubForShim) {
						res.statusCode = 200;
						res.end(buildCoreMainShimCode());
						return;
					}
					if (bundleState.subs.has(canonicalSubForShim)) {
						const exportNames = await getSubShimExportNames(canonicalSubForShim);
						res.statusCode = 200;
						res.end(buildCoreSubShimCode(canonicalSubForShim, exportNames));
						return;
					}
					if (!warnedFallbackSubs.has(canonicalSubForShim)) {
						warnedFallbackSubs.add(canonicalSubForShim);
						console.warn(`[ns-core-bundle] sub '${canonicalSubForShim}' not in bundle enumeration — serving per-module (realm-safe fallback)`);
					}
				}
			}

			const resolveModuleId = async (moduleId: string): Promise<string | null> => {
				const resolved = await server.pluginContainer?.resolveId?.(moduleId, undefined);
				return typeof resolved === 'string' ? resolved : resolved?.id || null;
			};

			let modulePath: string | null = null;
			if (sub) {
				const resolvedSubpath = normalizedSub || sub;
				modulePath = await resolveRuntimeCoreModulePath(resolvedSubpath, resolveModuleId);
				if (!modulePath) {
					modulePath = `/node_modules/@nativescript/core/${resolvedSubpath}`;
				}
			} else {
				modulePath = (await resolveModuleId('@nativescript/core')) || '/node_modules/@nativescript/core/index.js';
			}

			const transformed = await options.sharedTransformRequest(modulePath);
			if (!transformed?.code) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'core-transform-failed', modulePath, sub: sub || null }));
				return;
			}

			// Vite's transform output references module IDs with /@fs,
			// relative specifiers, or absolute project paths. Rewrite
			// those to URLs iOS can fetch over HTTP.
			//
			// We also thread a `RelativeBase` so any lingering relative
			// specifiers (`./x`, `../x`) — which Vite's import-analysis
			// sometimes leaves untouched for `node_modules` files — get
			// resolved against the served URL's logical directory and
			// rewritten to canonical `/ns/core/<resolved>` URLs.
			//
			// Without this, V8/iOS apply RFC 3986 URL resolution against
			// the served URL (which has no trailing slash) and treat the
			// last path segment as a *file*, so `./layout-helper-common`
			// from `/ns/core/utils/layout-helper` becomes
			// `/ns/core/utils/layout-helper-common` — a sibling that
			// doesn't exist, producing "Failed to load url … Does the
			// file exist?" from Vite and a stuck boot screen.
			const __rawSubForRel = String(normalizedSub || sub || '').replace(/^\/+|\/+$/g, '');
			const __isDirIndex = isDirectoryIndexFilename(modulePath || '');
			const __relBase: RelativeBase = { sub: __rawSubForRel, isDirectoryIndex: __isDirIndex };
			let rewritten = rewriteSpecifiersForDevice(transformed.code, getServerOrigin(server), Number(options.getGraphVersion() || 0), __relBase);

			// Invariant D (CJS/ESM interop shape) — EXPORT-SIDE fix.
			//
			// `@nativescript/core/index.js` declares namespace
			// re-exports like:
			//     export * as Utils from './utils';
			// The ES spec says these produce Module Namespace Objects
			// with [[Prototype]] = null. Consumers that reach them
			// via direct ESM import — `import { Utils } from
			// '@nativescript/core'` — get the raw null-proto value,
			// bypassing any CJS `require` shim we install. Most
			// consumers tolerate this, but CJS-style interop (most
			// notably zone.js's `patchMethod`) calls
			// `hasOwnProperty` on the target and crashes on
			// null-proto.
			//
			// We rewrite the re-export to a shape-wrapped const:
			//     import * as __ns_re_Utils__ from './utils';
			//     export const Utils = __NS_CJS_SHAPE__(__ns_re_Utils__);
			// so the EXPORT itself is a plain object — visible to
			// both ESM and CJS consumers consistently.
			//
			// We only pay the rewrite cost when the module actually
			// contains namespace re-exports (i.e., the main
			// `index.js`). Subpaths (`/utils`, `/http`, …) don't
			// re-export via `export * as`; they expose named
			// exports directly, so the rewrite is a no-op on them.
			if (hasNamespaceReExport(rewritten)) {
				rewritten = rewriteNamespaceReExportsForShape(rewritten);
			}

			// Prepend the build-time defines (__DEV__, __IOS__, __ANDROID__,
			// __APPLE__, …) that @nativescript/core source references directly.
			// Vite's `define` config substitutes these in user-code transforms but
			// skips node_modules by default; since core is now external and served
			// over HTTP from this endpoint, the served transformed code still has
			// bare identifiers like `if (__DEV__) …`. Without these consts, V8
			// hits `ReferenceError: __DEV__ is not defined` at module eval because
			// globalThis.__DEV__ is set by bundle.mjs's body AFTER all static
			// imports (including these core modules) have resolved.
			//
			// We inject LITERAL boolean values based on CLI flags + dev-server
			// mode rather than reading from globalThis, so the defines are
			// resolved even before bundle.mjs's body runs.
			const __cliFlags = getCliFlags() || {};
			const __platformIsAndroid = !!(__cliFlags as any).android;
			const __platformIsVisionOS = !!(__cliFlags as any).visionos;
			const __platformIsIOS = !__platformIsAndroid && !__platformIsVisionOS;
			const preamble = [
				`const __ANDROID__ = ${__platformIsAndroid ? 'true' : 'false'};`,
				`const __IOS__ = ${__platformIsIOS ? 'true' : 'false'};`,
				`const __VISIONOS__ = ${__platformIsVisionOS ? 'true' : 'false'};`,
				`const __APPLE__ = __IOS__ || __VISIONOS__;`,
				`const __DEV__ = ${server.config?.mode === 'development' ? 'true' : 'false'};`,
				`const __COMMONJS__ = false;`,
				`const __NS_WEBPACK__ = false;`,
				`const __NS_ENV_VERBOSE__ = globalThis.__NS_ENV_VERBOSE__ !== undefined ? !!globalThis.__NS_ENV_VERBOSE__ : false;`,
				`const __CSS_PARSER__ = 'css-tree';`,
				`const __UI_USE_XML_PARSER__ = true;`,
				`const __UI_USE_EXTERNAL_RENDERER__ = false;`,
				`const __TEST__ = false;`,
			].join('\n');

			// Boot-time instrumentation + module self-registration.
			//
			//   - URL canonicalization: the same logical module must
			//     always resolve to byte-identical URLs across every
			//     emitter. The /ns/core handler records the first URL
			//     seen for each canonical sub (or '' for main) in
			//     `globalThis.__NS_CORE_FIRST_URL__` and fails hard on
			//     mismatch so drift in any emitter surfaces
			//     immediately, before the realm splits.
			//   - CJS/ESM boot order: CommonJS
			//     `require('@nativescript/core/...')` calls from
			//     vendor install() hooks must resolve to the SAME
			//     ESM namespace that ran this side-effect preamble.
			//     The registration below keys the namespace object
			//     under BOTH the bare specifier and the canonical
			//     subpath (and raw subpath for back-compat) so the
			//     vendor shim's `createRequire` and the main-entry
			//     `_nsReq` hit on any lookup form.
			const rawSub = normalizedSub || sub || '';
			const canonicalSub = normalizeCoreSubCanonical(rawSub);
			const registrationKeySet = new Set<string>();
			registrationKeySet.add(canonicalSub ? `@nativescript/core/${canonicalSub}` : '@nativescript/core');
			registrationKeySet.add(canonicalSub);
			if (rawSub && rawSub !== canonicalSub) {
				registrationKeySet.add(`@nativescript/core/${rawSub}`);
				registrationKeySet.add(rawSub);
			}
			const registrationKeys = Array.from(registrationKeySet).map((k) => JSON.stringify(k));
			const canonicalUrl = `${getServerOrigin(server)}` + (canonicalSub ? `/ns/core/${canonicalSub}` : '/ns/core');
			const instrumentationHeader = [
				`/* @nativescript/core bridge — canonical URL: ${canonicalUrl} */`,
				`try { if (typeof globalThis !== 'undefined') {`,
				`  const __nsFirst = globalThis.__NS_CORE_FIRST_URL__ || (globalThis.__NS_CORE_FIRST_URL__ = Object.create(null));`,
				`  const __nsSeen = globalThis.__NS_CORE_FETCHED_URLS__ || (globalThis.__NS_CORE_FETCHED_URLS__ = []);`,
				`  const __nsKey = ${JSON.stringify(canonicalSub)};`,
				`  const __nsUrl = ${JSON.stringify(canonicalUrl)};`,
				`  __nsSeen.push(__nsUrl);`,
				`  if (typeof __nsFirst[__nsKey] === 'string' && __nsFirst[__nsKey] !== __nsUrl) {`,
				`    throw new Error('[ns-core] URL drift for sub=' + __nsKey + ': first=' + __nsFirst[__nsKey] + ' now=' + __nsUrl);`,
				`  }`,
				`  if (!__nsFirst[__nsKey]) __nsFirst[__nsKey] = __nsUrl;`,
				`  globalThis.__NS_CORE_EVAL_COUNT__ = (globalThis.__NS_CORE_EVAL_COUNT__ || 0) + 1;`,
				`} } catch (e) { console.warn('[ns-core] instrumentation failed:', (e && e.message) || e); }`,
			].join('\n');

			// CJS/ESM interop shape — REGISTRATION side.
			//
			// The actual shape installer runs earlier in the module
			// body (between preamble and selfImport; see
			// buildShapeInstallHeader). At this point we just read
			// globalThis.__NS_CJS_SHAPE__ and apply it to the self
			// namespace before registering under the CJS key space.
			//
			// Why shape self at registration: consumers that reach
			// `@nativescript/core` via `require()` (legacy vendors,
			// `globalThis.require` shim) look up the registry. They
			// expect a plain object (Object.prototype in chain) so
			// `.hasOwnProperty` / `.toString` work. Shaping once on
			// registration — the shape function is identity-preserving
			// via WeakMap — gives a stable, shared, CJS-compatible
			// view without copying on every require.
			const registrationFooter = [
				`try { if (typeof globalThis !== 'undefined') {`,
				`  const __nsReg = globalThis.__NS_CORE_MODULES__ || (globalThis.__NS_CORE_MODULES__ = Object.create(null));`,
				`  const __nsShapeFn = typeof globalThis.__NS_CJS_SHAPE__ === 'function' ? globalThis.__NS_CJS_SHAPE__ : function (x) { return x; };`,
				`  const __nsSelfRaw = (typeof __ns_core_self_ns__ !== 'undefined') ? __ns_core_self_ns__ : { default: undefined };`,
				`  const __nsSelf = __nsShapeFn(__nsSelfRaw);`,
				...registrationKeys.map((k) => `  __nsReg[${k}] = __nsSelf;`),
				`} } catch (e) { console.warn('[ns-core] self-register failed:', (e && e.message) || e); }`,
			].join('\n');

			// Bind `import * as __ns_core_self_ns__` to the module's
			// own export namespace so the footer can stash it into
			// the registry. Self-import is a no-op at eval time —
			// V8 resolves it to the module record we're already
			// evaluating and the final namespace is the same object
			// the registry receives. We use the CANONICAL URL here
			// so the self-import participates in Invariant A along
			// with every other @nativescript/core URL.
			const canonicalUrlForSelf = canonicalSub ? `/ns/core/${canonicalSub}` : '/ns/core';
			const selfImport = `import * as __ns_core_self_ns__ from ${JSON.stringify(canonicalUrlForSelf)};`;

			// Invariant D — SHAPE INSTALLER.
			//
			// Emits idempotent body-code that installs
			// globalThis.__NS_CJS_SHAPE__ BEFORE `rewritten`'s body
			// runs. This matters because the rewrite step above may
			// have produced statements like
			// `export const Utils = (typeof globalThis.__NS_CJS_SHAPE__ ...)(__ns_re_Utils__);`
			// that execute during module evaluation. Without the
			// installer running first, the ternary falls back to
			// identity — still safe, but the null-proto namespace
			// leaks through and consumers that expect a plain
			// object would still crash.
			//
			// Placement is important: BEFORE selfImport in the
			// concatenation. ESM imports are hoisted regardless of
			// textual position, but body code executes in source
			// order. Placing the installer first guarantees it
			// runs before any body statement in `rewritten`.
			//
			// Install is idempotent: `|| (globalThis.X = ...)` so
			// whichever /ns/core module evaluates first wins and
			// every subsequent module becomes a no-op.
			const shapeInstallHeader = buildShapeInstallHeader();

			// Invariant D — DEFAULT EXPORT BRIDGE.
			//
			// See `buildDefaultExportFooter` in ns-core-cjs-shape.ts
			// for the full rationale (consumer matrix, skip conditions,
			// why the default isn't shaped). The short version:
			// upstream rewrites turn `import { X } from '@nativescript/core'`
			// into a DEFAULT import, and the bridge has to provide one.
			const defaultExportFooter = buildDefaultExportFooter(rewritten);

			const moduleCode = [instrumentationHeader, preamble, shapeInstallHeader, selfImport, rewritten, defaultExportFooter, registrationFooter].join('\n');
			res.statusCode = 200;
			res.end(moduleCode);
		} catch (e) {
			console.warn('[ns-core-bridge] serve failed:', (e as any)?.message);
			next();
		}
	});
}
