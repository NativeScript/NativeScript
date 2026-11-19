import type { Connect, ViteDevServer } from 'vite';
import { rewriteDeviceImportsInResponse } from './device-imports.js';
import { recordServedModuleOnFinish } from './served-modules.js';

/** Path prefix of the dev server's own NativeScript endpoints. */
export const NS_DEV_ROUTE_PREFIX = '/__ns_dev__/';

// The device loader appends `__ns_dev_nonce` to re-fetches of evicted modules
// to defeat OS HTTP caches. It is transport-only: never part of the device's
// module key, so it must not reach Vite's graph or any middleware's routing.
const devNonceRE = /(\?|&)__ns_dev_nonce=[^&]*(?:&|$)/;
const trailingSeparatorRE = /[?&]$/;

export function stripDevNonce(url: string): string {
	return url.replace(devNonceRE, '$1').replace(trailingSeparatorRE, '');
}

/**
 * What every device request goes through before any other middleware: the
 * nonce is stripped, a JavaScript response's imports are rewritten for the
 * device runtime (`device-imports.ts`), and a module response is recorded as
 * served.
 */
export function createDeviceRequestMiddleware(server: Pick<ViteDevServer, 'config' | 'environments'>, getOrigin: () => string, beforeNext?: () => Promise<void>): Connect.NextHandleFunction {
	return (req, res, next) => {
		if (req.url) req.url = stripDevNonce(req.url);
		const withOriginal = req as typeof req & { originalUrl?: string };
		if (withOriginal.originalUrl) withOriginal.originalUrl = stripDevNonce(withOriginal.originalUrl);
		if (!req.url?.startsWith(NS_DEV_ROUTE_PREFIX)) recordServedModuleOnFinish(server, req, res);
		rewriteDeviceImportsInResponse(req, res, getOrigin);
		if (!beforeNext) return next();
		beforeNext().then(
			() => next(),
			() => next(),
		);
	};
}

/**
 * Runs `handle` ahead of every middleware already registered, Vite's own and
 * those of `enforce: 'pre'` plugins included.
 */
export function useFirst(middlewares: Connect.Server, handle: Connect.NextHandleFunction): void {
	middlewares.stack.unshift({ route: '', handle });
}
