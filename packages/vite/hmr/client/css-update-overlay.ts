/**
 * Detail lines for the update overlay while `ns:css-updates` applies. They
 * name no file: the server reports an out-of-scope `@import` edit under
 * `/src/app.css`, not the file that was edited.
 */

export function buildCssApplyingDetail(count: number): string {
	if (!Number.isFinite(count) || count <= 1) return 'Applying CSS update';
	return `Applying ${count} CSS updates`;
}

export function buildCssAppliedDetail(count: number): string {
	if (!Number.isFinite(count) || count <= 1) return 'CSS update applied';
	return `${count} CSS updates applied`;
}
