import { addTaggedAdditionalCSS, Application, removeTaggedAdditionalCSS } from '@nativescript/core';
import { ENV_VERBOSE as VERBOSE } from './utils.js';
import { getAppCssApplier } from '../shared/runtime/app-css-applier.js';
import { restyleRootAndModals } from '../shared/runtime/restyle-roots.js';
import type { CssUpdateItem } from '../shared/protocol.js';

// Must match the tag used by the boot virtual `app.css` emitter in
// `helpers/main-entry.ts` and `entry-runtime.ts::APP_CSS_TAG` so HMR's
// remove/add pair replaces the boot-time selectors instead of stacking.
export const APP_CSS_TAG = 'app.css';

// CSS helper: apply CSS and refresh the current page so new styles render.
//
// `tag` scopes the remove+add tagged pair. It defaults to {@link APP_CSS_TAG}
// (`'app.css'`) so a global stylesheet edit replaces the boot-time selectors.
// Component `styleUrls` edits pass the style file's own path as the tag so a
// component's rules replace independently — applying a component's CSS under
// the shared `app.css` tag would otherwise wipe the global stylesheet.
export function applyCssText(cssText: string, tag: string = APP_CSS_TAG): void {
	if (typeof cssText !== 'string' || !cssText.length) return;

	try {
		// The HTTP-core-realm applier (installed by `entry-runtime.ts`) always
		// replaces under the global `app.css` tag, so it is only correct
		// for GLOBAL stylesheet updates — routing a component-tagged update
		// through it would wipe the global stylesheet and install the
		// component's rules in its place. Component tags take the tagged
		// remove+add path below.
		if (tag === APP_CSS_TAG) {
			const applyInHttpCoreRealm = getAppCssApplier();
			if (applyInHttpCoreRealm) {
				applyInHttpCoreRealm(cssText, true);
				if (VERBOSE) console.info('[ns-hmr] CSS applied through HTTP core realm');
				return;
			}
		}

		// Replace selectors via remove + add tagged pair so deleted
		// rules disappear (the additive `Application.addCss` cannot
		// undo previously installed selectors).
		let appliedTagged = false;
		try {
			removeTaggedAdditionalCSS(tag);
			addTaggedAdditionalCSS(cssText, tag);
			appliedTagged = true;
			if (VERBOSE) console.info(`[ns-hmr] CSS applied via tagged replace (tag=${tag})`);
		} catch (taggedError: any) {
			console.warn('[ns-hmr] tagged CSS replace failed, falling back to addCss:', taggedError?.message || String(taggedError));
		}
		if (!appliedTagged && Application?.addCss) {
			Application.addCss(cssText);
			if (VERBOSE) console.info('[ns-hmr] CSS applied via addCss (additive fallback)');
		}
		// NS caches computed styles — re-trigger styling on the root
		// (propagates to descendants via `eachDescendant`) and on every
		// presented modal, which is a root of its own.
		try {
			restyleRootAndModals(Application?.getRootView?.());
		} catch {}
	} catch (e) {
		console.warn('[ns-hmr] CSS apply failed:', e?.message || String(e));
	}
}

/** Replaces each stylesheet the event carries under its tag, `app.css` when it has none. */
export async function handleCssUpdates(cssUpdates: CssUpdateItem[]): Promise<void> {
	for (const update of cssUpdates) {
		try {
			if (typeof update.css !== 'string') continue;
			if (VERBOSE) console.info('[ns-hmr] applying CSS for', update.path);
			const tag = typeof update.tag === 'string' && update.tag ? update.tag : undefined;
			applyCssText(update.css, tag);
		} catch (e) {
			console.warn('[ns-hmr] CSS update apply failed:', e?.message || String(e));
		}
	}
}
