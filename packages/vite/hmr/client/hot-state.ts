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
