/**
 * The device's `location.reload()`: re-evaluate every app-owned module in
 * place and re-import the session entry. `Application.run` is patched
 * (`shared/runtime/root-placeholder.ts`) so the re-evaluated entry resets the
 * root view instead of launching a second app.
 */
import type { HMRClient } from './hmr-client.js';

/** Device route prefix of Vite URLs (`hmr/server/thin/thin-mode.ts`). */
export const THIN_PREFIX = '/ns/v';

/**
 * A full reload replaces what the app owns and nothing else. `@nativescript/core`
 * and other `node_modules` packages evaluate once per process: core
 * re-evaluated in place would mint a second `View` hierarchy the live native
 * views fail `instanceof` against. The dev client keeps its identity because
 * it is the code running the reload. `keepPrefixes` are Vite URL prefixes of
 * packages served from outside `node_modules` (`/@fs/…`), such as the dev client
 * and a workspace-linked core.
 */
export function isAppOwnedViteUrl(viteUrl: string, keepPrefixes: readonly string[]): boolean {
	const path = viteUrl.replace(/[?#].*$/, '');
	if (!path.startsWith('/') || path.includes('/node_modules/') || path.startsWith('/@vite/')) {
		return false;
	}
	return !keepPrefixes.some((prefix) => path.startsWith(prefix));
}

/** The Vite URL a device module URL serves, or null when it isn't a `/ns/v` URL on `origin`. */
export function viteUrlFromDeviceUrl(url: string, origin: string): string | null {
	const base = origin.replace(/\/$/, '') + THIN_PREFIX;
	if (!url.startsWith(base + '/')) return null;
	return url.slice(base.length);
}

/** Vite URL prefix of a device URL prefix (e.g. a package directory), or null when it isn't served under `/ns/v` on `origin`. */
export function viteUrlPrefixFromDeviceUrl(url: string | undefined, origin: string): string | null {
	if (!url) return null;
	const viteUrl = viteUrlFromDeviceUrl(url, origin);
	return viteUrl ? viteUrl.replace(/[?#].*$/, '') : null;
}

export interface FullReloadDeps {
	client: HMRClient;
	origin: string;
	entryUrl: string;
	keepPrefixes: readonly string[];
	getLoadedModuleUrls?: () => string[];
	invalidateModules?: (urls: string[]) => void;
	importModule: (url: string) => Promise<unknown>;
	/** Runs after the old instances are disposed and before they are evicted. */
	beforeEvict?: () => void;
}

export interface FullReloadResult {
	evicted: string[];
	error?: unknown;
}

export async function performFullReload(payload: unknown, deps: FullReloadDeps): Promise<FullReloadResult> {
	const { client } = deps;
	await client.notifyListeners('vite:beforeFullReload', payload);

	const isAppOwned = (viteUrl: string) => isAppOwnedViteUrl(viteUrl, deps.keepPrefixes);
	const loaded = (() => {
		try {
			const list = deps.getLoadedModuleUrls?.();
			return Array.isArray(list) ? list : [];
		} catch (err) {
			client.logger.error(err);
			return [];
		}
	})();
	const evicted = loaded.filter((url) => {
		if (typeof url !== 'string') return false;
		const viteUrl = viteUrlFromDeviceUrl(url, deps.origin);
		return viteUrl !== null && isAppOwned(viteUrl);
	});

	// Unlike a browser reload, which wipes every context, an evicted module
	// keeps its `hot.data`: a module re-evaluated under the same URL reads
	// back what its previous instance's `dispose(data)` wrote. Only `prune`
	// deletes it. Non-evicted modules (node_modules, the dev client) keep
	// their contexts and listeners.
	const ownerPaths = client.ownerPaths().filter(isAppOwned);
	await client.disposePaths(ownerPaths);
	try {
		deps.beforeEvict?.();
	} catch (err) {
		client.logger.error(err);
	}
	client.dropContexts(ownerPaths);

	if (evicted.length) {
		try {
			deps.invalidateModules?.(evicted);
		} catch (err) {
			client.logger.error(err);
		}
	}
	try {
		await deps.importModule(deps.entryUrl);
		return { evicted };
	} catch (error) {
		return { evicted, error };
	}
}
