import type { Plugin, ViteDevServer } from 'vite';
import { statSync } from 'node:fs';
import path from 'node:path';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { buildRuntimeConfig } from './import-map.js';
import { getServerOrigin } from './server-origin.js';
import { viteUrlForFile } from './vite-url.js';

export const IMPORT_MAP_PATH = '/__ns_dev__/import-map.json';

/**
 * Device import map: each bare specifier points at the URL Vite's import
 * analysis writes for it in served code, on the origin — the Vite URL of the
 * file the client resolver picks plus the resolver's own query (the `?v=` of
 * an optimized or version-stamped dependency), so a module reached both ways
 * is one module. No prefix (`pkg/`) entries: a prefix cannot apply
 * platform-suffix or `index` resolution, so it would mint URLs that no served
 * module uses.
 */
export async function buildImportMap(server: ViteDevServer, specifiers: Iterable<string>, origin: string, options: { verbose?: boolean } = {}): Promise<Record<string, string>> {
	const root = server.config.root;
	const importer = path.join(root, 'index.html');
	const base = origin.replace(/\/+$/, '');
	const depsOptimizer = server.environments.client.depsOptimizer;
	const skip = (spec: string, reason: string) => {
		if (options.verbose) console.info(`[import-map] no entry for ${spec}: ${reason}`);
	};
	const out: Record<string, string> = {};
	for (const spec of specifiers) {
		if (spec.endsWith('/')) continue;
		try {
			const resolved = await server.environments.client.pluginContainer.resolveId(spec, importer);
			if (!resolved || resolved.external) {
				skip(spec, 'unresolved');
				continue;
			}
			const queryAt = resolved.id.indexOf('?');
			const file = queryAt === -1 ? resolved.id : resolved.id.slice(0, queryAt);
			const query = queryAt === -1 ? '' : resolved.id.slice(queryAt);
			// A newly discovered dependency's optimized file is not written yet.
			// A directory (an alias to a package with no JS entry) is not a module.
			if (!depsOptimizer?.isOptimizedDepFile(file) && !isFile(file)) {
				skip(spec, `${file} is not a file`);
				continue;
			}
			markSafeModule(server, file);
			out[spec] = `${base}${viteUrlForFile(file, root)}${query}`;
		} catch (error: any) {
			skip(spec, error?.message || String(error));
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
	/** Logs each specifier that gets no entry. */
	verbose?: boolean;
}

/** `GET` {@link IMPORT_MAP_PATH}: the import map and loader config ns:module `configureLoader()` takes at boot. */
export function registerImportMapRoute(server: ViteDevServer, options: RegisterImportMapRouteOptions): void {
	const { getStrategy, verbose } = options;
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
				projectRoot: server.config.root,
				strategy,
			});

			const importMap = { imports: await buildImportMap(server, runtimeConfig.specifiers, origin, { verbose }) };

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

/** Serves {@link IMPORT_MAP_PATH} for the flavor's server strategy. */
export function nsImportMapPlugin(opts: { flavor: string; verbose?: boolean }): Plugin {
	return {
		name: 'nativescript-import-map',
		apply: 'serve',
		configureServer(server) {
			registerImportMapRoute(server, { getStrategy: () => getFrameworkServerStrategy(opts.flavor), verbose: opts.verbose });
		},
	};
}
