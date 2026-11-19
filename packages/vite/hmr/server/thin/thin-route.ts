import type { ViteDevServer } from 'vite';
import { isCSSRequest } from 'vite';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { init, parse } from 'es-module-lexer';
import { getServedModules, servedTimestamp } from '../served-modules.js';
import { THIN_PREFIX, thinDeviceUrl, transformIdForViteUrl, viteUrlForFile } from './thin-mode.js';
import { NS_DEV_EXPR } from '../../shared/runtime/dev-globals.js';

const VITE_CLIENT_URL = '/@vite/client';
const THIN_VITE_CLIENT_FILE = fileURLToPath(new URL('../../client/thin-vite-client.js', import.meta.url));

/**
 * Rewrite every root-relative module specifier (Vite URLs: `/src/…`,
 * `/node_modules/…`, `/@fs/…`, `/@id/…`, `/@vite/client`) to its device URL.
 * Offsets come from es-module-lexer, so minified and multi-statement lines are
 * handled like any other; bare and relative specifiers are left alone (Vite has
 * already resolved everything it serves).
 */
export async function rewriteThinSpecifiers(code: string, origin: string): Promise<string> {
	await init;
	const [imports] = parse(code);
	let out = '';
	let last = 0;
	for (const imp of imports) {
		const spec = imp.n;
		if (!spec || !spec.startsWith('/') || spec.startsWith('//')) continue;
		// Dynamic imports with a string literal report the literal's bounds, quotes included.
		const quote = code[imp.s];
		const quoted = quote === '"' || quote === "'" || quote === '`';
		const start = quoted ? imp.s + 1 : imp.s;
		const end = quoted ? imp.e - 1 : imp.e;
		out += code.slice(last, start) + thinDeviceUrl(origin, spec);
		last = end;
	}
	return out + code.slice(last);
}

/**
 * Device import map: each bare specifier points at the thin URL of the file
 * Vite resolves it to. No prefix (`pkg/`) entries — a prefix cannot apply
 * platform-suffix or `index` resolution, so it would mint URLs that no served
 * module uses; served code carries no bare specifiers.
 */
export async function buildThinImportMap(server: ViteDevServer, specifiers: Iterable<string>, origin: string): Promise<Record<string, string>> {
	const root = server.config.root;
	const importer = path.join(root, 'index.html');
	const out: Record<string, string> = {};
	for (const spec of specifiers) {
		if (spec.endsWith('/')) continue;
		try {
			const resolved = await server.environments.client.pluginContainer.resolveId(spec, importer);
			const file = resolved && !resolved.external ? resolved.id.split('?')[0] : null;
			if (file && existsSync(file)) {
				// The resolver's id verbatim — it is what Vite's import analysis serves.
				out[spec] = thinDeviceUrl(origin, viteUrlForFile(file, root));
			}
		} catch {
			// Unresolvable entries (build-time-only packages) have no device URL.
		}
	}
	return out;
}

/**
 * `require('@nativescript/core[/sub]')` keys a served core file answers to, in
 * the shapes the bundle.mjs require shim looks up (the dev globals' `coreModules`).
 */
export function coreRequireKeys(fileAbs: string, coreRoot: string): string[] {
	const rel = path.relative(coreRoot, fileAbs).replace(/\\/g, '/');
	if (!rel || rel.startsWith('..')) return [];
	const noExt = rel.replace(/\.(?:mjs|cjs|js)$/, '');
	const noPlatform = noExt.replace(/\.(?:ios|android|visionos)$/, '');
	const noIndex = noPlatform === 'index' ? '' : noPlatform.replace(/\/index$/, '');
	const key = (sub: string) => (sub ? `@nativescript/core/${sub}` : '@nativescript/core');
	return [...new Set([key(rel), key(noExt), key(noPlatform), key(noIndex)])];
}

// Sync `require()` of core (NS plugins, HMR runtime helpers) must return the
// module instance already loaded at its device URL; otherwise the native
// loader resolves the bare name itself and evaluates a second core. A
// timestamped (`?t=`) instance is a newer copy of the same file and replaces
// the registered one; otherwise the first file to claim a key keeps it.
export function coreRegistrationFooter(selfUrl: string, keys: string[], replace: boolean): string {
	const assign = replace ? 't[k] = v;' : 'if (!t[k]) t[k] = v;';
	return `\nimport * as __ns_thin_self__ from ${JSON.stringify(selfUrl)};\n` + `try { const d = ${NS_DEV_EXPR}; const t = d.coreModules || (d.coreModules = {}); ` + `const v = typeof d.cjsShape === 'function' ? d.cjsShape(__ns_thin_self__) : __ns_thin_self__; ` + `for (const k of ${JSON.stringify(keys)}) ${assign} } catch {}\n`;
}

// Vite's own query regexes (`removeTimestampQuery`, `removeImportQuery`,
// `isDirectRequest`); URLSearchParams would reorder params and rewrite a bare
// `?direct` as `?direct=`.
const timestampRE = /(\?|&)t=\d{13}(?:&|$)/;
const importQueryRE = /(\?|&)import=?(?:&|$)/;
const directRequestRE = /(\?|&)direct=?(?:&|$)/;
const trailingSeparatorRE = /[?&]$/;

