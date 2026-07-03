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
