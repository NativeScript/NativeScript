/**
 * Flavor detection + framework client-strategy loading.
 *
 * The shared client talks to frameworks only through the client-strategy seam
 * (`framework-client-strategy.ts`). The strategy is loaded by ONE dynamic
 * per-flavor `import()` so a device only ever fetches its OWN framework's client
 * module — a Vue app never fetches the Angular client, and vice versa.
 *
 * The load is async (one HTTP-ESM fetch on device), so `CLIENT_STRATEGY_READY`
 * is awaited at the top of `handleHmrMessage` before any message is processed —
 * every strategy call site downstream of message processing therefore observes a
 * fully-installed strategy. `install()` itself is best-effort (idempotent dev
 * shims) and not boot-critical, so resolving it slightly after module load is
 * safe.
 */

import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { ENV_VERBOSE } from './utils.js';
import type { FrameworkClientStrategy } from './framework-client-strategy.js';

const VERBOSE = ENV_VERBOSE;

function resolveTargetFlavor(): string | undefined {
	try {
		if (typeof __NS_TARGET_FLAVOR__ !== 'undefined' && __NS_TARGET_FLAVOR__) {
			return __NS_TARGET_FLAVOR__;
		}
	} catch {}
	try {
		const g: any = getGlobalScope();
		if (typeof g.__NS_TARGET_FLAVOR__ === 'string' && g.__NS_TARGET_FLAVOR__) {
			return g.__NS_TARGET_FLAVOR__;
		}
		if (typeof g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__ === 'string' && g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__) {
			return g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__;
		}
		if (typeof g.__reboot_ng_modules__ === 'function') {
			return 'angular';
		}
		if (g.__VUE_HMR_RUNTIME__ || g.__NS_HMR_VUE_SFC_REGISTRY__) {
			return 'vue';
		}
	} catch {}
	return undefined;
}

export const TARGET_FLAVOR = resolveTargetFlavor();

// React reuses the generic TypeScript HMR path on BOTH server and client: it has
// no Fast Refresh, so a module edit drives a plain module reload / root reset
// (the React tree re-renders), exactly like the `typescript` flavor. The server
// strategy is `{ ...typescriptServerStrategy, flavor: 'react' }`; this mirrors that
// on the client so the `typescript`-gated update branches also run for React
// (otherwise a React edit is received but never applied — the overlay sticks).
export const TS_LIKE_FLAVOR = TARGET_FLAVOR === 'typescript' || TARGET_FLAVOR === 'react';

try {
	if (TARGET_FLAVOR && !globalThis.__NS_TARGET_FLAVOR__) {
		globalThis.__NS_TARGET_FLAVOR__ = TARGET_FLAVOR;
	}
} catch {}

// Define substitution does NOT reach this file (served raw from node_modules),
// so prefer the globalThis seed planted by the entry's defines-seed module —
// the '/src' literal is a last-resort default and is WRONG for 'app/'-rooted
// projects.
export const APP_ROOT_VIRTUAL = (typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__) || (typeof getGlobalScope().__NS_APP_ROOT_VIRTUAL__ === 'string' && getGlobalScope().__NS_APP_ROOT_VIRTUAL__) || '/src';
export const APP_VIRTUAL_WITH_SLASH = APP_ROOT_VIRTUAL.endsWith('/') ? APP_ROOT_VIRTUAL : `${APP_ROOT_VIRTUAL}/`;
export const APP_MAIN_ENTRY_SPEC = `${APP_VIRTUAL_WITH_SLASH}app.ts`;

const CLIENT_STRATEGY_FLAVORS = new Set(['vue', 'angular', 'solid', 'typescript', 'react']);
let CLIENT_STRATEGY: FrameworkClientStrategy | undefined;

export const CLIENT_STRATEGY_READY: Promise<void> =
	TARGET_FLAVOR && CLIENT_STRATEGY_FLAVORS.has(TARGET_FLAVOR)
		? import(`../frameworks/${TARGET_FLAVOR}/client/strategy.js`)
				.then((mod: any) => {
					CLIENT_STRATEGY = mod && mod[`${TARGET_FLAVOR}ClientStrategy`];
					if (VERBOSE) console.log('[hmr-client] client strategy loaded for flavor:', TARGET_FLAVOR);
					CLIENT_STRATEGY?.install();
				})
				.catch((err) => {
					console.warn('[hmr-client] failed to load client strategy for', TARGET_FLAVOR, err);
				})
		: Promise.resolve();

/** Undefined until `CLIENT_STRATEGY_READY` resolves (or when the flavor ships no client strategy). */
export function getClientStrategy(): FrameworkClientStrategy | undefined {
	return CLIENT_STRATEGY;
}
