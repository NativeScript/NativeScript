import type { ViteDevServer } from 'vite';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';

import { getPackageJson, getProjectFilePath } from '../../helpers/project.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';
import { setDeviceModuleHeaders } from './route-helpers.js';

// Lazily loaded only for the source-tree fallback below (transform
// entry-runtime.ts on the fly when the built .js isn't present).
const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

/**
 * Dependencies the device-bootstrap routes need from the HMR plugin closure.
 * The three project-path values are computed once in `websocket.ts`; injecting
 * them (rather than recomputing) keeps a single source of truth.
 */
export interface RegisterNsEntryRoutesOptions {
	verbose: boolean;
	appRootDir: string;
	defaultMainEntry: string;
	defaultMainEntryVirtual: string;
	getGraphVersion(): number;
	getServerOrigin(server: ViteDevServer): string;
}

/**
 * Registers the device bootstrap endpoints:
 *   - `GET /ns/entry-rt[?v=<ver>]` — serves the compiled entry runtime module
 *     (built `entry-runtime.js`, or a transformed `entry-runtime.ts` fallback), and
 *   - `GET /ns/entry[/<ver>]` — a script-safe wrapper that fetches the entry
 *     runtime and starts the app with `{ origin, main, ver }`.
 */
export function registerNsEntryRoutes(server: ViteDevServer, options: RegisterNsEntryRoutesOptions): void {
	const verbose = options.verbose;
	const APP_ROOT_DIR = options.appRootDir;
	const DEFAULT_MAIN_ENTRY = options.defaultMainEntry;
	const DEFAULT_MAIN_ENTRY_VIRTUAL = options.defaultMainEntryVirtual;
	const getGraphVersion = options.getGraphVersion;
	const getServerOrigin = options.getServerOrigin;
	// 2.6a) Serve compiled entry runtime module: GET /ns/entry-rt[?v=<ver>]
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/entry-rt')) return next();
			if (verbose) {
				const ra = (req.socket as any)?.remoteAddress;
				const rp = (req.socket as any)?.remotePort;
				console.log('[hmr-http] GET /ns/entry-rt from', ra + (rp ? ':' + rp : ''));
			}
			setDeviceModuleHeaders(res);
			let content = '';
			try {
				const _req = createRequire(import.meta.url);
				const entryRtPath = _req.resolve('@nativescript/vite/hmr/entry-runtime.js');
				content = readFileSync(entryRtPath, 'utf-8');
			} catch (e) {
				// .js not found (source tree without build) — transform .ts on the fly
				try {
					const tsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'entry-runtime.ts');
					if (existsSync(tsPath)) {
						const tsSource = readFileSync(tsPath, 'utf-8');
						const result = babelCore.transformSync(tsSource, {
							filename: tsPath,
							plugins: [[pluginTransformTypescript, { isTSX: false, allowDeclareFields: true }]],
							sourceType: 'module',
						});
						if (result?.code) {
							content = result.code;
						}
					}
				} catch (e2) {
					if (verbose) console.warn('[hmr-http] entry-runtime.ts transform failed', e2);
				}
				if (!content) {
					content = 'export default async function start(){ console.error("[/ns/entry-rt] not found"); }\n';
				}
			}
			if (verbose) console.log('[hmr-http] /ns/entry-rt serving', content.length, 'bytes');
			res.statusCode = 200;
			res.end(content);
		} catch (e) {
			console.warn('[hmr-http] /ns/entry-rt error', e);
			next();
		}
	});

	// 2.6b) HTTP-only app entry endpoint: GET /ns/entry[/<ver>]
	// Thin wrapper that imports the compiled entry runtime and starts it with parameters.
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/entry' || /^\/ns\/entry\/[\d]+$/.test(urlObj.pathname))) return next();
			try {
				if (verbose) {
					const ra = (req.socket as any)?.remoteAddress;
					const rp = (req.socket as any)?.remotePort;
					console.log('[hmr-http] GET /ns/entry from', ra + (rp ? ':' + rp : ''));
				}
			} catch {}
			const verSeg = urlObj.pathname.replace(/^\/ns\/entry\/?/, '');
			// Resolve app main entry to an absolute path-like key used by /ns/m
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			const ver = /^[0-9]+$/.test(verSeg) ? verSeg : String(getGraphVersion() || 0);
			const origin = getServerOrigin(server) || `${urlObj.protocol}//${urlObj.host}`;
			// Resolve app main entry to an absolute path-like key used by /ns/m
			let mainEntry = '/';
			try {
				const pkg = getPackageJson();
				const main = pkg?.main || DEFAULT_MAIN_ENTRY;
				const abs = getProjectFilePath(main).replace(/\\/g, '/');
				// Normalize to '/app/...'
				const marker = `/${APP_ROOT_DIR}/`;
				const idx = abs.indexOf(marker);
				mainEntry = idx >= 0 ? abs.substring(idx) : DEFAULT_MAIN_ENTRY_VIRTUAL;
			} catch {}
			// Build a tiny wrapper that imports the compiled entry runtime from the dev server
			let code =
				REQUIRE_GUARD_SNIPPET +
				`// [ns-entry][v${ver}] wrapper (script-safe) bytes will follow\n` +
				`(async function(){\n` +
				`  let origin = ${JSON.stringify(origin)}; const main = ${JSON.stringify(mainEntry)}; const __ns_graph_ver = ${JSON.stringify(ver)};\n` +
				`  try { const __b = (globalThis && globalThis.__NS_ENTRY_BASE__) ? String(globalThis.__NS_ENTRY_BASE__) : ''; if (__b) { try { const __o = new URL(__b).origin; if (__o) origin = __o; } catch {} } } catch {}\n` +
				`  const __VERBOSE__ = (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) || (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.verbose) || (globalThis && globalThis.__NS_ENV_VERBOSE__) || ${JSON.stringify(!!verbose)};\n` +
				`  if (__VERBOSE__) console.info('[ns-entry][wrapper] start', { origin, main, ver: __ns_graph_ver });\n` +
				`  async function __ns_import_entry_rt(u){\n` +
				`    // Prefer fetch+eval script transformation to avoid module import limitations on device\n` +
				`    try { const r = await fetch(u); const t = await r.text(); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt fetched bytes', (t&&t.length)||0);\n` +
				`      // Transform 'export default function' or 'export default async function' into global assignment\n` +
				`      let s = t.replace(/export\\s+default\\s+async\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=async function $1')\n` +
				`               .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=function $1');\n` +
				`      // Fallback: if function-form replacements didn't run, handle expression default export too\n` +
				`      if (String(s).indexOf('__NS_START_ENTRY__') === -1) { s = 'globalThis.__NS_START_ENTRY__=' + s.replace(/export\\s+default\\s*/,''); }\n` +
				`      try { (0,eval)(s); } catch (ee) { console.error('[ns-entry][wrapper] eval entry-rt failed', ee && (ee.message||ee)); throw ee; }\n` +
				`      const fn = globalThis.__NS_START_ENTRY__; if (!fn) { throw new Error('entry-rt missing __NS_START_ENTRY__'); }\n` +
				`      return { default: fn };\n` +
				`    } catch(e) { console.error('[ns-entry][wrapper] entry-rt fetch/eval failed', e && (e.message||e)); throw e; }\n` +
				`  }\n` +
				`  const __entryRtUrl = '/ns/entry-rt?v=' + String(__ns_graph_ver);\n` +
				`  let __mod; try { __mod = await __ns_import_entry_rt(__entryRtUrl); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt ready'); } catch (e) { console.error('[ns-entry][wrapper] failed to prepare entry-rt', e && (e.message||e)); throw e; }\n` +
				`  const startEntry = (__mod && (__mod.default || __mod));\n` +
				`  try { await startEntry({ origin, main, ver: __ns_graph_ver, verbose: !!__VERBOSE__ }); if (__VERBOSE__) console.info('[ns-entry][wrapper] startEntry() resolved'); } catch (e) { console.error('[ns-entry][wrapper] startEntry() failed', e && (e.message||e)); throw e; }\n` +
				`})();\n`;
			code = code + `\n//# sourceURL=${origin}/ns/entry`;
			res.statusCode = 200;
			res.end(code);
		} catch (e) {
			next();
		}
	});
}
