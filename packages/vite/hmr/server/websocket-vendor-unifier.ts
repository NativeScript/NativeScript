import type { ViteDevServer } from 'vite';

import type { FrameworkServerStrategy } from './framework-strategy.js';

export interface RegisterVendorUnifierHandlerOptions {
	getGraphVersion(): number;
	getServerOrigin(server: ViteDevServer): string;
	getStrategy(): FrameworkServerStrategy;
}

function setJavascriptResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

export function shouldHandleVendorUnifierPath(pathname: string): boolean {
	if (/^\/ns\/(?:rt|core)(?:\/|$)/.test(pathname)) {
		return false;
	}
	if (!/(\.m?js$|\.ts$|\/node_modules\/|\/\.vite\/deps\/|^\/@id\/|^\/@fs\/)/.test(pathname)) {
		return false;
	}
	if (/\.css($|\?)/.test(pathname)) {
		return false;
	}
	return true;
}

export function maybeRewriteVendorModule(code: string, strategy: FrameworkServerStrategy, origin: string, version: number): string {
	const rewrite = strategy.rewriteVendorSpec;
	if (!rewrite) {
		return code;
	}
	return rewrite(code, origin, version);
}

export function registerVendorUnifierHandler(server: ViteDevServer, options: RegisterVendorUnifierHandlerOptions): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const reqUrl = req.url || '';
			const urlObj = new URL(reqUrl, 'http://localhost');
			const pathname = urlObj.pathname || '';
			if (!shouldHandleVendorUnifierPath(pathname)) return next();

			const transformed = await server.transformRequest(reqUrl);
			if (!transformed?.code) return next();

			const strategy = options.getStrategy();
			const rewritten = maybeRewriteVendorModule(transformed.code, strategy, options.getServerOrigin(server), options.getGraphVersion());
			if (rewritten === transformed.code) return next();

			setJavascriptResponseHeaders(res);
			res.statusCode = 200;
			res.end(rewritten);
		} catch {
			return next();
		}
	});
}
