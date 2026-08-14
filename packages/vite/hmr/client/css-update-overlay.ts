/**
 * Detail strings for the HMR-applying overlay's CSS update frames.
 *
 * The overlay uses generic per-stage `phase` labels ("Re-importing
 * entry", "Update applied"). These pure helpers produce the matching
 * `detail` line so a CSS-only HMR cycle has a sensible progression
 * from 'received' → 'reimporting' → 'complete' rather than getting
 * stuck on the 'received' (5%) frame.
 *
 * Path-specific detail is intentionally omitted: the broadcast path
 * for an out-of-scope `@import` edit is rewritten to `/src/app.css`
 * (so Vite's PostCSS pipeline re-resolves the import chain), which
 * doesn't match the file the user actually edited. The 'received'
 * frame already surfaces the original edited path via the
 * `ns:hmr-pending` payload, so the later frames don't need to.
 */

export function buildCssApplyingDetail(count: number): string {
	if (!Number.isFinite(count) || count <= 1) return 'Applying CSS update';
	return `Applying ${count} CSS updates`;
}

export function buildCssAppliedDetail(count: number): string {
	if (!Number.isFinite(count) || count <= 1) return 'CSS update applied';
	return `${count} CSS updates applied`;
}
