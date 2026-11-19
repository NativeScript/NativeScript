/**
 * The device's one HMR client. App modules create their hot contexts here
 * through `/@vite/client` (`thin-vite-client.ts`) while the app boots; the
 * device entry (`index.ts`) attaches the socket to the same instance once
 * boot completes. Both reach this file at a single URL, so it is a plain
 * module singleton.
 */
import { HMRClient, HMRContext } from './hmr-client.js';
import { ENV_VERBOSE } from './utils.js';

export const hmrClient = new HMRClient({
	error: (err) => console.error('[vite]', err),
	debug: (...msg) => {
		if (ENV_VERBOSE) console.debug('[vite]', ...msg);
	},
});

export function createHotContext(ownerPath: string): HMRContext {
	return new HMRContext(hmrClient, ownerPath);
}

let entryBoundarySettled: (() => unknown) | null = null;

/**
 * Called by the app entry on every evaluation. `settled` resolves once the
 * framework has finished booting the re-evaluated entry; a soft reboot awaits
 * it before `nativescript:afterReboot`.
 */
export function registerEntryBoundary(settled?: () => unknown): void {
	entryBoundarySettled = settled ?? (() => undefined);
}

/** The provider registered since the last {@link clearEntryBoundary}, if any. */
export function getEntryBoundarySettled(): (() => unknown) | null {
	return entryBoundarySettled;
}

export function clearEntryBoundary(): void {
	entryBoundarySettled = null;
}
