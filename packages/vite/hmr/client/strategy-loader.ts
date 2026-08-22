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
import { ENV_VERBOSE, resolveHmrHttpOrigin } from './utils.js';
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

// A flavor registered from outside the package (`registerFrameworkFlavor`)
// ships its client strategy in its own package; the dev server seeds that
// module's device path so the loader never has to know the package.
function resolveRegisteredClientStrategyUrl(): string | undefined {
	let devicePath: unknown;
	try {
		devicePath = typeof __NS_CLIENT_STRATEGY_URL__ === 'string' ? __NS_CLIENT_STRATEGY_URL__ : undefined;
	} catch {}
	if (!devicePath) {
		try {
			devicePath = getGlobalScope().__NS_CLIENT_STRATEGY_URL__;
		} catch {}
	}
	if (typeof devicePath !== 'string' || !devicePath) return undefined;
	if (/^https?:\/\//.test(devicePath)) return devicePath;
	const origin = resolveHmrHttpOrigin();
	return origin ? origin + devicePath : devicePath;
}

function pickClientStrategyExport(mod: any, flavor: string): FrameworkClientStrategy | undefined {
	const candidates = [mod?.default, mod?.clientStrategy, mod?.[`${flavor}ClientStrategy`]];
	return candidates.find((candidate) => candidate && typeof candidate.install === 'function');
}

// The strategy module's URL, absolute and dot-segment free. The runtime keys
// its module registry by the specifier it is handed, so a `../` specifier from
// a dev-served module would register the strategy under a non-canonical URL
// (`…/hmr/client/../frameworks/…`) — a second identity next to the canonical
// one, fetched outside the async graph walk. Resolving against
// `import.meta.url` here hands the loader the canonical URL up front.
function resolveClientStrategyUrl(flavor: string): string {
	const relative = `../frameworks/${flavor}/client/strategy.js`;
	try {
		const base = import.meta.url;
		if (typeof base === 'string' && /^https?:\/\//.test(base)) {
			return new URL(relative, base).href;
		}
	} catch {}
	return relative;
}

function clientStrategyModuleUrl(flavor: string): string | undefined {
	if (CLIENT_STRATEGY_FLAVORS.has(flavor)) return resolveClientStrategyUrl(flavor);
	return resolveRegisteredClientStrategyUrl();
}

const CLIENT_STRATEGY_URL = TARGET_FLAVOR ? clientStrategyModuleUrl(TARGET_FLAVOR) : undefined;

export const CLIENT_STRATEGY_READY: Promise<void> =
	TARGET_FLAVOR && CLIENT_STRATEGY_URL
		? import(/* @vite-ignore */ CLIENT_STRATEGY_URL)
				.then((mod: any) => {
					CLIENT_STRATEGY = pickClientStrategyExport(mod, TARGET_FLAVOR);
					if (!CLIENT_STRATEGY) {
						console.warn(`[hmr-client] ${CLIENT_STRATEGY_URL} exports no client strategy for flavor "${TARGET_FLAVOR}" (expected default, clientStrategy or ${TARGET_FLAVOR}ClientStrategy)`);
						return;
					}
					if (VERBOSE) console.log('[hmr-client] client strategy loaded for flavor:', TARGET_FLAVOR);
					CLIENT_STRATEGY.install();
				})
				.catch((err) => {
					console.warn('[hmr-client] failed to load client strategy for', TARGET_FLAVOR, err);
				})
		: Promise.resolve();

/** Undefined until `CLIENT_STRATEGY_READY` resolves (or when the flavor ships no client strategy). */
export function getClientStrategy(): FrameworkClientStrategy | undefined {
	return CLIENT_STRATEGY;
}
