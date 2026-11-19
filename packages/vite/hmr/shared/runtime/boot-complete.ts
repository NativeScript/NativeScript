import { nsRuntimeDevHostApi } from './runtime-host.js';
import { nsDev } from './dev-globals.js';

/**
 * Flip the dev-boot-complete signal from JS.
 *
 * Sets the dev globals' `bootComplete` (every JS poller keys off it) AND —
 * when the runtime exposes it — calls ns:module `setDevBootComplete(value)`
 * so the native atomic that gates cold-boot-only behaviors (JS-thread
 * runloop pump between synchronous fetches) is disarmed/re-armed in lockstep.
 *
 * Safe on runtimes without the native setter (Android today, tests): the
 * JS flag still flips and the native call is skipped.
 */
export function setDevBootComplete(value: boolean): void {
	nsDev().bootComplete = value;
	try {
		const nativeSetter = nsRuntimeDevHostApi().setDevBootComplete;
		if (typeof nativeSetter === 'function') {
			nativeSetter(value);
		}
	} catch {}
}

export function markDevBootComplete(): void {
	setDevBootComplete(true);
}
