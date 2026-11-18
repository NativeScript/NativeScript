/**
 * Canonical `@nativescript/core` sub paths.
 *
 * `<sub>` is always run through `normalizeCoreSub` (extensionless, no
 * `/index` tail, no platform suffix), so two spellings of the same core module
 * map to one key.
 */

const CORE_SCOPE_PREFIX = '@nativescript/core';

/**
 * Normalize a user-provided subpath into its canonical form. Strips:
 *   - Query and hash (`?v=…`, `#…`)
 *   - Leading / trailing slashes
 *   - Trailing `.js`/`.mjs`/`.cjs` extension
 *   - Trailing platform suffix (`.ios` / `.android` / `.visionos`)
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
	// A Vite-resolved file (`ui/text-base/index.ios.js`) and the bare
	// specifier (`@nativescript/core/ui/text-base`) must canonicalize to the
	// same sub, or the same file loads under two URLs and splits the realm.
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
 * Convert an absolute path INSIDE a known @nativescript/core root directory
 * into the canonical sub path. Complements {@link specToCoreSub}, which only
 * recognizes bare specifiers and `node_modules` installs: in a monorepo where
 * core is consumed from source (`<workspace>/packages/core` via a `file:`
 * dependency), the resolve-alias step rewrites bare `@nativescript/core[/sub]`
 * specifiers to absolute paths under that source root BEFORE the
 * `ns-core-external-urls` build plugin sees them. Without this mapping those
 * paths escape externalization and the entire core library is inlined into
 * bundle.mjs — a dead second realm whose `Frame.topmost()` is undefined while
 * the dev-server-served realm owns the live UI.
 *
 *   corePathToSub('/ws/packages/core', '/ws/packages/core')                 → ''
 *   corePathToSub('/ws/packages/core/ui/frame', '/ws/packages/core')        → 'ui/frame'
 *   corePathToSub('/ws/packages/core/ui/frame/index.ios.ts', same root)     → 'ui/frame'
 *   corePathToSub('/elsewhere/file.ts', '/ws/packages/core')                → null
 */
export function corePathToSub(spec: string, coreRoot: string | null | undefined): string | null {
	if (!spec || !coreRoot) return null;
	const cleaned = spec.split('?')[0].split('#')[0].replace(/\\/g, '/');
	const root = String(coreRoot).replace(/\\/g, '/').replace(/\/+$/, '');
	if (!root) return null;
	if (cleaned === root) return '';
	if (!cleaned.startsWith(root + '/')) return null;
	// Monorepo core is TypeScript source; strip TS extensions before the
	// canonical normalizer (which handles .js/.mjs/.cjs, platform suffixes
	// and trailing /index).
	const rel = cleaned.slice(root.length + 1).replace(/\.(?:ts|tsx|mts|cts)$/, '');
	return normalizeCoreSub(rel);
}
