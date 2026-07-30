// Helper to rewrite vendor/bare imports of 'vue' or 'nativescript-vue' to the unified /ns/rt bridge
// Ensures a single module realm for Vue/NativeScript-Vue across app and plugins during dev HTTP ESM.

export function rewriteVendorVueSpec(code: string, origin: string, ver: number): string {
	try {
		const rt = `${origin}/ns/rt/${ver}`;
		let out = code;

		// Helper: replace specifier if it ultimately references vue/nativescript-vue, including prebundled ids
		const replaceIfVue = (_m: string, p1: string, spec: string, p2: string) => {
			// Normalize any /ns/rt[/<num>] specifier to current graph version
			if (/^\/?ns\/rt(?:\/[0-9]+)?(?:$|[?#])/.test(spec) || /\/ns\/rt(?:\/[0-9]+)?(?:$|[?#])/.test(spec)) {
				return `${p1}${rt}${p2}`;
			}
			// Normalize typical Vite prebundle wrappers to bare package id for detection
			// Examples: /@id/nativescript-vue, /@id/__x00__nativescript-vue, /__x00__vue, /\.vite/deps/vue.js
			const s = spec.replace(/^[\/](?:@id|__vite|__x00__|\.vite\/deps)\//, '');
			const isVue = /(?:^|[\/])(?:nativescript-vue|vue)(?:$|[^A-Za-z0-9_\-\/])/i.test(s);
			if (isVue) return `${p1}${rt}${p2}`;
			return `${p1}${spec}${p2}`;
		};

		// 1) Static imports: from "..."
		out = out.replace(/(from\s*["'])([^"']+)(["'])/g, replaceIfVue as any);

		// 2) Side-effect imports: import "..."
		out = out.replace(/(import\s*(?!\()\s*["'])([^"']+)(["'])/g, replaceIfVue as any);

		// 3) Dynamic imports: import("...")
		out = out.replace(/(import\(\s*["'])([^"']+)(["']\s*\))/g, replaceIfVue as any);

		// 4) require("...") — defensive for wrapped CJS
		out = out.replace(/(require\(\s*["'])([^"']+)(["']\s*\))/g, replaceIfVue as any);

		return out;
	} catch {
		return code;
	}
}
