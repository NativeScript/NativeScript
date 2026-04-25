const VERBOSE = !!(globalThis as any).__NS_ENV_VERBOSE__;

function getPreferredCssApplier(): ((cssText: string, refreshRoot?: boolean) => void) | null {
	try {
		const applier = (globalThis as any).__NS_HMR_APPLY_CSS__;
		if (typeof applier === 'function') {
			return applier;
		}
	} catch {}
	return null;
}

function getCore(name: string): any {
	try {
		const g = globalThis as any;
		const reg = g.__nsVendorRegistry;
		if (reg && reg.has('@nativescript/core')) {
			const ns = reg.get('@nativescript/core');
			return ns?.[name] || (ns?.default ?? ns)?.[name];
		}
		const req = g.__nsVendorRequire || g.__nsRequire || g.require;
		if (typeof req === 'function') {
			const ns = req('@nativescript/core');
			return ns?.[name] || (ns?.default ?? ns)?.[name];
		}
	} catch {}
	return (globalThis as any)[name];
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

		const Application = getCore('Application');
		if (Application && Application.addCss) {
			Application.addCss(cssText);
			if (VERBOSE) console.info('[ns-hmr] CSS applied, refreshing view');
		}
		// Trigger a view refresh so the new styles are rendered.
		// NativeScript caches computed styles — addCss alone won't repaint.
		try {
			const rootView = Application?.getRootView?.();
			if (rootView && typeof rootView._onCssStateChange === 'function') {
				rootView._onCssStateChange();
			} else if (rootView) {
				// Force a style recalculation by toggling the root's class
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
