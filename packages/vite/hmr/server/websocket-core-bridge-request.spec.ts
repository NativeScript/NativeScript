import { describe, expect, it } from 'vitest';

import { parseCoreBridgeRequest } from './websocket.js';

describe('parseCoreBridgeRequest', () => {
	it('accepts the canonical root core bridge path with no redirect', () => {
		const parsed = parseCoreBridgeRequest('/ns/core', new URLSearchParams(), 0);

		expect(parsed).toEqual({
			key: '@nativescript/core',
			normalizedSub: null,
			sub: '',
			canonicalPath: undefined,
		});
	});

	it('accepts a canonical deep import path with no redirect', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/ui/frame', new URLSearchParams(), 0);

		expect(parsed).toEqual({
			key: '@nativescript/core/ui/frame',
			normalizedSub: 'ui/frame',
			sub: 'ui/frame',
			canonicalPath: undefined,
		});
	});

	it('signals 301 to canonical path when subpath has a trailing /index.js', () => {
		// Vite's path resolver follows a package's `exports` map to the
		// physical file (`ui/frame/index.js`) for the extensionless import
		// `@nativescript/core/ui/frame`. The 301 collapses both spellings to
		// the canonical URL so iOS's HTTP-ESM cache key is shared.
		const parsed = parseCoreBridgeRequest('/ns/core/ui/frame/index.js', new URLSearchParams(), 0);

		expect(parsed).toEqual({
			key: '@nativescript/core/ui/frame/index.js',
			normalizedSub: 'ui/frame/index.js',
			sub: 'ui/frame/index.js',
			canonicalPath: '/ns/core/ui/frame',
		});
	});

	it('signals 301 to canonical path for platform-suffix variants', () => {
		// `normalizeCoreSub` strips `.ios` / `.android` / `.visionos` because
		// Vite's platform-aware resolver emits e.g. `ui/text-base/index.ios.js`
		// for `@nativescript/core/ui/text-base`. Both spellings must funnel to
		// the same canonical URL so the served core's `TextBase` class
		// identity is shared with vendor `require()` lookups.
		const parsed = parseCoreBridgeRequest('/ns/core/ui/text-base/index.ios', new URLSearchParams(), 0);

		expect(parsed?.canonicalPath).toBe('/ns/core/ui/text-base');
	});

	it('signals 301 to canonical /ns/core when subpath canonicalizes to empty', () => {
		// `/ns/core/index.js` is the file form of the package main; the
		// canonical URL drops the `index.js` tail so all package-main consumers
		// share a single module record.
		const parsed = parseCoreBridgeRequest('/ns/core/index.js', new URLSearchParams(), 0);

		expect(parsed?.canonicalPath).toBe('/ns/core');
	});

	it('rejects accidental prefix matches outside the core bridge', () => {
		expect(parseCoreBridgeRequest('/ns/corex', new URLSearchParams(), 0)).toBeNull();
		expect(parseCoreBridgeRequest('/ns/core-http', new URLSearchParams(), 0)).toBeNull();
	});
});
