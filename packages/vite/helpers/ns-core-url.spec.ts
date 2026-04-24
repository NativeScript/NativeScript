import { describe, expect, it } from 'vitest';
import { buildCoreUrl, buildCoreUrlPath, extractCoreSub, isCoreBridgeUrl, moduleRegistrationKeys, normalizeCoreSub, specToCoreSub } from './ns-core-url.js';

describe('ns-core-url — Invariant A canonical form', () => {
	const origin = 'http://localhost:5173';

	describe('normalizeCoreSub', () => {
		it('returns empty string for main module variants', () => {
			expect(normalizeCoreSub('')).toBe('');
			expect(normalizeCoreSub(null)).toBe('');
			expect(normalizeCoreSub(undefined)).toBe('');
			expect(normalizeCoreSub('index')).toBe('');
			expect(normalizeCoreSub('index.js')).toBe('');
			expect(normalizeCoreSub('/index.js')).toBe('');
		});

		it('strips query/hash fragments', () => {
			expect(normalizeCoreSub('application?v=123')).toBe('application');
			expect(normalizeCoreSub('application.js?v=123')).toBe('application');
			expect(normalizeCoreSub('application#hash')).toBe('application');
		});

		it('strips leading slashes', () => {
			expect(normalizeCoreSub('/application')).toBe('application');
			expect(normalizeCoreSub('///application')).toBe('application');
		});

		it('strips trailing .js/.mjs/.cjs', () => {
			expect(normalizeCoreSub('application.js')).toBe('application');
			expect(normalizeCoreSub('application.mjs')).toBe('application');
			expect(normalizeCoreSub('application.cjs')).toBe('application');
		});

		it('keeps platform suffix segments (.ios.js → .ios)', () => {
			expect(normalizeCoreSub('application/index.ios.js')).toBe('application/index.ios');
			expect(normalizeCoreSub('ui/core/view.ios.js')).toBe('ui/core/view.ios');
		});

		it('preserves deep subpaths verbatim', () => {
			expect(normalizeCoreSub('ui/core/view')).toBe('ui/core/view');
			expect(normalizeCoreSub('ui/styling/style-properties')).toBe('ui/styling/style-properties');
			expect(normalizeCoreSub('globals/index')).toBe('globals');
		});
	});

	describe('buildCoreUrlPath', () => {
		it('main module → /ns/core (no trailing slash)', () => {
			expect(buildCoreUrlPath()).toBe('/ns/core');
			expect(buildCoreUrlPath('')).toBe('/ns/core');
			expect(buildCoreUrlPath('index')).toBe('/ns/core');
		});

		it('subpath → /ns/core/<sub>', () => {
			expect(buildCoreUrlPath('application')).toBe('/ns/core/application');
			expect(buildCoreUrlPath('ui/core/view')).toBe('/ns/core/ui/core/view');
		});

		it('normalizes subpath input', () => {
			expect(buildCoreUrlPath('/application.js')).toBe('/ns/core/application');
			expect(buildCoreUrlPath('application?v=123')).toBe('/ns/core/application');
		});
	});

	describe('buildCoreUrl', () => {
		it('produces byte-identical URLs for all main-module spellings', () => {
			const urls = ['', 'index', 'index.js', '/index.js', null as any, undefined as any].map((s) => buildCoreUrl(origin, s));
			for (const url of urls) expect(url).toBe('http://localhost:5173/ns/core');
		});

		it('produces byte-identical URLs for all subpath spellings', () => {
			const urls = ['application', 'application.js', '/application', 'application?v=123'].map((s) => buildCoreUrl(origin, s));
			for (const url of urls) expect(url).toBe('http://localhost:5173/ns/core/application');
		});

		it('normalizes trailing slash on origin', () => {
			expect(buildCoreUrl('http://localhost:5173/', 'application')).toBe('http://localhost:5173/ns/core/application');
		});

		it('throws on empty origin', () => {
			expect(() => buildCoreUrl('', 'application')).toThrow(/requires a non-empty origin/);
		});
	});

	describe('isCoreBridgeUrl / extractCoreSub', () => {
		it('detects /ns/core with or without origin', () => {
			expect(isCoreBridgeUrl('/ns/core')).toBe(true);
			expect(isCoreBridgeUrl('/ns/core/application')).toBe(true);
			expect(isCoreBridgeUrl('http://localhost:5173/ns/core')).toBe(true);
			expect(isCoreBridgeUrl('http://localhost:5173/ns/core/ui/core/view')).toBe(true);
			expect(isCoreBridgeUrl('/ns/core?p=foo')).toBe(true);
			expect(isCoreBridgeUrl('/node_modules/@nativescript/core/application.js')).toBe(false);
			expect(isCoreBridgeUrl('http://example.com/other')).toBe(false);
		});

		it('extracts canonical sub from path or URL', () => {
			expect(extractCoreSub('/ns/core')).toBe('');
			expect(extractCoreSub('/ns/core/')).toBe('');
			expect(extractCoreSub('/ns/core/application')).toBe('application');
			expect(extractCoreSub('http://localhost:5173/ns/core/ui/core/view')).toBe('ui/core/view');
			expect(extractCoreSub('http://localhost:5173/ns/core')).toBe('');
		});

		it('tolerates legacy ?p= form', () => {
			expect(extractCoreSub('/ns/core?p=application')).toBe('application');
			expect(extractCoreSub('/ns/core/123?p=ui/core/view')).toBe('ui/core/view');
		});
	});

	describe('specToCoreSub', () => {
		it('bare @nativescript/core → empty sub', () => {
			expect(specToCoreSub('@nativescript/core')).toBe('');
		});

		it('bare @nativescript/core/sub', () => {
			expect(specToCoreSub('@nativescript/core/application')).toBe('application');
			expect(specToCoreSub('@nativescript/core/ui/core/view')).toBe('ui/core/view');
			expect(specToCoreSub('@nativescript/core/application.js')).toBe('application');
		});

		it('absolute /node_modules path', () => {
			expect(specToCoreSub('/node_modules/@nativescript/core/application.js')).toBe('application');
			expect(specToCoreSub('/foo/node_modules/@nativescript/core/ui/core/view/index.js')).toBe('ui/core/view');
			expect(specToCoreSub('C:\\proj\\node_modules\\@nativescript\\core\\application.js')).toBe('application');
		});

		it('returns null for non-core specs', () => {
			expect(specToCoreSub('@angular/core')).toBe(null);
			expect(specToCoreSub('/foo/bar/baz')).toBe(null);
			expect(specToCoreSub('')).toBe(null);
		});
	});

	describe('moduleRegistrationKeys', () => {
		it('main module registers @nativescript/core + empty', () => {
			const keys = moduleRegistrationKeys('');
			expect(keys).toContain('@nativescript/core');
			expect(keys).toContain('');
		});

		it('subpath registers multiple lookup forms', () => {
			const keys = moduleRegistrationKeys('ui/core/view');
			expect(keys).toContain('@nativescript/core/ui/core/view');
			expect(keys).toContain('ui/core/view');
			expect(keys).toContain('@nativescript/core/ui/core/view.js');
			expect(keys).toContain('@nativescript/core/ui/core/view/index.js');
		});

		it('normalizes input first (tolerates .js tail)', () => {
			const a = moduleRegistrationKeys('application');
			const b = moduleRegistrationKeys('application.js');
			const c = moduleRegistrationKeys('/application?v=1');
			expect(new Set(a)).toEqual(new Set(b));
			expect(new Set(a)).toEqual(new Set(c));
		});
	});
});
