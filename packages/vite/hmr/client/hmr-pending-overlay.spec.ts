import { describe, expect, it, vi } from 'vitest';

import { applyHmrPendingFrame, buildHmrPendingDetail } from './hmr-pending-overlay.js';

describe('buildHmrPendingDetail', () => {
	it("formats a real file path as 'Updating <path>'", () => {
		expect(buildHmrPendingDetail('/src/app/foo.ts')).toBe('Updating /src/app/foo.ts');
	});

	it("falls back to 'Preparing update' when the path is missing", () => {
		// Defends against the server emitting a malformed pending
		// payload — the user still sees a meaningful frame instead
		// of "Updating <unknown>" or "Updating undefined".
		expect(buildHmrPendingDetail(undefined)).toBe('Preparing update');
		expect(buildHmrPendingDetail('')).toBe('Preparing update');
		expect(buildHmrPendingDetail('<unknown>')).toBe('Preparing update');
	});
});

describe('applyHmrPendingFrame', () => {
	it("calls overlay.setUpdateStage('received', { detail: 'Updating <path>' }) on the happy path", () => {
		const setUpdateStage = vi.fn();
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => ({ setUpdateStage }),
			overlayEnabled: true,
		});
		expect(result).toBe(true);
		expect(setUpdateStage).toHaveBeenCalledWith('received', { detail: 'Updating /src/foo.ts' });
	});

	it('returns false and does NOT touch the overlay when gating is disabled (NS_VITE_PROGRESS_OVERLAY=0)', () => {
		const setUpdateStage = vi.fn();
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => ({ setUpdateStage }),
			overlayEnabled: false,
		});
		expect(result).toBe(false);
		expect(setUpdateStage).not.toHaveBeenCalled();
	});

	it('returns false when the overlay API is missing (production builds, no overlay installed)', () => {
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => null,
			overlayEnabled: true,
		});
		expect(result).toBe(false);
	});

	it('returns false when the overlay shape is wrong (no setUpdateStage method)', () => {
		// Defensive: a future overlay version (or a stub from an
		// older runtime) may not expose setUpdateStage. Don't blow up.
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => ({}) as any,
			overlayEnabled: true,
		});
		expect(result).toBe(false);
	});

	it('swallows getOverlay throws (e.g. globalThis access denied) and returns false', () => {
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => {
				throw new Error('access denied');
			},
			overlayEnabled: true,
		});
		expect(result).toBe(false);
	});

	it('swallows setUpdateStage throws (e.g. overlay in a bad state) and returns false', () => {
		const setUpdateStage = vi.fn(() => {
			throw new Error('overlay broken');
		});
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => ({ setUpdateStage }),
			overlayEnabled: true,
		});
		expect(result).toBe(false);
	});

	it('uses the build-time gate when overlayEnabled is omitted (defaults to true in tests)', () => {
		// In vitest, `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` is
		// undeclared, so the default-true fallback triggers.
		const setUpdateStage = vi.fn();
		const result = applyHmrPendingFrame('/src/foo.ts', {
			getOverlay: () => ({ setUpdateStage }),
		});
		expect(result).toBe(true);
		expect(setUpdateStage).toHaveBeenCalled();
	});

	it("forwards 'Preparing update' detail when the path is missing", () => {
		const setUpdateStage = vi.fn();
		applyHmrPendingFrame(undefined, {
			getOverlay: () => ({ setUpdateStage }),
			overlayEnabled: true,
		});
		expect(setUpdateStage).toHaveBeenCalledWith('received', { detail: 'Preparing update' });
	});
});
