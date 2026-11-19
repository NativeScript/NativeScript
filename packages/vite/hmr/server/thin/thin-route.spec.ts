import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { coreRequireKeys, isThinStylesheetRequest, normalizeThinViteUrl, registerThinRoute, rewriteThinSpecifiers } from './thin-route.js';
import { thinDeviceUrl, transformIdForViteUrl, viteUrlForFile } from './thin-mode.js';
import { NS_DEV_EXPR } from '../../shared/runtime/dev-globals.js';

const ORIGIN = 'http://192.168.1.2:5173';
const T = '1700000000000';

describe('thin device URLs', () => {
	it('mirrors Vite: root-relative inside the root, /@fs outside it', () => {
		expect(viteUrlForFile('/app/src/main.ts', '/app')).toBe('/src/main.ts');
		expect(viteUrlForFile('/repo/dist/packages/core/index.js', '/app')).toBe('/@fs/repo/dist/packages/core/index.js');
	});

	it('prefixes the Vite URL with origin and /ns/v', () => {
		expect(thinDeviceUrl(`${ORIGIN}/`, '/src/main.ts')).toBe(`${ORIGIN}/ns/v/src/main.ts`);
	});

	it('maps virtual-module URLs to the id transformRequest expects', () => {
		expect(transformIdForViteUrl('/@id/__x00__virtual:foo')).toBe('\0virtual:foo');
		expect(transformIdForViteUrl('/src/a.ts')).toBe('/src/a.ts');
	});
});

describe('rewriteThinSpecifiers', () => {
	it('rewrites root-relative specifiers, including minified one-line imports', async () => {
		const code = `import{a as b}from"/@fs/x/node_modules/p/dist/index.mjs";export{c}from"/src/c.ts";`;
		const out = await rewriteThinSpecifiers(code, ORIGIN);
		expect(out).toBe(`import{a as b}from"${ORIGIN}/ns/v/@fs/x/node_modules/p/dist/index.mjs";export{c}from"${ORIGIN}/ns/v/src/c.ts";`);
	});

	it('rewrites literal dynamic imports and keeps their quotes', async () => {
		const out = await rewriteThinSpecifiers(`const m = import('/src/lazy.ts');`, ORIGIN);
		expect(out).toBe(`const m = import('${ORIGIN}/ns/v/src/lazy.ts');`);
	});

	it('leaves bare, relative and absolute-URL specifiers alone', async () => {
		const code = `import "ns:module";import a from "./a.js";import b from "https://cdn/x.js";const d = import(name);`;
		expect(await rewriteThinSpecifiers(code, ORIGIN)).toBe(code);
	});
});

describe('coreRequireKeys', () => {
	it('derives every require() spelling a core file answers to', () => {
		expect(coreRequireKeys('/core/ui/core/view/index.ios.js', '/core')).toEqual(['@nativescript/core/ui/core/view/index.ios.js', '@nativescript/core/ui/core/view/index.ios', '@nativescript/core/ui/core/view/index', '@nativescript/core/ui/core/view']);
		expect(coreRequireKeys('/core/index.js', '/core')).toEqual(['@nativescript/core/index.js', '@nativescript/core/index', '@nativescript/core']);
	});

	it('ignores files outside the core package', () => {
		expect(coreRequireKeys('/elsewhere/x.js', '/core')).toEqual([]);
	});
});

describe('normalizeThinViteUrl', () => {
	it('drops the t stamp and the import marker like Vite, keeping other params in order', () => {
		expect(normalizeThinViteUrl(`/src/a.ts?t=${T}`)).toBe('/src/a.ts');
		expect(normalizeThinViteUrl('/src/a.json?import')).toBe('/src/a.json');
		expect(normalizeThinViteUrl(`/src/a.json?import&t=${T}`)).toBe('/src/a.json');
		expect(normalizeThinViteUrl(`/src/a.ts?t=${T}&c=1`)).toBe('/src/a.ts?c=1');
		expect(normalizeThinViteUrl(`/src/a.ts?z=2&t=${T}&import&c=1`)).toBe('/src/a.ts?z=2&c=1');
		expect(normalizeThinViteUrl('/src/a.vue?vue&type=style&index=0&lang.css')).toBe('/src/a.vue?vue&type=style&index=0&lang.css');
	});

	it('keeps params that only look like t or import', () => {
		expect(normalizeThinViteUrl('/src/a.ts?t=123')).toBe('/src/a.ts?t=123');
		expect(normalizeThinViteUrl('/src/a.ts?importer=x&st=1')).toBe('/src/a.ts?importer=x&st=1');
	});
});

describe('isThinStylesheetRequest', () => {
	it('is a CSS URL asked for as text/css or with ?direct', () => {
		expect(isThinStylesheetRequest('/src/app.css', 'text/css,*/*;q=0.1')).toBe(true);
		expect(isThinStylesheetRequest('/src/app.css?direct', undefined)).toBe(true);
		expect(isThinStylesheetRequest(`/src/app.scss?t=${T}&direct`, undefined)).toBe(true);
	});

	it('leaves CSS imported as a module, and non-CSS, to the module path', () => {
		expect(isThinStylesheetRequest('/src/app.css', undefined)).toBe(false);
		expect(isThinStylesheetRequest('/src/app.css?import', '*/*')).toBe(false);
		expect(isThinStylesheetRequest('/src/app.ts', 'text/css')).toBe(false);
		expect(isThinStylesheetRequest('/src/app.css?direct=1', undefined)).toBe(false);
	});
});

