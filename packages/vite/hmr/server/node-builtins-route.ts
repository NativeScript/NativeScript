import { builtinModules } from 'node:module';
import type { ViteDevServer } from 'vite';
import { setDeviceModuleHeaders } from './route-helpers.js';

/**
 * Dev-session shims for Node.js builtins: `GET /ns/node/<name>`.
 *
 * The device import map carries an exact entry for every `node:<name>`
 * specifier (see `getNodeBuiltinImportMapEntries`), so during a dev session
 * imports like `node:url` resolve through the map to this route BEFORE the
 * native runtime's baked-in polyfill branch is reached. That keeps the
 * shim *vocabulary and bodies* on the server (one place to grow/fix them)
 * and leaves the native branch as the non-dev fallback only.
 *
 * Two shim shapes, mirroring the native fallback's semantics:
 *   - `node:url` — a real shim: `fileURLToPath`/`pathToFileURL` plus
 *     re-exports of the runtime's global `URL`/`URLSearchParams`.
 *   - every other builtin — a warn-stub default export, so an accidental
 *     `node:fs` import surfaces loudly in the console instead of crashing
 *     resolution.
 */

const NODE_BUILTIN_ROUTE_PREFIX = '/ns/node/';

// `builtinModules` lists unprefixed names ('url', 'fs', 'fs/promises', ...).
// A Set for O(1) route validation.
const nodeBuiltinNames = new Set<string>(builtinModules.filter((name) => !name.startsWith('node:')));

/**
 * Exact import-map entries mapping every `node:<name>` specifier to this
 * route. Exact (not trailing-slash prefix) entries for two reasons: the
 * import-map spec reserves trailing-slash keys for path prefixes, and the
 * native resolver only intercepts `node:`-prefixed specifiers — bare 'url'
 * must keep resolving to the npm package of that name.
 */
export function getNodeBuiltinImportMapEntries(origin: string): Record<string, string> {
	const entries: Record<string, string> = {};
	for (const name of nodeBuiltinNames) {
		entries[`node:${name}`] = `${origin}${NODE_BUILTIN_ROUTE_PREFIX}${name}`;
	}
	return entries;
}

const URL_SHIM = `// Dev-session shim for node:url — served by the @nativescript/vite dev server.
const _URL = globalThis.URL;
const _URLSearchParams = globalThis.URLSearchParams;
export { _URL as URL, _URLSearchParams as URLSearchParams };
export function fileURLToPath(url) {
  if (typeof url === 'string') {
    if (url.startsWith('file://')) {
      return decodeURIComponent(url.slice(7));
    }
    return url;
  }
  if (url && typeof url.href === 'string') {
    return fileURLToPath(url.href);
  }
  throw new Error('Invalid URL');
}
export function pathToFileURL(path) {
  const encoded = encodeURIComponent(path).replace(/%2F/g, '/');
  return new _URL('file://' + encoded);
}
export default { URL: _URL, URLSearchParams: _URLSearchParams, fileURLToPath, pathToFileURL };
`;

/** The module body served for `node:<name>` during a dev session. */
export function buildNodeBuiltinShimModule(name: string): string {
	if (name === 'url') {
		return URL_SHIM;
	}
	const label = JSON.stringify(`node:${name}`);
	return `// Dev-session warn-stub for ${name} — served by the @nativescript/vite dev server.\n` + `console.warn('[ns-vite] Node.js builtin ' + ${label} + ' is not available in the NativeScript runtime; serving an empty stub.');\n` + `export default {};\n`;
}

export function registerNodeBuiltinsRoute(server: ViteDevServer): void {
	server.middlewares.use((req, res, next) => {
		const urlObj = new URL(req.url || '', 'http://localhost');
		if (!urlObj.pathname.startsWith(NODE_BUILTIN_ROUTE_PREFIX)) return next();
		const name = decodeURIComponent(urlObj.pathname.slice(NODE_BUILTIN_ROUTE_PREFIX.length));
		if (!nodeBuiltinNames.has(name)) {
			// Unknown name under /ns/node/ — not ours to serve; a 404 is more
			// honest than a stub for a typo'd or future builtin.
			res.statusCode = 404;
			res.end(`// Unknown Node.js builtin: ${JSON.stringify(name)}\n`);
			return;
		}
		setDeviceModuleHeaders(res);
		res.statusCode = 200;
		res.end(buildNodeBuiltinShimModule(name));
	});
}
