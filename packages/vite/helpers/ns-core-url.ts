/**
 * Single canonical URL generator for `@nativescript/core` under HMR.
 *
 * Every public-facing reference to `@nativescript/core[/sub]` resolves to
 * exactly one URL string — byte-for-byte identical across every emitter
 * (bundle entry, external-urls plugin, rewriter, import map, runtime
 * require). The only valid shapes are:
 *
 *   - `/ns/core`               — package main
 *   - `/ns/core/<sub>`         — subpath form
 *
 * with `<sub>` always run through `normalizeCoreSub` (extensionless, no
 * `/index` tail, no platform suffix). There is no version segment, no
 * `?p=` query form, no `.js` tail.
 *
 * This module is the ONE site that constructs those URLs. Every caller in
 * the repo should use `buildCoreUrl()` (or `buildCoreUrlPath()` when origin
 * is not known yet). A single violation of canonical form produces a
 * distinct iOS HTTP ESM cache entry for the same file — re-evaluating the
 * module body, re-running `CssAnimationProperty.register(...)` side
 * effects, and crashing with `Cannot redefine property`.
 */

const CORE_SCOPE_PREFIX = '@nativescript/core';

/**
 * Normalize a user-provided subpath into the canonical form used by the
 * /ns/core bridge. Strips:
 *   - Query and hash (`?v=…`, `#…`)
 *   - Leading / trailing slashes
 *   - Trailing `.js`/`.mjs`/`.cjs` extension (platform-suffixed forms are
 *     preserved: `.ios.js` → `.ios`)
 *   - Trailing `/index` segment (package-main sibling: `globals/index` →
 *     `globals`; `ui/core/view/index` → `ui/core/view`)
 *   - Canonical index forms (`index`, `index.js`, empty) → empty string
 *
 * Returns empty string for the main module (`@nativescript/core` itself).
 */
export function normalizeCoreSub(sub?: string | null): string {
	if (!sub) return '';
	let s = String(sub).split('?')[0].split('#')[0].trim();
	s = s.replace(/^\/+/, '').replace(/\/+$/, '');
	s = s.replace(/\.(?:mjs|cjs|js)$/, '');
	// Strip a trailing platform suffix (`.ios` / `.android` / `.visionos`)
	// so Vite-resolved platform-specific file paths canonicalize to the
	// same form the runtime import map uses for the bare subpath.
	//
	// Why this matters: when the app source has
	// `import { TextBase } from '@nativescript/core/ui/text-base'`, Vite's
	// alias + extension resolver picks `ui/text-base/index.ios.js`. After
	// `.js` is stripped above we have `ui/text-base/index.ios`. Vendor
	// code, by contrast, takes the bare specifier path: the runtime
	// import map's `@nativescript/core/` prefix maps it to
	// `/ns/core/ui/text-base` directly (no `.ios`). The iOS HTTP ESM
	// loader caches by URL string, so two spellings of the same file
	// would produce two distinct V8 module records, re-evaluate
	// `TextBase`, and create a realm split that leaves the
	// `@nativescript-community` plugin's `setTextDecorationAndTransform`
	// override visible to vendor code but invisible to the app.
	//
	// Stripping the suffix here normalises both shapes — `ui/text-base/`
	// `index.ios` and `runtime/runtime.ios` — to the bare form. The
	// trailing `/index` handler below then collapses
	// `ui/text-base/index` → `ui/text-base`, and the final `index`
	// guard collapses the package-main case to ''.
	s = s.replace(/\.(?:ios|android|visionos)$/, '');
	// Strip trailing `/index` so that `globals/index` → `globals`, matching
	// the bare import form that consumers spell as `@nativescript/core/globals`.
	// The main module case (`index` alone) is handled below.
	if (s.endsWith('/index')) {
		s = s.slice(0, -'/index'.length);
	}
	if (!s || s === 'index') return '';
	return s;
}

/**
 * Canonical PATH (no origin) for a core module.
 * Used by middleware/redirects where we don't have the dev-server origin.
 *
 *   ''                → '/ns/core'
 *   'application'     → '/ns/core/application'
 *   'ui/core/view'    → '/ns/core/ui/core/view'
 *   'globals/index'   → '/ns/core/globals'
 */
export function buildCoreUrlPath(sub?: string | null): string {
	const s = normalizeCoreSub(sub);
	return s ? `/ns/core/${s}` : '/ns/core';
}

