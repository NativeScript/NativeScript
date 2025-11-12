import { Application, Frame } from '@nativescript/core';
const VERBOSE = !!(globalThis as any).__NS_ENV_VERBOSE__;

// CSS helper function
export function applyCssText(cssText: string): void {
	if (typeof cssText !== 'string' || !cssText.length) return;

	try {
		if (Application.addCss) {
			Application.addCss(cssText);
			if (VERBOSE) console.info('[ns-hmr] Applied app CSS');
		} else {
			const topFrame = Frame.topmost?.();
			const curPage = topFrame?.currentPage;
			curPage.addCss(cssText);
			if (VERBOSE) console.info('[ns-hmr] Applied page CSS');
		}
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
		// Fallback to NativeScript Http if available
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
	for (const update of cssUpdates) {
		try {
			const path = update.path || update.acceptedPath || '';
			if (!path || !httpOrigin) continue;

			// Compose URL like the Vite client (ensure raw content and cache-bust)
			const hasQuery = path.includes('?');
			const tParam = `t=${encodeURIComponent(String(update.timestamp || Date.now()))}`;
			const directParam = hasQuery ? '&direct=1' : '?direct=1';
			const tSuffix = (hasQuery ? '&' : '?') + tParam;
			const url = httpOrigin + path + directParam + tSuffix;

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
