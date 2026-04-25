import { describe, expect, it } from 'vitest';

import { HMR_KICKSTART_DEFAULT_MAX_URLS, isHmrProgressOverlayEnabled, resolveHmrKickstartMaxUrls } from './global-defines.js';

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

// Kickstart-eligibility threshold. The behavior matters because the
// wrong cap directly damages cold-edit latency: too low and component
// edits lose the parallel speed-up; too high and a constants edit
// balloons the cycle to multiple seconds. These tests pin the
// configuration semantics (env-var parsing, defaults, edge values) so
// a future tweak can't silently shift the default.
describe('resolveHmrKickstartMaxUrls (NS_VITE_KICKSTART_MAX_URLS)', () => {
	it('exposes a default of 32 (the empirically chosen knee point)', () => {
		// Pin the constant so a casual nudge from 32 → 16 doesn't slip in
		// without the rationale on the doc comment getting updated too.
		expect(HMR_KICKSTART_DEFAULT_MAX_URLS).toBe(32);
	});

	it('returns the default when the env var is unset', () => {
		expect(resolveHmrKickstartMaxUrls({} as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
	});

	it('returns the default for empty / whitespace-only values (typical user typo)', () => {
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '' } as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '   ' } as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
	});

	it('parses a positive integer override', () => {
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '64' } as any)).toBe(64);
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '128' } as any)).toBe(128);
	});

	it('floors fractional overrides (we treat the value as a count of URLs)', () => {
		// Caps are URL counts; a non-integer override is almost
		// certainly a user typo, but flooring is the safer
		// interpretation than rejecting (avoids a "why is the var
		// being ignored?" support ticket).
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '32.9' } as any)).toBe(32);
	});

	it('treats 0 as "kickstart disabled" without falling back to the default', () => {
		// 0 is a meaningful escape hatch: it lets a developer disable
		// the optimization entirely (e.g. while bisecting a perf
		// regression) without uninstalling the runtime. This MUST NOT
		// silently fall back to the default cap, even though 0 looks
		// like an empty-ish value.
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '0' } as any)).toBe(0);
	});

	it('accepts "Infinity" / "unlimited" / "none" as "no cap"', () => {
		for (const raw of ['Infinity', 'INFINITY', 'unlimited', 'UNLIMITED', 'none', 'NONE']) {
			expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: raw } as any)).toBe(Number.POSITIVE_INFINITY);
		}
	});

	it('falls back to the default for non-numeric / negative overrides (defensive)', () => {
		// Anything we can't classify is a typo; restoring the
		// default is safer than disabling the feature outright.
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: 'abc' } as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '-5' } as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: 'NaN' } as any)).toBe(HMR_KICKSTART_DEFAULT_MAX_URLS);
	});

	it('trims whitespace before parsing (e.g. NS_VITE_KICKSTART_MAX_URLS=" 16 ")', () => {
		expect(resolveHmrKickstartMaxUrls({ NS_VITE_KICKSTART_MAX_URLS: '  16  ' } as any)).toBe(16);
	});
});
