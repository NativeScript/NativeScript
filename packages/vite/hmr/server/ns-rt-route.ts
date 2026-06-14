import type { ViteDevServer } from 'vite';

import { getProjectRootPath } from '../../helpers/project.js';
import { buildNsRtBridgeModule, discoverNsvBridgeExports } from './ns-rt-bridge.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';
import { setDeviceModuleHeaders } from './route-helpers.js';

export interface NsRtRouteOptions {
	// Current HMR graph version, read lazily — the version advances on live
	// edits and tags `/ns/rt/<ver>` so the device busts its module cache.
	getGraphVersion(): number;
}

// ESM runtime bridge for NativeScript-Vue: `GET /ns/rt[/<ver>]`.
//
// Serves a single authoritative source of Vue helpers bound to the
// NativeScript renderer. The bridge lazily resolves helpers from the vendor
// registry on first evaluation (it does not statically import `vue`), then
// re-exports them so SFCs can call them during module evaluation. The shared
// `buildNsRtBridgeModule` owns the body (preamble, passthroughs, HMR shims,
// polyfills, default export); discovery is the only source of truth for which
// vendor symbols are forwarded.
export function registerNsRtBridgeRoute(server: ViteDevServer, options: NsRtRouteOptions): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			// Accept only /ns/rt and /ns/rt/<ver> for cache-busting semantics
			if (!(urlObj.pathname === '/ns/rt' || /^\/ns\/rt\/[\d]+$/.test(urlObj.pathname))) return next();
			setDeviceModuleHeaders(res);
			const rtVerSeg = urlObj.pathname.replace(/^\/ns\/rt\/?/, '');
			const rtVer = /^[0-9]+$/.test(rtVerSeg) ? rtVerSeg : String(options.getGraphVersion() || 0);
			const vendorExports = discoverNsvBridgeExports(getProjectRootPath());
			const code = buildNsRtBridgeModule({ rtVer, requireGuardSnippet: REQUIRE_GUARD_SNIPPET, vendorExports });
			res.statusCode = 200;
			res.end(code);
		} catch (err) {
			// Don't fail silently: a broken /ns/rt bridge leaves the device unable
			// to resolve the unified Vue runtime, so surface the cause.
			console.error('[ns-rt] failed to build the /ns/rt runtime bridge module:', (err as Error)?.message || err);
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});
}
