// alpha.59 — Stable URL + Explicit Invalidation.
//
// Pre-alpha.59 the server emitted `/ns/m/__ns_hmr__/v<N>/<rel>` URLs in
// every served module so that V8's HTTP module cache (`g_moduleRegistry`)
// would see a fresh URL on each save and re-fetch the dependency closure.
// On every save the server also bumped a global `graphVersion` counter,
// which propagated into every emitted URL — effectively invalidating the
// ENTIRE cached graph on every save (Vite's single-threaded transform
// pipeline became the wall-clock bottleneck at ~3s per save).
//
// alpha.59 inverts that contract:
//   - The runtime registers a canonical key for every URL via
//     `CanonicalizeHttpUrlKey` (HMRSupport.mm), which strips
//     `__ns_hmr__/<tag>/` and `__ns_boot__/b1/` segments before lookup.
//   - The Angular HMR client receives an explicit `evictPaths` list in
//     `ns:angular-update` and calls `__nsInvalidateModules` to drop only
//     the modules that actually need re-evaluation.
//   - The server emits STABLE URLs for app modules. No version segment.
//
// `rewriteNsMImportPathForHmr` collapses any inbound URL shape to the
// canonical stable form. We still preserve `__ns_boot__/b1/` for
// boot-tagged requests because that wrapper drives boot-progress
// instrumentation (see `buildBootProgressSnippet`), and we still pass
// `node_modules` through unchanged because vendor packages live on a
// stable namespace already.

export function formatNsMHmrServeTag(value: string | number): string {
	const raw = String(value ?? '').trim();
	if (!raw) {
		return 'v0';
	}
	if (raw === 'live' || /^n\d+$/i.test(raw) || /^v[^/]+$/i.test(raw)) {
		return raw;
	}
	if (/^\d+$/.test(raw)) {
		return `v${raw}`;
	}
	return raw;
}

export function rewriteNsMImportPathForHmr(p: string, _ver: string | number, bootTaggedRequest: boolean): string {
	if (!p || !p.startsWith('/ns/m/')) {
		return p;
	}

	// Step 1: collapse any legacy boot+hmr or hmr-only prefix back to the
	// canonical `/ns/m/<rest>` form. Inputs we may see in the wild include:
	//   * `/ns/m/__ns_boot__/b1/__ns_hmr__/v<N>/<rest>` (cold-boot served
	//     code under alpha.58 and earlier)
	//   * `/ns/m/__ns_hmr__/v<N>/<rest>`               (HMR-served code
	//     under alpha.58 and earlier)
	//   * `/ns/m/__ns_boot__/b1/<rest>`                (alpha.59 boot)
	//   * `/ns/m/<rest>`                                (alpha.59 HMR)
	// We strip `__ns_hmr__/<tag>/` regardless of `<tag>` (handles `live`,
	// `v<N>`, `n<N>`, anything matched by `formatNsMHmrServeTag`). The
	// `__ns_boot__/b1/` segment is stripped here too — we'll re-add it
	// below if `bootTaggedRequest` is set, so the canonicalization is
	// idempotent (a boot URL that flows through twice ends up correct).
	let canonical = p
		.replace(/^\/ns\/m\/__ns_boot__\/b1\/__ns_hmr__\/[^/]+\//, '/ns/m/')
		.replace(/^\/ns\/m\/__ns_hmr__\/[^/]+\//, '/ns/m/')
		.replace(/^\/ns\/m\/__ns_boot__\/b1\//, '/ns/m/');

	// Vendor packages: always serve under the canonical
	// `/ns/m/node_modules/<rest>` path, never under the boot prefix. This
	// preserves the longstanding invariant that node_modules paths are
	// stable across boot and HMR (so V8 dedups them in the module
	// registry regardless of which load triggered the fetch first).
	if (canonical.startsWith('/ns/m/node_modules/')) {
		return canonical;
	}

	// Boot-tagged request: app-module URL gets wrapped with the boot
	// prefix. The runtime canonicalizer collapses this back to the same
	// cache key as the unprefixed URL, so cold boot and HMR share module
	// identity. The boot prefix is still useful at request time because
	// the server detects it and injects the boot-progress snippet.
	if (bootTaggedRequest) {
		return `/ns/m/__ns_boot__/b1${canonical.slice('/ns/m'.length)}`;
	}

	// HMR / steady-state request: stable canonical URL.
	return canonical;
}

export function getNumericServeVersionTag(tag: string | null | undefined, fallback: number): number {
	const raw = String(tag || '').trim();
	if (!raw) {
		return fallback;
	}
	const versionMatch = raw.match(/^v(\d+)$/);
	if (versionMatch?.[1]) {
		return Number(versionMatch[1]);
	}
	if (/^\d+$/.test(raw)) {
		return Number(raw);
	}
	return fallback;
}
