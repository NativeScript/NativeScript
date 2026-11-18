import { describe, expect, it } from 'vitest';
import { corePathToSub, normalizeCoreSub, specToCoreSub } from './ns-core-url.js';

describe('ns-core-url — Invariant A canonical form', () => {
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

		it('strips platform suffix segments to prevent realm splits (.ios.js → bare, .ios → bare)', () => {
			expect(normalizeCoreSub('application/index.ios.js')).toBe('application');
			expect(normalizeCoreSub('ui/core/view.ios.js')).toBe('ui/core/view');
			expect(normalizeCoreSub('ui/text-base/index.ios')).toBe('ui/text-base');
			expect(normalizeCoreSub('runtime/runtime.android')).toBe('runtime/runtime');
			expect(normalizeCoreSub('ui/text-base/index.visionos')).toBe('ui/text-base');
		});

		it('preserves deep subpaths verbatim', () => {
			expect(normalizeCoreSub('ui/core/view')).toBe('ui/core/view');
			expect(normalizeCoreSub('ui/styling/style-properties')).toBe('ui/styling/style-properties');
			expect(normalizeCoreSub('globals/index')).toBe('globals');
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

		it('returns null for monorepo-source core paths (corePathToSub covers those)', () => {
			expect(specToCoreSub('/ws/packages/core/ui/frame')).toBe(null);
		});
	});

	describe('corePathToSub', () => {
		const ROOT = '/ws/packages/core';

		it('core root itself → empty sub (package main)', () => {
			expect(corePathToSub(ROOT, ROOT)).toBe('');
			expect(corePathToSub(`${ROOT}/index.ts`, ROOT)).toBe('');
		});

		it('subpaths, with and without TS source extensions', () => {
			expect(corePathToSub(`${ROOT}/ui/frame`, ROOT)).toBe('ui/frame');
			expect(corePathToSub(`${ROOT}/ui/frame/index.ts`, ROOT)).toBe('ui/frame');
			expect(corePathToSub(`${ROOT}/application/index.ios.ts`, ROOT)).toBe('application');
			expect(corePathToSub(`${ROOT}/data/observable/index.ts?v=1`, ROOT)).toBe('data/observable');
		});

		it('windows separators and trailing-slash root', () => {
			expect(corePathToSub('C:\\ws\\packages\\core\\ui\\frame\\index.ts', 'C:/ws/packages/core/')).toBe('ui/frame');
		});

		it('returns null outside the root or without a root', () => {
			expect(corePathToSub('/elsewhere/file.ts', ROOT)).toBe(null);
			expect(corePathToSub(`${ROOT}-sibling/file.ts`, ROOT)).toBe(null);
			expect(corePathToSub(`${ROOT}/ui/frame`, '')).toBe(null);
			expect(corePathToSub('', ROOT)).toBe(null);
		});
	});
});
