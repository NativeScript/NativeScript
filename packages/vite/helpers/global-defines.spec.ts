import { describe, expect, it } from 'vitest';

import { getGlobalDefines, isHmrProgressOverlayEnabled } from './global-defines.js';

describe('isHmrProgressOverlayEnabled (NS_VITE_PROGRESS_OVERLAY)', () => {
	it('defaults to enabled when the env var is unset', () => {
		expect(isHmrProgressOverlayEnabled({} as any)).toBe(true);
	});

	it('treats an empty string as enabled (default)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '' } as any)).toBe(true);
	});

	it('treats whitespace as enabled (defensive default — typical user typo)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '   ' } as any)).toBe(true);
	});

	it("disables when explicitly set to '0', 'false', 'off', or 'no'", () => {
		for (const value of ['0', 'false', 'off', 'no']) {
			expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: value } as any)).toBe(false);
		}
	});

	it('disables case-insensitively (NS_VITE_PROGRESS_OVERLAY=FALSE works the same as =false)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'FALSE' } as any)).toBe(false);
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'Off' } as any)).toBe(false);
	});

	it("treats truthy spellings ('1', 'true') as enabled", () => {
		// We intentionally don't try to enable from these — the default
		// IS enabled — but we also must not accidentally interpret them
		// as falsy. This pins the policy.
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '1' } as any)).toBe(true);
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'true' } as any)).toBe(true);
	});

	it('trims surrounding whitespace before classifying', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '  0  ' } as any)).toBe(false);
	});
});

describe('getGlobalDefines — webpack compatibility', () => {
	it('maps __non_webpack_require__ to the runtime require (raw expression, not a string literal)', () => {
		// webpack's APIPlugin provides `__non_webpack_require__`; some NativeScript
		// plugins (e.g. @nativescript/firebase-core on Android) reference it unguarded,
		// so Vite must define it or those plugins ReferenceError at runtime.
		const defines = getGlobalDefines({ platform: 'android', targetMode: 'development', verbose: false, flavor: 'angular' });
		expect((defines as Record<string, unknown>).__non_webpack_require__).toBe('globalThis.require');
		// Must be a bare expression, not JSON.stringified (which would inject a string).
		expect((defines as Record<string, unknown>).__non_webpack_require__).not.toBe('"globalThis.require"');
	});
});
