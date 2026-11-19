/**
 * Which modules a soft full reload re-evaluates. Shared by the device client
 * (what it evicts) and the dev server (an edit to anything else needs an app
 * restart instead), so both sides apply one rule.
 *
 * Pure: imported by device code and by the dev server.
 */

/**
 * A soft reload replaces what the app owns and nothing else. `@nativescript/core`
 * and other `node_modules` packages evaluate once per process: core
 * re-evaluated in place would mint a second `View` hierarchy the live native
 * views fail `instanceof` against. The dev client keeps its identity because
 * it is the code running the reload. `keepPrefixes` are Vite URL prefixes of
 * such packages served from outside `node_modules` (`/@fs/…`), such as the dev
 * client and a workspace-linked core.
 */
export function isAppOwnedViteUrl(viteUrl: string, keepPrefixes: readonly string[]): boolean {
	const path = viteUrl.replace(/[?#].*$/, '');
	if (!path.startsWith('/') || path.includes('/node_modules/') || path.startsWith('/@vite/')) {
		return false;
	}
	return !keepPrefixes.some((prefix) => path.startsWith(prefix));
}
