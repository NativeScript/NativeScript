// Stable URL + explicit invalidation contract for `/ns/m/...` modules.
//
// Older versions emitted `/ns/m/__ns_hmr__/v<N>/<rel>` (and, for cold boot,
// `/ns/m/__ns_boot__/b1/<rel>`) URLs in served modules so that V8's HTTP
// module cache would see a fresh URL on each save and so that the server
// could detect boot-time requests. Both decorations are gone:
//
//   - Freshness is driven by explicit eviction: the client calls
//     `__NS_DEV__.invalidateModules(urls)` with the server-computed eviction set,
//     and the iOS runtime pairs that with an eviction-driven fetch nonce
//     that defeats CFNetwork's HTTP cache. URLs stay STABLE across saves —
//     module identity IS the canonical URL.
//   - Boot-progress instrumentation is injected self-gating into every
//     served /ns/m module (the snippet no-ops once
//     `__NS_HMR_BOOT_COMPLETE__` flips), so no boot tag is needed.
//
// `canonicalizeNsMImportPath` collapses any tagged inbound URL shape
// (stale served code still cached on a device) back to the canonical
// stable form.

export function canonicalizeNsMImportPath(p: string): string {
	if (!p || !p.startsWith('/ns/m/')) {
		return p;
	}

	// Collapse tagged boot+hmr, hmr-only, or boot-only prefixes back to the
	// canonical `/ns/m/<rest>` form. Inputs we may still see from stale
	// cached code include:
	//   * `/ns/m/__ns_boot__/b1/__ns_hmr__/v<N>/<rest>`
	//   * `/ns/m/__ns_hmr__/v<N>/<rest>` (any tag: `live`, `v<N>`, `n<N>`, …)
	//   * `/ns/m/__ns_boot__/b1/<rest>`
	//   * `/ns/m/<rest>` (canonical, passes through unchanged)
	return p
		.replace(/^\/ns\/m\/__ns_boot__\/b1\/__ns_hmr__\/[^/]+\//, '/ns/m/')
		.replace(/^\/ns\/m\/__ns_hmr__\/[^/]+\//, '/ns/m/')
		.replace(/^\/ns\/m\/__ns_boot__\/b1\//, '/ns/m/');
}

export interface InboundLegacyNsMSpec {
	cleanedSpec: string;
	bootTaggedRequest: boolean;
	forcedVer: string | null;
}

/**
 * Inbound half of the legacy-tag contract: a raw `/ns/m` request spec (the
 * path AFTER the `/ns/m` route prefix) may still carry `__ns_boot__/<tag>/`
 * and/or `__ns_hmr__/<tag>/` decorations from stale cached device code.
 * Strips them (repeatedly — the two can nest in either order) and reports
 * what was seen.
 */
function stripLegacyNsMRequestTags(spec: string): InboundLegacyNsMSpec {
	let cleanedSpec = spec || '';
	let bootTaggedRequest = false;
	let forcedVer: string | null = null;

	try {
		let changed = true;
		while (changed) {
			changed = false;
			const bootMatch = cleanedSpec.match(/^\/?__ns_boot__\/[^\/]+(\/.*)?$/);
			if (bootMatch) {
				bootTaggedRequest = true;
				cleanedSpec = bootMatch[1] || '/';
				changed = true;
			}
			const hmrMatch = cleanedSpec.match(/^\/?__ns_hmr__\/([^\/]+)(\/.*)?$/);
			if (hmrMatch) {
				const tag = hmrMatch[1] || '';
				if (tag) {
					forcedVer = tag;
				}
				cleanedSpec = hmrMatch[2] || '/';
				changed = true;
			}
		}
	} catch {}

	return { cleanedSpec, bootTaggedRequest, forcedVer };
}

/**
 * Outbound half of the legacy-tag contract: the `/ns/m` finalize step runs
 * served code through this so every emitted `/ns/m/...` URL (in any import
 * form) is the canonical stable shape from `canonicalizeNsMImportPath`, and
 * `new URL(..., import.meta.url).href` forms are pinned to the absolute
 * dev-server origin.
 */
function collapseLegacyNsMTagsInServedCode(code: string, origin: string): string {
	const rewritePath = (p: string) => canonicalizeNsMImportPath(p);
	// 1) Static imports: import ... from "/ns/m/..."
	code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
	// 2) Side-effect imports: import "/ns/m/..."
	code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
	// 3) Dynamic imports: import("/ns/m/...")
	code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
	// 4) new URL("/ns/m/...", import.meta.url)
	code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
	// 5) __ns_import(new URL('/ns/m/...', import.meta.url).href)
	code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
	// 6) Force absolute HTTP for new URL('/ns/m/...', import.meta.url).href → canonical stable URL.
	try {
		code = code.replace(/new\s+URL\(\s*["'](\/ns\/m\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}${rewritePath(p1)}`)}`);
	} catch {}
	// 7) SFC URLs (Vue) — canonical, like everything else. Freshness
	// is driven by the Vue client evicting the SFC artifact URL set.
	try {
		code = code.replace(/new\s+URL\(\s*["']\/ns\/sfc(\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}/ns/sfc${p1}`)}`);
	} catch {}
	return code;
}

/**
 * Single seam for BOTH directions of legacy `/ns/m` tag handling:
 *
 *   - `'inbound-request-spec'`: strip `__ns_boot__`/`__ns_hmr__` decorations
 *     from a raw request spec, reporting what was stripped.
 *   - `'outbound-served-code'`: collapse every emitted `/ns/m` URL in served
 *     code to its canonical stable form (requires `origin`).
 *
 * Current servers never EMIT tags; both directions exist purely to tolerate
 * stale cached device code.
 */
export function collapseLegacyNsMTags(value: string, mode: 'inbound-request-spec'): InboundLegacyNsMSpec;
export function collapseLegacyNsMTags(value: string, mode: 'outbound-served-code', origin: string): string;
export function collapseLegacyNsMTags(value: string, mode: 'inbound-request-spec' | 'outbound-served-code', origin?: string): InboundLegacyNsMSpec | string {
	switch (mode) {
		case 'inbound-request-spec':
			return stripLegacyNsMRequestTags(value);
		case 'outbound-served-code':
			return collapseLegacyNsMTagsInServedCode(value, origin ?? '');
		default: {
			const exhaustive: never = mode;
			throw new Error(`Unhandled collapseLegacyNsMTags mode: ${exhaustive}`);
		}
	}
}
