import type { ViteDevServer } from 'vite';
import { statSync } from 'node:fs';
import path from 'node:path';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { buildRuntimeConfig } from './import-map.js';
import { getServerOrigin } from './server-origin.js';
import { viteUrlForFile } from './vite-url.js';

export const IMPORT_MAP_PATH = '/__ns_dev__/import-map.json';

/**
 * Device import map: each bare specifier points at the device URL of the file
 * Vite's client resolver picks for it. No prefix (`pkg/`) entries — a prefix
 * cannot apply platform-suffix or `index` resolution, so it would mint URLs
 * that no served module uses. Every bare specifier served code carries must
 * therefore be passed in as an exact key.
 */
export async function buildImportMap(server: ViteDevServer, specifiers: Iterable<string>, origin: string): Promise<Record<string, string>> {
	const root = server.config.root;
	const importer = path.join(root, 'index.html');
	const base = origin.replace(/\/+$/, '');
	const out: Record<string, string> = {};
	for (const spec of specifiers) {
		if (spec.endsWith('/')) continue;
		try {
			const resolved = await server.environments.client.pluginContainer.resolveId(spec, importer);
			const file = resolved && !resolved.external ? resolved.id.split('?')[0] : null;
			// A directory (e.g. an alias to a package with no JS entry) is not a module.
			if (file && isFile(file)) {
				markSafeModule(server, file);
				// The resolver's id verbatim — it is what Vite's import analysis serves.
				out[spec] = `${base}${viteUrlForFile(file, root)}`;
			}
		} catch {
			// Unresolvable entries (build-time-only packages) have no device URL.
		}
	}
	return out;
}

function isFile(file: string): boolean {
	try {
		return statSync(file).isFile();
	} catch {
		return false;
	}
}

// Vite serves a file outside `server.fs.allow` only after its own import
// analysis resolved it (the internal `config.safeModulePaths`). A map target
// is resolved for the device instead, so it is registered the same way: per
// file, never by widening `fs.allow` for a server bound to the LAN.
function markSafeModule(server: ViteDevServer, file: string): void {
	const safe = (server.config as { safeModulePaths?: unknown }).safeModulePaths;
	if (safe instanceof Set) safe.add(file.replace(/\\/g, '/'));
}

export interface RegisterImportMapRouteOptions {
	getStrategy: () => FrameworkServerStrategy | undefined;
	/** Bare specifiers served code imports beyond the collected set (the deps bundle's core subpaths). */
	getExtraSpecifiers?: () => Promise<Iterable<string>>;
}

/** `GET` {@link IMPORT_MAP_PATH}: the import map and loader config ns:module `configureLoader()` takes at boot. */
export function registerImportMapRoute(server: ViteDevServer, options: RegisterImportMapRouteOptions): void {
	const { getStrategy, getExtraSpecifiers } = options;
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (urlObj.pathname !== IMPORT_MAP_PATH) return next();

			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			// Never the request's `Host` header: the server binds 0.0.0.0, so a
			// spoofed Host would rewrite the origin of every device module URL.
			const origin = getServerOrigin(server);

			const strategy = getStrategy();
			const runtimeConfig = buildRuntimeConfig({
				origin,
				flavor: strategy?.flavor || 'typescript',
				strategy,
			});

			const specifiers = new Set(runtimeConfig.specifiers);
			for (const spec of (await getExtraSpecifiers?.()) ?? []) specifiers.add(spec);
			const importMap = { imports: await buildImportMap(server, specifiers, origin) };

			res.setHeader('Content-Type', 'application/json');
			res.end(
				JSON.stringify(
					{
						importMap,
						volatilePatterns: runtimeConfig.volatilePatterns,
						canonicalization: runtimeConfig.canonicalization,
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
