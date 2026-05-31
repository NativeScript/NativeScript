import type { ViteDevServer } from 'vite';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { buildRuntimeConfig } from './import-map.js';

export interface RegisterImportMapRouteOptions {
	/** The active framework strategy — only its `flavor` is consulted. */
	getStrategy: () => FrameworkServerStrategy | undefined;
}

/**
 * Registers the device import-map endpoint: `GET /ns/import-map.json`.
 *
 * Returns the import map + runtime config consumed by `__nsConfigureRuntime()`
 * on the device during cold boot. Extracted verbatim from
 * `createHmrWebSocketPlugin`; the only injected dependency is the active
 * framework strategy (for its `flavor`).
 */
export function registerImportMapRoute(server: ViteDevServer, options: RegisterImportMapRouteOptions): void {
	const { getStrategy } = options;
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (urlObj.pathname !== '/ns/import-map.json') return next();

			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			const host = req.headers.host || 'localhost:5173';
			const protocol = 'http';
			const origin = `${protocol}://${host}`;

			const runtimeConfig = buildRuntimeConfig({
				origin,
				flavor: getStrategy()?.flavor || 'typescript',
			});

			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify(
					{
						importMap: JSON.parse(runtimeConfig.importMap),
						volatilePatterns: runtimeConfig.volatilePatterns,
					},
					null,
					2,
				),
			);
		} catch (err: any) {
			console.error('[import-map] error generating import map:', err?.message || err);
			res.statusCode = 500;
			res.end(JSON.stringify({ error: 'Failed to generate import map' }));
		}
	});
}
