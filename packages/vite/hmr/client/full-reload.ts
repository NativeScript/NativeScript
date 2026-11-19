/**
 * The device's `location.reload()`: re-evaluate every app-owned module in
 * place and re-import the session entry. `Application.run` is patched
 * (`shared/runtime/root-placeholder.ts`) so the re-evaluated entry resets the
 * root view instead of launching a second app.
 */
import type { HMRClient } from './hmr-client.js';
import { isAppOwnedViteUrl } from '../shared/app-owned.js';

export { isAppOwnedViteUrl };

/** Device route prefix of Vite URLs (`hmr/server/thin/thin-mode.ts`). */
export const THIN_PREFIX = '/ns/v';

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
	/** The entry re-import failed; recoverable by the next reload. */
	error?: unknown;
	/** Teardown failed part-way, so only a new process gets the app back to a known state. */
	restartReason?: string;
}

function reasonMessage(reason: unknown): string {
	return String((reason as any)?.message ?? reason);
}

export async function performFullReload(payload: unknown, deps: FullReloadDeps): Promise<FullReloadResult> {
	const { client } = deps;
	const listenerFailure = (await client.notifyListenersSettled('vite:beforeFullReload', payload)).find((result): result is PromiseRejectedResult => result.status === 'rejected');
	if (listenerFailure) {
		return { evicted: [], restartReason: `vite:beforeFullReload listener failed: ${reasonMessage(listenerFailure.reason)}` };
	}

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
	const disposeFailures = await client.disposePaths(ownerPaths);
	if (disposeFailures.length) {
		const [{ path, reason }] = disposeFailures;
		return { evicted: [], restartReason: `dispose of ${path} failed: ${reasonMessage(reason)}` };
	}
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
