// Pure helpers for the cold-boot placeholder's visual treatment.
//
// The visible UI is constructed in `root-placeholder.ts` (an NS view
// tree attached to `Application` via `launchEvent`), and driven by the
// dev-overlay via `updateBootStatusLabel`. This file owns the bits
// that don't need a runtime view tree to make sense — colours,
// animation timings, the formula that turns a 0–100 progress into the
// fill bar's `scaleX`, and the split between the "phase + percent"
// primary line and the secondary detail line.
//

import type { HmrOverlaySnapshot } from './dev-overlay.js';

/**
 * Calibrated palette for the boot placeholder card. The card is
 * intentionally light so the small accent (brand badge + progress
 * fill) reads as the only "live" element on the screen.
 *
 * Tones map to the snapshot tone enum from `dev-overlay.ts`:
 *  - `info` (default) — calm slate + NS blue
 *  - `error` — dusty rose-on-white surface
 */
export type BootPlaceholderTone = 'info' | 'error';

export interface BootPlaceholderPalette {
	pageBackground: string;
	cardBackground: string;
	cardShadow: string;
	titleText: string;
	phaseText: string;
	detailText: string;
	progressTrack: string;
	progressFill: string;
	activityIndicator: string;
}

const INFO_PALETTE: BootPlaceholderPalette = {
	pageBackground: '#F4F7FB',
	cardBackground: '#FFFFFF',
	cardShadow: '#0F172A',
	titleText: '#0F172A',
	phaseText: '#475569',
	detailText: '#94A3B8',
	progressTrack: '#E2E8F0',
	progressFill: '#3B6FE5',
	activityIndicator: '#3B6FE5',
};

const ERROR_PALETTE: BootPlaceholderPalette = {
	pageBackground: '#FFF5F5',
	cardBackground: '#FFFFFF',
	cardShadow: '#7F1D1D',
	titleText: '#7F1D1D',
	phaseText: '#B91C1C',
	detailText: '#DC2626',
	progressTrack: '#FCA5A5',
	progressFill: '#B41810',
	activityIndicator: '#B41810',
};

/**
 * Resolve the palette for a given tone. Unknown tones fall back to
 * the calm `info` palette
 */
export function getBootPlaceholderPalette(tone?: string | null): BootPlaceholderPalette {
	if (tone === 'error') return ERROR_PALETTE;
	return INFO_PALETTE;
}

/**
 * Animation contract for the boot placeholder.
 *
 * `entranceDurationMs` covers the one-shot fade + scale that fires
 * when the placeholder card first attaches to the visual tree.
 * `entranceFromScale` is the starting scale before easeOut to 1.
 *
 * `progressDurationMs` is the per-update fade for the progress fill's
 * `scaleX`. Pegged to 220 ms (just under the heartbeat's 250 ms tick)
 * so consecutive ticks chain into continuous motion rather than
 * waiting on the previous animation to settle.
 *
 * `brandPulseDurationMs` is one half-period of the brand badge's
 * opacity pulse. A full cycle is `brandPulseDurationMs * 2`. Keeping
 * it long (~1.2 s) makes the pulse feel ambient rather than nervous.
 */
export const BOOT_PLACEHOLDER_MOTION = {
	entranceDurationMs: 380,
	entranceFromScale: 0.94,
	progressDurationMs: 220,
	brandPulseDurationMs: 1200,
	brandPulseMinOpacity: 0.55,
} as const;

/**
 * Convert a 0–100 progress percentage into an `scaleX` factor that
 * the fill view can animate against. Clamps to [`minScale`, 1] so the
 * fill never collapses to an invisible hairline
 *
 * The default `minScale` of 0.01 keeps the bar visible during the
 * earliest moments of boot when progress is 0
 */
export function computeBootProgressFillScale(progress: number | null | undefined, minScale = 0.01): number {
	const numeric = typeof progress === 'number' && Number.isFinite(progress) ? progress : 0;
	const normalized = numeric / 100;
	if (!Number.isFinite(normalized)) return minScale;
	return Math.max(minScale, Math.min(1, normalized));
}

/**
 * The "phase + percent" line we show as the primary status text
 * inside the card
 */
export function formatBootPrimaryLine(snapshot: Pick<HmrOverlaySnapshot, 'phase' | 'progress'> | null | undefined): string {
	if (!snapshot) return '';
	const progress = snapshot.progress;
	const progressText = typeof progress === 'number' && Number.isFinite(progress) ? ` (${Math.round(progress)}%)` : '';
	return `${snapshot.phase || ''}${progressText}`.trim();
}

/**
 * The secondary detail line (e.g. "Loading the application module
 * graph (6259ms)").
 */
export function formatBootDetailLine(snapshot: Pick<HmrOverlaySnapshot, 'detail'> | null | undefined): string {
	if (!snapshot) return '';
	const detail = snapshot.detail;
	return typeof detail === 'string' ? detail : '';
}