/**
 * Canonical FULL URL for a core module.
 *
 *   origin='http://localhost:5173', sub='application'
 *     → 'http://localhost:5173/ns/core/application'
 *
 * Throws if origin is empty — callers that may not have origin should use
 * `buildCoreUrlPath()` instead.
 */
export function buildCoreUrl(origin: string, sub?: string | null): string {
	if (!origin) {
		throw new Error('[ns-core-url] buildCoreUrl requires a non-empty origin. Use buildCoreUrlPath() when origin is not yet known.');
	}
	const trimmedOrigin = origin.replace(/\/+$/, '');
	return `${trimmedOrigin}${buildCoreUrlPath(sub)}`;
}

/**
 * Detect whether a URL or path references the /ns/core bridge.
 * Accepts both relative `/ns/core/...` and absolute `http(s)://.../ns/core/...`.
 */
export function isCoreBridgeUrl(input: string): boolean {
	if (!input) return false;
	return /\/ns\/core(?:\/|$)/.test(input);
}

/**
 * Extract the canonical sub path from a /ns/core URL.
 *   'http://localhost:5173/ns/core'             → ''
 *   'http://localhost:5173/ns/core/application' → 'application'
 *   '/ns/core/ui/core/view'                     → 'ui/core/view'
 *   'http://example.com/other'                  → null
 */
export function extractCoreSub(input: string): string | null {
	if (!isCoreBridgeUrl(input)) return null;
	try {
		const u = new URL(input, 'http://placeholder.invalid');
		const pathname = u.pathname;
		const afterCore = pathname.replace(/^.*\/ns\/core(?:\/|$)/, '');
		return normalizeCoreSub(afterCore);
	} catch {
		const m = input.match(/\/ns\/core(?:\/([^?#]*))?/);
		if (!m) return null;
		return normalizeCoreSub(m[1] || '');
	}
}

/**
 * Convert a bare `@nativescript/core[/sub]` specifier or an absolute path
 * pointing into `@nativescript/core`'s node_modules install into the
 * canonical sub path. Returns null for anything else.
 *
 *   '@nativescript/core'                                 → ''
 *   '@nativescript/core/application'                     → 'application'
 *   '/node_modules/@nativescript/core/ui/core/view.js'   → 'ui/core/view'
 *   '/foo/bar/baz'                                       → null
 */
export function specToCoreSub(spec: string): string | null {
	if (!spec) return null;
	const cleaned = spec.split('?')[0].split('#')[0];
	if (cleaned === CORE_SCOPE_PREFIX) return '';
	if (cleaned.startsWith(CORE_SCOPE_PREFIX + '/')) {
		return normalizeCoreSub(cleaned.slice(CORE_SCOPE_PREFIX.length + 1));
	}
	const abs = cleaned.replace(/\\/g, '/').match(/\/node_modules\/@nativescript\/core\/(.+?)$/);
	if (abs) return normalizeCoreSub(abs[1]);
	// Case: the path ENDS at the core root (no subpath).
	if (/\/node_modules\/@nativescript\/core\/?$/.test(cleaned.replace(/\\/g, '/'))) {
		return '';
	}
	return null;
}

/**
 * Produce the set of "runtime module id" strings we expose in
 * `globalThis.__NS_CORE_MODULES__` for a given sub. Callers of the vendor
 * CJS shim may request any of these forms for the same module; we register
 * all of them to the one namespace so lookups are never ambiguous.
 */
export function moduleRegistrationKeys(sub?: string | null): string[] {
	const s = normalizeCoreSub(sub);
	const keys = new Set<string>();
	if (!s) {
		keys.add(CORE_SCOPE_PREFIX);
		keys.add('');
	} else {
		keys.add(`${CORE_SCOPE_PREFIX}/${s}`);
		keys.add(s);
		// Tolerate `.js` tail on the key (some consumers spell it out).
		keys.add(`${CORE_SCOPE_PREFIX}/${s}.js`);
		keys.add(`${s}.js`);
		// Tolerate `/index` / `/index.js` suffix.
		keys.add(`${CORE_SCOPE_PREFIX}/${s}/index`);
		keys.add(`${CORE_SCOPE_PREFIX}/${s}/index.js`);
	}
	return Array.from(keys);
}

export const CORE_SCOPE = CORE_SCOPE_PREFIX;
