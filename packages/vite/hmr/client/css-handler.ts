import { getCore } from './utils.js';

const VERBOSE = !!(globalThis as any).__NS_ENV_VERBOSE__;

// Must match the tag used by the boot virtual `app.css` emitter in
// `helpers/main-entry.ts` and `entry-runtime.ts::APP_CSS_TAG` so HMR's
// remove/add pair replaces the boot-time selectors instead of stacking.
export const APP_CSS_TAG = 'app.css';

function getPreferredCssApplier(): ((cssText: string, refreshRoot?: boolean) => void) | null {
	try {
		const applier = (globalThis as any).__NS_HMR_APPLY_CSS__;
		if (typeof applier === 'function') {
			return applier;
		}
	} catch {}
	return null;
}

type TaggedCssApi = {
	add?: (cssText: string, tag: string) => unknown;
	remove?: (tag: string) => unknown;
};

function resolveTaggedCssApi(): TaggedCssApi {
	const add = getCore('addTaggedAdditionalCSS');
	const remove = getCore('removeTaggedAdditionalCSS');
	if (typeof add === 'function' && typeof remove === 'function') {
		return { add, remove };
	}
	return {};
}

// CSS helper: apply CSS and refresh the current page so new styles render
export function applyCssText(cssText: string): void {
	if (typeof cssText !== 'string' || !cssText.length) return;

	try {
		const applyInHttpCoreRealm = getPreferredCssApplier();
		if (applyInHttpCoreRealm) {
			applyInHttpCoreRealm(cssText, true);
			if (VERBOSE) console.info('[ns-hmr] CSS applied through HTTP core realm');
			return;
		}

		// Replace selectors via remove + add tagged pair so deleted
		// rules disappear (the additive `Application.addCss` cannot
		// undo previously installed selectors).
		const taggedCss = resolveTaggedCssApi();
		const Application = getCore('Application');
		let appliedTagged = false;
		if (taggedCss.add && taggedCss.remove) {
			try {
				taggedCss.remove(APP_CSS_TAG);
				taggedCss.add(cssText, APP_CSS_TAG);
				appliedTagged = true;
				if (VERBOSE) console.info('[ns-hmr] CSS applied via tagged replace');
			} catch (taggedError: any) {
				console.warn('[ns-hmr] tagged CSS replace failed, falling back to addCss:', taggedError?.message || String(taggedError));
			}
		}
		if (!appliedTagged && Application && Application.addCss) {
			Application.addCss(cssText);
			if (VERBOSE) console.info('[ns-hmr] CSS applied via addCss (additive fallback)');
		}
		// NS caches computed styles — re-trigger styling on the root
		// (propagates to descendants via `eachDescendant`).
		try {
			const rootView = Application?.getRootView?.();
			if (rootView && typeof rootView._onCssStateChange === 'function') {
				rootView._onCssStateChange();
			} else if (rootView) {
				const cls = rootView.className || '';
				rootView.className = cls + ' ';
				rootView.className = cls;
			}
		} catch {}
	} catch (e) {
		console.warn('[ns-hmr] CSS apply failed:', e?.message || String(e));
	}
}

// Fetch helper
export async function fetchText(url: string): Promise<string> {
	try {
		const g = globalThis as any;
		if (typeof g.fetch === 'function') {
			const res = await g.fetch(url);
			return await res.text();
		}
		const Http = g.Http;
		if (Http && Http.getString) {
			return await Http.getString(url);
		}
		if (VERBOSE) console.warn('[ns-hmr] No fetch method available');
		return '';
	} catch (e) {
		console.warn('[ns-hmr] Fetch failed:', e?.message || String(e));
		return '';
	}
}

// Handle CSS updates from Vite
export async function handleCssUpdates(cssUpdates: any[], httpOrigin: string): Promise<void> {
	if (VERBOSE) console.info('[ns-hmr] handleCssUpdates called, updates:', cssUpdates?.length, 'origin:', httpOrigin);
	for (const update of cssUpdates) {
		try {
			const cssPath = update.path || update.acceptedPath || '';
			if (!cssPath || !httpOrigin) continue;

			// Build URL: origin + path + ?direct=1&t=<timestamp>
			const timestamp = update.timestamp || Date.now();
			const sep = cssPath.includes('?') ? '&' : '?';
			const url = `${httpOrigin}${cssPath}${sep}direct=1&t=${timestamp}`;

			if (VERBOSE) console.info('[ns-hmr] Fetching CSS:', url);
			const cssText = await fetchText(url);
			if (cssText) {
				applyCssText(cssText);
			}
		} catch (e) {
			console.warn('[ns-hmr] CSS update fetch/apply failed:', e?.message || String(e));
		}
	}
}

// Handle custom CSS events
export function handleCustomCss(cssText: string): void {
	if (typeof cssText === 'string' && cssText.length) {
		applyCssText(cssText);
	}
}
