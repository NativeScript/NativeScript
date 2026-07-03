import { getGlobalScope } from './global-scope.js';
import { readNsRuntimeDevHostApi } from './browser-runtime-contract.js';

/**
 * Flip the dev-boot-complete signal from JS.
 *
 * Sets the JS-visible `__NS_HMR_BOOT_COMPLETE__` global (every existing
 * poller keys off it) AND — when the runtime exposes it — calls
 * `__NS_DEV__.setDevBootComplete(value)` so the native atomic that gates
 * cold-boot-only behaviors (JS-thread runloop pump between synchronous
 * fetches, kickstart pump-wait) is disarmed/re-armed in lockstep.
 *
 * Safe on runtimes without the native setter (Android today, tests): the
 * JS global still flips and the native call is skipped.
 */
export function setDevBootComplete(value: boolean): void {
	const g: any = getGlobalScope();
	try {
		g.__NS_HMR_BOOT_COMPLETE__ = value;
	} catch {}
	try {
		const nativeSetter = readNsRuntimeDevHostApi(g).setDevBootComplete;
		if (typeof nativeSetter === 'function') {
			nativeSetter(value);
		}
	} catch {}
}

export function markDevBootComplete(): void {
	setDevBootComplete(true);
}
