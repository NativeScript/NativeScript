import { describe, expect, it } from 'vitest';
import { isAppOwnedViteUrl, viteUrlFromDeviceUrl, viteUrlPrefixFromDeviceUrl } from './full-reload.js';

const ORIGIN = 'http://127.0.0.1:5173';

describe('isAppOwnedViteUrl', () => {
	const keep = ['/@fs/repo/packages/vite/', '/@fs/repo/packages/core/'];

	it.each([
		['/src/app.ts', true],
		['/src/app.ts?t=123', true],
		['/@fs/repo/libs/shared/index.ts', true],
		['/@id/__x00__virtual:app-config', true],
		['/node_modules/@nativescript/core/index.js', false],
		['/@fs/repo/node_modules/@nativescript/angular/fesm2022/index.mjs', false],
		['/@vite/client', false],
		['/@vite/env', false],
		['/@fs/repo/packages/vite/hmr/client/index.js', false],
		['/@fs/repo/packages/core/ui/core/view/index.js', false],
	])('%s → %s', (url, expected) => {
		expect(isAppOwnedViteUrl(url, keep)).toBe(expected);
	});
});

describe('device URL mapping', () => {
	it('maps /ns/v device URLs on the session origin to Vite URLs', () => {
		expect(viteUrlFromDeviceUrl(`${ORIGIN}/ns/v/src/a.ts?t=1`, `${ORIGIN}/`)).toBe('/src/a.ts?t=1');
		expect(viteUrlFromDeviceUrl(`${ORIGIN}/__ns_dev__/client`, ORIGIN)).toBeNull();
		expect(viteUrlFromDeviceUrl('http://10.0.2.2:5173/ns/v/src/a.ts', ORIGIN)).toBeNull();
	});

	it('maps package directory URLs to Vite URL prefixes, ignoring non-device URLs', () => {
		expect(viteUrlPrefixFromDeviceUrl(`${ORIGIN}/ns/v/@fs/repo/packages/vite/`, ORIGIN)).toBe('/@fs/repo/packages/vite/');
		expect(viteUrlPrefixFromDeviceUrl('file:///repo/packages/vite/', ORIGIN)).toBeNull();
		expect(viteUrlPrefixFromDeviceUrl(undefined, ORIGIN)).toBeNull();
	});
});
