import type { ViteDevServer } from 'vite';
import { createHash } from 'crypto';

import { extractExportMetadata } from '../../../server/websocket-served-module-helpers.js';
import type { RegisterSfcHandlersOptions } from './sfc-route-shared.js';

/**
 * Registers `GET /ns/sfc-meta` — JSON metadata (script exports, render presence,
 * hmr id) for an SFC. Extracted verbatim from `websocket-sfc.ts` (pure move).
 */
export function registerSfcMetaRoute(server: ViteDevServer, options: RegisterSfcHandlersOptions): void {
	// 4) JSON metadata endpoint for SFCs: GET /ns/sfc-meta?path=/src/Comp.vue OR /ns/sfc-meta/<ver>?path=/src/Comp.vue
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!urlObj.pathname.startsWith('/ns/sfc-meta')) return next();
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/json; charset=utf-8');
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			// Accept optional version segment similar to /ns/sfc
			{
				const metaBase = '/ns/sfc-meta';
				if (urlObj.pathname.startsWith(metaBase + '/')) {
					const rawRemainder = urlObj.pathname.slice(metaBase.length);
					const parts = rawRemainder.split('/');
					if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
						// consume version but we don't need it server-side
					}
				}
			}
			let spec = urlObj.searchParams.get('path') || '';
			if (!spec) {
				res.statusCode = 400;
				res.end(JSON.stringify({ error: 'missing path' }));
				return;
			}
			if (spec.startsWith('@/')) spec = options.appVirtualWithSlash + spec.slice(2);
			if (!spec.startsWith('/')) spec = '/' + spec;
			const base = spec.replace(/[?#].*$/, '');
			// Transform variants to inspect exports
			const [scriptR, templateR] = await Promise.all([server.transformRequest(base + '?vue&type=script'), server.transformRequest(base + '?vue&type=template')]);
			const scriptCode = scriptR?.code || '';
			const templateCode = templateR?.code || '';
			const scriptMeta = extractExportMetadata(scriptCode);
			// Robust render detection: Vue compiler may emit several shapes:
			// 1) export function render(_ctx, _cache) { ... }
			// 2) function render(_ctx,_cache) { ... } (later exported)
			// 3) export const render = (_ctx,_cache) => { ... }
			// 4) const render = (...) => { ... } (later exported)
			// 5) export { render } or export { render as render }
			// 6) Object property forms (rare in template output) render: (...) => {}
			const hasRender = /export\s+function\s+render\s*\(/.test(templateCode) || /(?:^|\n)\s*function\s+render\s*\(/.test(templateCode) || /export\s+(?:const|let|var)\s+render\s*=/.test(templateCode) || /(?:^|\n)\s*(?:const|let|var)\s+render\s*=/.test(templateCode) || /\brender\s*[:=]\s*/.test(templateCode) || /export\s*\{\s*render\s*(?:as\s*render)?\s*\}/.test(templateCode);
			if (hasRender && options.verbose) {
				console.log('[sfc-meta] detected render for', base);
			} else if (!hasRender && options.verbose) {
				console.warn('[sfc-meta] render NOT detected for', base);
			}
			const hash = createHash('md5').update(base).digest('hex').slice(0, 8);
			const payload = {
				path: base,
				hasScript: !!scriptCode,
				hasTemplate: !!templateCode,
				hasStyle: false,
				scriptExports: scriptMeta.named,
				scriptHasDefault: scriptMeta.hasDefault,
				templateHasRender: hasRender,
				hmrId: hash,
			};
			res.statusCode = 200;
			res.end(JSON.stringify(payload));
		} catch (e: any) {
			res.statusCode = 500;
			res.end(JSON.stringify({ error: e?.message || String(e) }));
		}
	});
}
