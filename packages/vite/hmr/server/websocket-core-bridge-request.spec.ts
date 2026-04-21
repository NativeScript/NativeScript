import { describe, expect, it } from 'vitest';

import { parseCoreBridgeRequest } from './websocket.js';

describe('parseCoreBridgeRequest', () => {
	it('accepts the root core bridge path', () => {
		const parsed = parseCoreBridgeRequest('/ns/core', new URLSearchParams(), 7);

		expect(parsed).toEqual({
			hasExplicitVersion: false,
			key: '@nativescript/core',
			normalizedSub: null,
			sub: '',
			ver: '7',
		});
	});

	it('accepts an explicit version with query-based deep import', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/3', new URLSearchParams('p=utils/index.js'), 9);

		expect(parsed).toEqual({
			hasExplicitVersion: true,
			key: '@nativescript/core/utils/index.js',
			normalizedSub: 'utils/index.js',
			sub: 'utils/index.js',
			ver: '3',
		});
	});

	it('accepts an unversioned path-based deep import', () => {
		const parsed = parseCoreBridgeRequest('/ns/core/ui/frame/index.js', new URLSearchParams(), 4);

		expect(parsed).toEqual({
			hasExplicitVersion: false,
			key: '@nativescript/core/ui/frame/index.js',
			normalizedSub: 'ui/frame/index.js',
			sub: 'ui/frame/index.js',
			ver: '4',
		});
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