describe('registerThinRoute', () => {
	// The core package root is resolved once per process, so every case shares one project.
	const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-thin-route-'));
	writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'app' }));
	mkdirSync(path.join(root, 'node_modules', '@nativescript', 'core'), { recursive: true });
	writeFileSync(path.join(root, 'node_modules', '@nativescript', 'core', 'package.json'), JSON.stringify({ name: '@nativescript/core', main: 'index.js' }));

	function mount() {
		let handler: (req: any, res: any, next: () => void) => Promise<void> = async () => {};
		const transformRequest = vi.fn(async (url: string) => ({ code: `export const url = ${JSON.stringify(url)};` }));
		const server = {
			config: { root },
			environments: { client: { transformRequest } },
			middlewares: { use: (fn: typeof handler) => (handler = fn) },
		} as any;
		registerThinRoute(server, () => ORIGIN);
		const request = async (url: string, headers: Record<string, string> = {}) => {
			const req = { url, headers };
			const res = {
				statusCode: 0,
				headers: {} as Record<string, unknown>,
				body: '',
				setHeader(k: string, v: unknown) {
					this.headers[k] = v;
				},
				end(b: unknown) {
					this.body = String(b);
				},
			};
			const next = vi.fn();
			await handler(req, res, next);
			return { req, res, next };
		};
		return { request, transformRequest };
	}

	it('serves a ?t= request as the same module code, transformed under the normalized URL', async () => {
		const { request, transformRequest } = mount();
		const plain = await request('/ns/v/src/app.ts');
		const stamped = await request(`/ns/v/src/app.ts?t=${T}&import`);
		expect(transformRequest.mock.calls.map((c) => c[0])).toEqual(['/src/app.ts', '/src/app.ts']);
		expect(stamped.res.body).toBe(plain.res.body);
		expect(stamped.next).not.toHaveBeenCalled();
	});

	it('keeps identity params when normalizing', async () => {
		const { request, transformRequest } = mount();
		await request(`/ns/v/src/a.vue?t=${T}&vue&type=script`);
		expect(transformRequest).toHaveBeenCalledWith('/src/a.vue?vue&type=script');
	});

	it('hands stylesheet requests to Vite unchanged, so its transform middleware answers text/css', async () => {
		const { request, transformRequest } = mount();
		const accepted = await request(`/ns/v/src/app.css?t=${T}`, { accept: 'text/css' });
		expect(accepted.next).toHaveBeenCalledOnce();
		expect(accepted.req.url).toBe(`/src/app.css?t=${T}`);
		const direct = await request('/ns/v/src/app.css?direct');
		expect(direct.next).toHaveBeenCalledOnce();
		expect(direct.req.url).toBe('/src/app.css?direct');
		expect(transformRequest).not.toHaveBeenCalled();
	});

	it('serves CSS imported as a module through the module path', async () => {
		const { request, transformRequest } = mount();
		const { res } = await request('/ns/v/src/app.css');
		expect(transformRequest).toHaveBeenCalledWith('/src/app.css');
		expect(res.headers['Content-Type']).toBe('application/javascript; charset=utf-8');
	});

	it('registers a core file for require(), first instance wins', async () => {
		const { request } = mount();
		const { res } = await request('/ns/v/node_modules/@nativescript/core/index.js');
		expect(res.body).toContain(`import * as __ns_thin_self__ from "${ORIGIN}/ns/v/node_modules/@nativescript/core/index.js";`);
		expect(res.body).toContain('if (!t[k]) t[k] = v;');
		expect(res.body).toContain('"@nativescript/core"');
		expect(res.body).toContain(`const d = ${NS_DEV_EXPR}; const t = d.coreModules || (d.coreModules = {});`);
	});

	it('registers a ?t= core instance under its own URL and replaces the previous one', async () => {
		const { request } = mount();
		const { res } = await request(`/ns/v/node_modules/@nativescript/core/index.js?t=${T}`);
		expect(res.body).toContain(`import * as __ns_thin_self__ from "${ORIGIN}/ns/v/node_modules/@nativescript/core/index.js?t=${T}";`);
		expect(res.body).not.toContain('if (!t[k])');
		expect(res.body).toContain('t[k] = v;');
	});

	it("drops the loader's transport-only __ns_dev_nonce before Vite and from the self-import URL", async () => {
		const { request, transformRequest } = mount();
		await request('/ns/v/src/app.ts?__ns_dev_nonce=1700000000000-3');
		await request(`/ns/v/src/app.ts?t=${T}&__ns_dev_nonce=1700000000000-4`);
		expect(transformRequest.mock.calls.map((c) => c[0])).toEqual(['/src/app.ts', '/src/app.ts']);

		const css = await request('/ns/v/src/app.css?__ns_dev_nonce=1-1', { accept: 'text/css' });
		expect(css.req.url).toBe('/src/app.css');

		const { res } = await request(`/ns/v/node_modules/@nativescript/core/index.js?t=${T}&__ns_dev_nonce=1-2`);
		expect(res.body).toContain(`from "${ORIGIN}/ns/v/node_modules/@nativescript/core/index.js?t=${T}";`);
	});

	it('does not register a core file requested with an identity query', async () => {
		const { request } = mount();
		const { res } = await request('/ns/v/node_modules/@nativescript/core/index.js?worker');
		expect(res.body).not.toContain('coreModules');
	});
});
