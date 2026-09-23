/**
 * Canonicalize a filesystem path so it can serve as a STABLE Rolldown module id
 * that is identical regardless of the host operating system.
 *
 * Why this exists
 * ---------------
 * Rolldown keys its module graph on the raw `resolveId` string. It does NOT
 * unify `C:\proj\node_modules\@nativescript\core\ui\index.js` with
 * `C:/proj/node_modules/@nativescript/core/ui/index.js`, nor `c:/…` with
 * `C:/…`. Any two ids that point at the same physical file but differ in
 * separator style or drive-letter case become two distinct modules — so the
 * file is evaluated twice.
 *
 * NativeScript ships several `enforce: 'pre'` resolver plugins
 * (`NativeScriptPlugin`, `nativescriptPackageResolver`,
 * `packagePlatformResolverPlugin`, the tsconfig-paths resolver). They all build
 * ids with Node's `path.resolve`/`path.join`, which on Windows emit
 * backslashes and inherit the drive-letter case of `process.cwd()`. Meanwhile
 * Vite's alias replacement (`NS_CORE_ROOT`) and Vite's own resolver emit
 * forward-slash ids whose drive case comes from `require.resolve()`/realpath.
 *
 * The result on Windows: `@nativescript/core`'s internal relative imports
 * (resolved by our plugins → backslashes) and the same files reached via bare
 * `@nativescript/core/*` specifiers (resolved by the alias → forward slashes)
 * produce different ids, core is bundled twice, and the second
 * `widthProperty.register(View)` crashes on a non-configurable property.
 *
 * macOS/Linux never hit this because POSIX paths from every code path are
 * already byte-identical — which is exactly why this normalization is a no-op
 * there.
 *
 * Canonical form
 * --------------
 *  - forward slashes (the form Vite/Rolldown and our alias replacement use)
 *  - uppercase Windows drive letter, matching Node's `realpath()`/
 *    `require.resolve()` convention — the source that seeds `NS_CORE_ROOT`.
 *
 * Virtual ids (`\0…`, `virtual:…`), query suffixes (`?worker`), and bare
 * specifiers are preserved as-is apart from separator/drive canonicalization,
 * so it is safe to call on any string a `resolveId` hook might return.
 */
export function normalizeModuleId(id: string): string {
	if (!id) return id;
	// Forward slashes everywhere. Rollup-style virtual prefixes ("\0") use a
	// leading NUL, never a path separator, so this leaves them intact.
	let normalized = id.replace(/\\/g, '/');
	// Uppercase a leading Windows drive letter ("c:/…" → "C:/…"). Matches the
	// case Node's realpath()/require.resolve() returns, which is what feeds
	// NS_CORE_ROOT and therefore every alias-resolved core id.
	if (normalized.length >= 2 && normalized[1] === ':') {
		const drive = normalized.charCodeAt(0);
		// a-z → A-Z
		if (drive >= 97 && drive <= 122) {
			normalized = normalized[0].toUpperCase() + normalized.slice(1);
		}
	}
	return normalized;
}
