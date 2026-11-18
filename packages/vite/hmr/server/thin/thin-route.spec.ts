import { describe, expect, it } from 'vitest';
import { coreRequireKeys, rewriteThinSpecifiers } from './thin-route.js';
import { thinDeviceUrl, thinEvictionUrls, transformIdForViteUrl, viteUrlForFile } from './thin-mode.js';

const ORIGIN = 'http://192.168.1.2:5173';

describe('thin device URLs', () => {
	it('mirrors Vite: root-relative inside the root, /@fs outside it', () => {
		expect(viteUrlForFile('/app/src/main.ts', '/app')).toBe('/src/main.ts');
		expect(viteUrlForFile('/repo/dist/packages/core/index.js', '/app')).toBe('/@fs/repo/dist/packages/core/index.js');
	});

	it('prefixes the Vite URL with origin and /ns/v', () => {
		expect(thinDeviceUrl(`${ORIGIN}/`, '/src/main.ts')).toBe(`${ORIGIN}/ns/v/src/main.ts`);
	});

	it('builds eviction URLs from file paths, the way the device loaded them', () => {
		const urls = thinEvictionUrls(ORIGIN, '/app', ['/app/src/app/app.component.ts?v=1', '/repo/libs/ui/button.ts', '/app/src/app/app.component.ts', '/app/node_modules/rxjs/index.js', '\0virtual:x', null]);
		expect(urls).toEqual([`${ORIGIN}/ns/v/src/app/app.component.ts`, `${ORIGIN}/ns/v/@fs/repo/libs/ui/button.ts`]);
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
