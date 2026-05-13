import { describe, expect, it } from 'vitest';

import { parseCoreBridgeRequest } from './websocket.js';

describe('parseCoreBridgeRequest', () => {
	it('accepts the canonical root core bridge path with no redirect', () => {
		const parsed = parseCoreBridgeRequest('/ns/core', new URLSearchParams(), 7);

		expect(parsed).toEqual({
			hasExplicitVersion: false,
			key: '@nativescript/core',
			normalizedSub: null,
			sub: '',
			ver: '7',
			canonicalPath: undefined,
		});
	});

	it('accepts a canonical deep import path with no redirect', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/ui/frame', new URLSearchParams(), 4);

		expect(parsed).toEqual({
			hasExplicitVersion: false,
			key: '@nativescript/core/ui/frame',
			normalizedSub: 'ui/frame',
			sub: 'ui/frame',
			ver: '4',
			canonicalPath: undefined,
		});
	});

	it('signals 301 to canonical path when subpath has a trailing /index.js', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/ui/frame/index.js', new URLSearchParams(), 4);

		expect(parsed).toEqual({
			hasExplicitVersion: false,
			key: '@nativescript/core/ui/frame/index.js',
			normalizedSub: 'ui/frame/index.js',
			sub: 'ui/frame/index.js',
			ver: '4',
			canonicalPath: '/ns/core/ui/frame',
		});
	});

	it('signals 301 to canonical path for legacy `?p=` query form even with explicit version', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/3', new URLSearchParams('p=utils/index.js'), 9);

		expect(parsed).toEqual({
			hasExplicitVersion: true,
			key: '@nativescript/core/utils/index.js',
			normalizedSub: 'utils/index.js',
			sub: 'utils/index.js',
			ver: '3',
			canonicalPath: '/ns/core/utils',
		});
	});

	it('signals 301 for trailing platform suffix variants', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/ui/text-base/index.ios', new URLSearchParams(), 4);

		expect(parsed?.canonicalPath).toBe('/ns/core/ui/text-base');
	});

	it('signals 301 to canonical /ns/core when subpath canonicalizes to empty', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/index.js', new URLSearchParams(), 4);

		expect(parsed?.canonicalPath).toBe('/ns/core');
	});

	it('rejects versioned path-based deep imports', () => {
		expect(parseCoreBridgeRequest('/ns/core/3/ui/frame/index.js', new URLSearchParams(), 9)).toBeNull();
		expect(parseCoreBridgeRequest('/ns/core/3/', new URLSearchParams(), 9)).toBeNull();
	});

	it('rejects accidental prefix matches outside the core bridge', () => {
		expect(parseCoreBridgeRequest('/ns/corex', new URLSearchParams(), 5)).toBeNull();
		expect(parseCoreBridgeRequest('/ns/core-http', new URLSearchParams(), 5)).toBeNull();
	});
});
