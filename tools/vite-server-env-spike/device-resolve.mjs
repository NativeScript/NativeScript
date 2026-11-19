// How the NativeScript iOS runtime resolves a specifier in a module it loaded
// over HTTP (ns-v8ios-runtime ModuleInternalCallbacks.mm):
//   - static imports resolve per the URL spec against the importer's URL; bare
//     specifiers go through the import map (scopes, then imports; exact match,
//     then the longest trailing-slash prefix);
//   - a dynamic `import(spec)` keeps its query only when `spec` is an absolute
//     http(s) URL. Bare specifiers still go through the import map, but any
//     other non-http(s) spec loses its query and is looked up on the device's
//     filesystem, so a root-relative or relative literal never reaches the server.

const HTTP_URL = /^https?:\/\//i;
const OTHER_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export const isHttpUrl = (spec) => HTTP_URL.test(spec);
const isUrlLike = (spec) => spec.startsWith('/') || spec.startsWith('./') || spec.startsWith('../');

function lookupInEntries(entries, spec) {
	if (!entries) return null;
	if (Object.hasOwn(entries, spec)) return entries[spec];
	let bestKey = '';
	for (const key of Object.keys(entries)) {
		if (key.endsWith('/') && spec.length > key.length && spec.startsWith(key) && key.length > bestKey.length) bestKey = key;
	}
	return bestKey ? entries[bestKey] + spec.slice(bestKey.length) : null;
}

/** `importMap` is `{ imports, scopes }`; `mapUrl` is where it was fetched from (targets resolve against it). */
export function lookupImportMap(importMap, spec, referrerUrl, mapUrl) {
	let target = null;
	for (const [prefix, entries] of Object.entries(importMap?.scopes ?? {})) {
		if (referrerUrl.startsWith(prefix)) {
			target = lookupInEntries(entries, spec);
			if (target) break;
		}
	}
	target ??= lookupInEntries(importMap?.imports, spec);
	return target ? new URL(target, mapUrl).href : null;
}

/**
 * Resolves one es-module-lexer import record of the module served at `importerUrl`.
 * Returns `{ kind, spec, url? }`; `kind` is one of
 *   'static' | 'dynamic'  — `url` is what the device fetches;
 *   'builtin'             — a non-http(s) scheme the runtime handles itself;
 *   'non-literal'         — a dynamic import of an expression; not followable;
 *   'bare-missing'        — FAILURE: a bare specifier the import map does not map;
 *   'dynamic-not-absolute'— FAILURE: a dynamic literal the runtime looks up on disk.
 * `null` for `import.meta`.
 */
export function resolveDeviceImport(imp, importerUrl, importMap, mapUrl) {
	if (imp.d === -2) return null;
	const dynamic = imp.d > -1;
	const spec = imp.n;
	const kind = dynamic ? 'dynamic' : 'static';
	if (spec == null) return dynamic ? { kind: 'non-literal' } : null;
	if (isHttpUrl(spec)) return { kind, spec, url: new URL(spec).href };
	// The runtime consults the map first for every specifier, keys matched literally (`node:module` included).
	const mapped = lookupImportMap(importMap, spec, importerUrl, mapUrl);
	if (mapped) return { kind, spec, url: mapped, bare: !isUrlLike(spec) };
	if (isUrlLike(spec)) return dynamic ? { kind: 'dynamic-not-absolute', spec } : { kind, spec, url: new URL(spec, importerUrl).href };
	if (OTHER_SCHEME.test(spec)) return { kind: 'builtin', spec };
	return { kind: 'bare-missing', spec };
}

export const FAILURE_KINDS = new Set(['bare-missing', 'dynamic-not-absolute']);

/** The runtime accepts any 2xx with a body (an empty one is `export {};`), except 204/205. */
export const loadableStatus = (status) => status >= 200 && status < 300 && status !== 204 && status !== 205;
