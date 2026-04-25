import { describe, expect, it } from 'vitest';

import { isHmrProgressOverlayEnabled } from './global-defines.js';

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
