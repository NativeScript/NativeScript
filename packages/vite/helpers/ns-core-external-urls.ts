import type { Plugin } from 'vite';
import { buildCoreUrl, corePathToSub, specToCoreSub } from './ns-core-url.js';
import { resolveDeviceReachableOrigin } from './dev-host.js';
import { getMonorepoWorkspaceRoot } from './project.js';
import { normalizeModuleId } from './normalize-id.js';
import type { Platform } from './platform-types.js';

export interface NsCoreExternalUrlsPluginOptions {
	platform: Platform;
	projectRoot: string;
	/** Resolved @nativescript/core root (workspace source or node_modules install). */
	nsCoreRoot: string;
	hmrPort: number;
	useHttps: boolean;
}

/**
 * HMR builds only: rewrite every bare `@nativescript/core*` specifier to the
 * full /ns/core HTTP URL so bundle.mjs contains NO bundled copy of the core
 * runtime. The plugin runs with enforce:'pre' so it fires BEFORE Vite's alias
 * resolution converts bare specifiers to absolute filesystem paths, and
 * apply:'build' so the dev-server transform pipeline (which has its own
 * import-map) is unaffected.
 *
 * Why this is necessary: core's transitively-bundled helpers (e.g.
 * `@nativescript/zone-js` patches) write `import '@nativescript/core/globals'`
 * in their source. Without this interception, rolldown leaves those as bare
 * specifiers in the emitted bundle.mjs output, iOS's ESM loader can't resolve
 * bare specifiers at module-instantiation time (the runtime import map is
 * installed later by the HMR client), and it falls back to a filesystem
 * lookup that crashes with
 * "Module not found: Cannot find module @nativescript/core/globals".
 *
 * The broader architecture: Vite is the single source of truth for every
 * `@nativescript/core` URL on the device, so this build-time pre-resolver
 * routes every reference into the runtime bridge.
 */
export function nsCoreExternalUrlsPlugin(opts: NsCoreExternalUrlsPluginOptions): Plugin {
	const { platform, projectRoot, nsCoreRoot, hmrPort, useHttps } = opts;
	// Routes through `resolveDeviceReachableOrigin` so the origin baked into
	// externalized `@nativescript/core*` URLs is something the DEVICE can
	// reach. Wildcard binds (`0.0.0.0`) and Android loopback get remapped to
	// a real LAN IP (preferred) or `10.0.2.2` (Android emulator). Same helper
	// used by `main-entry.ts` so both code paths produce byte-identical URL
	// strings — required by the iOS HTTP ESM cache identity rule.
	//
	// Protocol baked into externalized @nativescript/core URLs must match the
	// dev server's protocol. `NS_HTTPS` is the single switch (it also drives
	// the server TLS + `wss` HMR socket); `NS_HMR_PROTO` remains an explicit
	// override when set.
	const proto: 'http' | 'https' = (process.env.NS_HMR_PROTO ? process.env.NS_HMR_PROTO === 'https' : useHttps) ? 'https' : 'http';
	const { origin } = resolveDeviceReachableOrigin({
		host: process.env.NS_HMR_HOST,
		platform,
		protocol: proto,
		port: hmrPort,
	});
	return {
		name: 'ns-core-external-urls',
		enforce: 'pre',
		apply: 'build',
		async resolveId(source: string, importer: string | undefined) {
			// Route every `@nativescript/core*` reference (bare specifier OR
			// absolute path into the installed @nativescript/core package OR
			// its subpath import-map aliases) through the ONE canonical URL
			// generator. URL proliferation (`?p=`, versioned, mixed query vs
			// path forms) produces distinct iOS HTTP ESM cache entries for
			// the same module, yielding double evaluation.
			const sub = specToCoreSub(source);
			if (sub !== null) {
				if (process.env.NS_CORE_EXTERNAL_DEBUG) {
					console.log('[ns-core-external]', 'source=', source, 'sub=', sub, 'importer=', importer?.slice(-80));
				}
				const url = buildCoreUrl(origin, sub);
				return { id: url, external: 'absolute' };
			}
			// Monorepo-source core (`<workspace>/packages/core` via a file:
			// dependency). The resolve-alias step runs BEFORE this hook and
			// rewrites bare `@nativescript/core[/sub]` specifiers to absolute
			// paths under NS_CORE_ROOT; for a node_modules install those
			// still match specToCoreSub above, but workspace-source paths do
			// not — without this branch the entire core library is silently
			// inlined into bundle.mjs as a dead second realm
			// (`Frame.topmost()` undefined on tap while the served realm owns
			// the live UI).
			//
			// These must NOT map to `/ns/core/<sub>`: in the monorepo, the
			// served core graph's internal imports resolve to
			// workspace-relative `/ns/m/packages/core/<file>` URLs (Vite
			// emits `/@fs/`-style ids for files outside the app root; see
			// rewriteFsAbsoluteToNsM). A `/ns/core/<sub>` URL would serve a
			// SECOND body for the same file in the same realm — its
			// side-effect registrations re-run against shared classes and
			// crash (`Cannot redefine property: default:width` from
			// CssAnimationProperty.register). Resolve to the concrete file
			// and emit the same `/ns/m/<workspace-rel>` spelling the served
			// graph uses so the bundle joins the live realm.
			if (corePathToSub(source, nsCoreRoot) === null) return null;
			const wsRoot = getMonorepoWorkspaceRoot(projectRoot);
			const wsRootNorm = wsRoot ? normalizeModuleId(wsRoot).replace(/\/+$/, '') : '';
			const resolved = await this.resolve(source, importer, { skipSelf: true });
			const fileAbs = normalizeModuleId(((resolved && resolved.id) || source).split('?')[0]);
			if (process.env.NS_CORE_EXTERNAL_DEBUG) {
				console.log('[ns-core-external:workspace]', 'source=', source, 'file=', fileAbs, 'importer=', importer?.slice(-80));
			}
			if (wsRootNorm && fileAbs.startsWith(wsRootNorm + '/')) {
				return { id: `${origin}/ns/m/${fileAbs.slice(wsRootNorm.length + 1)}`, external: 'absolute' as const };
			}
			// Could not anchor the resolved file under the workspace root —
			// fall back to the canonical bridge URL rather than inlining a
			// core copy.
			const fallbackSub = corePathToSub(fileAbs, nsCoreRoot) ?? corePathToSub(source, nsCoreRoot);
			console.warn('[ns-core-external] workspace-core path could not be anchored under the workspace root; using /ns/core bridge URL for', source);
			return { id: buildCoreUrl(origin, fallbackSub), external: 'absolute' as const };
		},
	};
}
