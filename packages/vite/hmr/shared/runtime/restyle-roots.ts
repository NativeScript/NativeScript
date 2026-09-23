/**
 * Re-running styling after a CSS hot update.
 *
 * `_onCssStateChange()` walks the view it is called on plus its descendants, so
 * calling it on `Application.getRootView()` covers the app tree — and nothing
 * else. A presented modal is not in that tree: core keeps modal roots in their
 * own list (`_getRootModalViews()`), reachable from any view but never through
 * `eachDescendant` from the app root. Restyling only the app root therefore
 * leaves an open sheet showing the stylesheet it was presented with, and the
 * hot update looks like it silently did nothing.
 *
 * Every CSS applier funnels through here so the three of them (the client
 * handler, the entry runtime's core-realm applier, and the browser-runtime
 * fallback) cannot drift apart on which roots they refresh.
 */

/** Minimal shape of the core views this touches — the realm rule forbids importing them. */
interface StyleRoot {
	_onCssStateChange?: () => void;
	className?: string;
	_getRootModalViews?: () => unknown[];
}

/**
 * Re-trigger styling on one view.
 *
 * The className round-trip is the fallback for a view that predates
 * `_onCssStateChange`: assigning a different value and back invalidates the
 * cached style state through the public property.
 */
function restyleView(view: StyleRoot | null | undefined): void {
	if (!view) return;
	try {
		if (typeof view._onCssStateChange === 'function') {
			view._onCssStateChange();
			return;
		}
		const className = view.className || '';
		view.className = className + ' ';
		view.className = className;
	} catch {}
}

/**
 * Restyle a root view and every modal presented over it.
 *
 * `seen` lets a caller iterating several Application realms skip roots it has
 * already refreshed; it is populated as roots are visited.
 */
export function restyleRootAndModals(rootView: unknown, seen?: Set<unknown>): void {
	if (!rootView) return;
	if (seen) {
		if (seen.has(rootView)) return;
		seen.add(rootView);
	}
	const root = rootView as StyleRoot;
	restyleView(root);
	let modals: unknown[] = [];
	try {
		modals = typeof root._getRootModalViews === 'function' ? root._getRootModalViews() || [] : [];
	} catch {}
	for (const modal of modals) {
		if (seen) {
			if (seen.has(modal)) continue;
			seen.add(modal);
		}
		restyleView(modal as StyleRoot);
	}
}
