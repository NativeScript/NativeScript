/**
 * Deprecated globals of the pre-thin `@nativescript/vite` HMR client, as opt-in shims over
 * `import.meta.hot`. `@nativescript/vite/hmr-compat` installs them in a dev session.
 *
 * Must not import the client (`hot-state.js` builds the HMR client when evaluated): the compat
 * entry imports this file statically, so a release or webpack build keeps whatever it imports.
 */
import type { UpdatePayload } from 'vite';
import { NS_UPDATE_RERUN_EVENT, type UpdateRerunEventData } from '../shared/protocol.js';

const GUIDE = 'See docs/vite-hmr-migration.md in NativeScript/angular.';

/** One-time warnings of the shimmed globals, keyed by global name. The migration guide quotes them. */
export const VITE_HMR_GLOBAL_DEPRECATIONS = {
	__NS_HOT_REGISTRY__: `[@nativescript/vite] globalThis.__NS_HOT_REGISTRY__ is deprecated: call import.meta.hot.on/off in the module that owns the listener, and remove root listeners on nativescript:beforeRerun. Listeners added through this shim are never removed when their module re-runs. ${GUIDE}`,
	__NS_HMR_ON_UPDATE__: `[@nativescript/vite] globalThis.__NS_HMR_ON_UPDATE__ is deprecated: use import.meta.hot.on('vite:afterUpdate', cb), or nativescript:afterReboot for soft reboots. ${GUIDE}`,
	__NS_DEV_ORIGIN__: `[@nativescript/vite] globalThis.__NS_DEV_ORIGIN__ is deprecated: use new URL(import.meta.url).origin inside if (import.meta.hot). ${GUIDE}`,
} as const;

export type ViteHmrGlobalName = keyof typeof VITE_HMR_GLOBAL_DEPRECATIONS;

type Listener = (payload: any) => unknown;

/** The part of `import.meta.hot` the shims use. */
export interface CompatHotContext {
	on(event: string, cb: Listener): void;
	off(event: string, cb: Listener): void;
}

/** Payload of the legacy `__NS_HMR_ON_UPDATE__` hook. */
export interface LegacyHmrUpdatePayload {
	type: 'delta';
	version: number;
	/** Vite URLs of the edited files, or of the updated modules when the server did not announce them. */
	changedIds: string[];
	raw: UpdatePayload;
}

export interface ViteHmrCompatDeps {
	hot: CompatHotContext;
	/** Dispatches to every `hot.on` listener on the device; returns how many there were. */
	dispatch?: (event: string, payload: unknown) => number;
	origin: string;
	warn?: (message: string) => void;
}

// Module scope: one entry instance per session, but the warnings must also survive a second install.
const warned = new Set<ViteHmrGlobalName>();
const installedOn = new WeakSet<object>();
const ANNOUNCED_RERUNS_KEPT = 16;

/** Test seam. */
export function resetViteHmrCompatWarnings(): void {
	warned.clear();
}

/**
 * The device's client behind a hot context. The thin client's `createHotContext` returns its
 * `HMRContext`, whose `hmrClient` field is that client; nothing public dispatches a client-side
 * event, and importing `hot-state.js` here would keep the client in release builds.
 */
export function clientDispatchOf(hot: unknown): ViteHmrCompatDeps['dispatch'] {
	const client = (hot as { hmrClient?: { notifyListeners?: unknown; customListenersMap?: Map<string, unknown[]> } } | null)?.hmrClient;
	if (!client || typeof client.notifyListeners !== 'function') return undefined;
	const notify = client.notifyListeners as (event: string, data: unknown) => Promise<void>;
	return (event, payload) => {
		const count = client.customListenersMap?.get(event)?.length ?? 0;
		notify.call(client, event, payload).catch((err) => console.error('[@nativescript/vite]', err));
		return count;
	};
}

/**
 * Defines the deprecated globals on `target`, each forwarding to `import.meta.hot` and warning
 * once. `__NS_HTTP_ORIGIN__` is not touched: the runtime still sets it.
 */
export function defineViteHmrCompatGlobals(target: object, deps: ViteHmrCompatDeps): void {
	if (installedOn.has(target)) return;
	installedOn.add(target);
	const warn = (name: ViteHmrGlobalName) => {
		if (warned.has(name)) return;
		warned.add(name);
		(deps.warn ?? console.warn)(VITE_HMR_GLOBAL_DEPRECATIONS[name]);
	};
	const define = (name: ViteHmrGlobalName, descriptor: PropertyDescriptor) => {
		if (name in target) return;
		Object.defineProperty(target, name, { configurable: true, ...descriptor });
	};

	const registry = Object.freeze({
		on: (event: string, cb: Listener) => deps.hot.on(event, cb),
		off: (event: string, cb: Listener) => deps.hot.off(event, cb),
		dispatchHotEvent: (event: string, payload?: unknown): number => deps.dispatch?.(event, payload) ?? 0,
	});
	define('__NS_HOT_REGISTRY__', {
		get: () => {
			warn('__NS_HOT_REGISTRY__');
			return registry;
		},
		set: () => warn('__NS_HOT_REGISTRY__'),
	});

	let onUpdate: unknown;
	let version = 0;
	const announced = new Map<number, string[]>();
	deps.hot.on(NS_UPDATE_RERUN_EVENT, (data: UpdateRerunEventData) => {
		announced.set(data.timestamp, data.changed);
		for (const timestamp of announced.keys()) {
			if (announced.size <= ANNOUNCED_RERUNS_KEPT) break;
			announced.delete(timestamp);
		}
	});
	// After a soft reboot too: the client sends `vite:afterUpdate` once `nativescript:afterReboot` is done.
	deps.hot.on('vite:afterUpdate', (payload: UpdatePayload) => {
		const timestamp = payload.updates.find((u) => u.type === 'js-update')?.timestamp;
		const changed = timestamp === undefined ? undefined : announced.get(timestamp);
		if (timestamp !== undefined) announced.delete(timestamp);
		if (typeof onUpdate !== 'function') return;
		const changedIds = changed ?? Array.from(new Set(payload.updates.map((u) => u.path)));
		try {
			(onUpdate as (p: LegacyHmrUpdatePayload) => void)({ type: 'delta', version: ++version, changedIds, raw: payload });
		} catch (err) {
			console.error('[@nativescript/vite] __NS_HMR_ON_UPDATE__ threw:', err);
		}
	});
	define('__NS_HMR_ON_UPDATE__', {
		get: () => {
			warn('__NS_HMR_ON_UPDATE__');
			return onUpdate;
		},
		set: (fn: unknown) => {
			warn('__NS_HMR_ON_UPDATE__');
			onUpdate = fn;
		},
	});

	define('__NS_DEV_ORIGIN__', {
		get: () => {
			warn('__NS_DEV_ORIGIN__');
			return deps.origin;
		},
		set: () => warn('__NS_DEV_ORIGIN__'),
	});
}