/**
 * The module a Vite URL names, as Vite's transform middleware derives it:
 * without the `t` stamp and the `import` marker, every other param kept in
 * order. One file then has one graph node however the device stamps its URL.
 */
export function normalizeThinViteUrl(viteUrl: string): string {
	return viteUrl.replace(timestampRE, '$1').replace(trailingSeparatorRE, '').replace(importQueryRE, '$1').replace(trailingSeparatorRE, '');
}

// The device loader appends `__ns_dev_nonce` to re-fetches of evicted modules
// to defeat OS HTTP caches. It is transport-only: never part of the device's
// module key, so it must not reach Vite's graph or a self-import URL either.
const devNonceRE = /(\?|&)__ns_dev_nonce=[^&]*(?:&|$)/;

export function stripDevNonce(url: string): string {
	return url.replace(devNonceRE, '$1').replace(trailingSeparatorRE, '');
}

/** A stylesheet request (`Accept: text/css` or `?direct`): Vite serves it as CSS text, not a module. */
export function isThinStylesheetRequest(viteUrl: string, accept: string | undefined): boolean {
	return isCSSRequest(viteUrl) && (!!accept?.includes('text/css') || directRequestRE.test(viteUrl));
}

let coreRootCache: string | null | undefined;
function getCoreRoot(root: string): string | null {
	if (coreRootCache !== undefined) return coreRootCache;
	try {
		// Same resolution mode as Vite's alias for core (symlinks preserved under the CLI).
		const pkg = createRequire(path.join(root, 'package.json')).resolve('@nativescript/core/package.json');
		coreRootCache = path.dirname(pkg);
	} catch {
		coreRootCache = null;
	}
	return coreRootCache;
}

// The iOS HTTP ESM loader rejects an empty body even on 200, so a downstream
// handler answering "nothing to load" must still yield a valid module.
function guardEmptyModuleBody(res: import('node:http').ServerResponse): void {
	const chunks: Buffer[] = [];
	const origEnd = res.end.bind(res) as (data?: unknown) => unknown;
	(res as any).write = (chunk: unknown) => {
		if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
		return true;
	};
	(res as any).end = (chunk?: unknown) => {
		if (chunk != null && typeof chunk !== 'function') chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
		let body = Buffer.concat(chunks);
		if (body.length === 0 && (res.statusCode || 200) < 400) {
			body = Buffer.from('export {};\n');
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		}
		try {
			res.setHeader('Content-Length', body.length);
		} catch {}
		return origEnd(body);
	};
}

/** `getOrigin` must be the trusted server origin baked into bundle.mjs, never the request's `Host` header. */
export function registerThinRoute(server: ViteDevServer, getOrigin: () => string): void {
	server.middlewares.use(async (req, res, next) => {
		const rawUrl = req.url || '';
		if (!rawUrl.startsWith(`${THIN_PREFIX}/`)) return next();
		const origin = getOrigin();
		let viteUrl = stripDevNonce(rawUrl.slice(THIN_PREFIX.length));
		if (isThinStylesheetRequest(viteUrl, req.headers.accept)) {
			// Vite's transform middleware adds `direct` and answers `text/css`.
			req.url = viteUrl;
			return next();
		}
		if (viteUrl.split('?')[0] === VITE_CLIENT_URL) {
			viteUrl = viteUrlForFile(THIN_VITE_CLIENT_FILE, server.config.root);
		}
		const moduleUrl = normalizeThinViteUrl(viteUrl);
		// Before the transform: an edit landing mid-request must count as after the fetch.
		const requestedAt = Date.now();
		let result: Awaited<ReturnType<typeof server.environments.client.transformRequest>> = null;
		try {
			result = await server.environments.client.transformRequest(transformIdForViteUrl(moduleUrl));
		} catch {
			result = null;
		}
		if (!result) {
			// Not a module Vite can transform (e.g. Analog's `@ng/component`
			// endpoint, which Angular addresses relative to the importing
			// module's URL): hand it to the rest of the middleware chain as the
			// plain Vite URL, exactly as a browser request would arrive.
			req.url = viteUrl;
			guardEmptyModuleBody(res);
			return next();
		}
		try {
			let code = await rewriteThinSpecifiers(result.code, origin);
			const coreRoot = getCoreRoot(server.config.root);
			if (coreRoot && !moduleUrl.includes('?')) {
				const filePath = moduleUrl.startsWith('/@fs/') ? moduleUrl.slice('/@fs'.length) : moduleUrl.startsWith('/@') ? null : path.join(server.config.root, moduleUrl);
				const keys = filePath ? coreRequireKeys(filePath, coreRoot) : [];
				// The self-import is the URL as requested: `t` is part of the module's identity.
				if (keys.length) code += coreRegistrationFooter(thinDeviceUrl(origin, viteUrl), keys, timestampRE.test(viteUrl));
			}
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.end(code);
			getServedModules(server).record(moduleUrl, servedTimestamp(viteUrl), requestedAt);
		} catch (error: any) {
			res.statusCode = 500;
			res.setHeader('Content-Type', 'text/plain; charset=utf-8');
			res.end(`[ns/v] ${viteUrl}: ${error?.message || error}`);
		}
	});
}
