/**
 * JS-owned `import.meta.hot` implementation (Vite-style injected hot contexts).
 *
 * `import.meta.hot` is HMR *policy* and lives entirely in this package — the
 * native runtimes expose no hot API. The dev server injects
 *
 *   import.meta.hot = globalThis.__NS_HOT_REGISTRY__?.createHotContext('<canonical-id>')
 *
 * at the top of every served app module (see `processCodeForDevice`), and this
 * module owns every registry the hot API needs. The registry is installed on
 * `globalThis.__NS_HOT_REGISTRY__` by `installNsHotRegistry()`, which the
 * `/__ns_dev__/client` bootstrap runs before the entry graph evaluates.
 *
 * Process-wide singleton: state is stashed on globalThis so that a second
 * copy of this module (e.g. loaded under a different URL) shares the same
 * registries instead of splitting them.
 *
 * No circulars — don't import from other hmr/client/* modules here.
 */

export interface NsHotEventPayload {
	[key: string]: unknown;
}

type HotCallback = (...args: unknown[]) => unknown;

interface HotModuleEntry {
	data: Record<string, unknown>;
	acceptCallbacks: HotCallback[];
	disposeCallbacks: HotCallback[];
	pruneCallbacks: HotCallback[];
	declined: boolean;
}

export interface NsHotRegistry {
	createHotContext(ownerId: string): NsHotContext;
	canonicalHotKey(id: string): string;
	/** Drain `hot.dispose(cb)` callbacks (all modules, or a key subset). Returns count executed. */
	runDispose(keys?: readonly string[]): number;
	/** Drain `hot.prune(cb)` callbacks (all modules, or a key subset). Returns count executed. */
	runPrune(keys?: readonly string[]): number;
	/** True when any module (or any module in the key subset) called `hot.decline()`. */
	hasDeclined(keys?: readonly string[]): boolean;
	/** Fire `hot.on(event, cb)` listeners. Returns the number of listeners invoked. */
	dispatchHotEvent(event: string, payload?: unknown): number;
	listHotEventListeners(): Record<string, number>;
	/** Wire `hot.send(...)` to the active WebSocket (installed by the full client). */
	setSendToServer(fn: ((event: string, data?: unknown) => void) | null): void;
	/** Override the full-reload behavior (`hot.invalidate()`, declined modules). */
	setFullReloadHandler(fn: ((message?: string) => void) | null): void;
	requestFullReload(message?: string): void;
}

export interface NsHotContext {
	readonly data: Record<string, unknown>;
	accept(...args: unknown[]): void;
	acceptExports(exportNames: string[], cb?: HotCallback): void;
	dispose(cb: HotCallback): void;
	prune(cb: HotCallback): void;
	decline(): void;
	invalidate(message?: string): void;
	on(event: string, cb: HotCallback): void;
	off(event: string, cb: HotCallback): void;
	send(event: string, data?: unknown): void;
}

declare global {
	// eslint-disable-next-line no-var
	var __NS_HOT_REGISTRY__: NsHotRegistry | undefined;
	// eslint-disable-next-line no-var
	var __NS_DEV_ENTRY_URL__: string | undefined;
}

const SCRIPT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i;

// Canonicalize a module identifier so cold-boot URLs, HMR re-import URLs and
// server-injected ids all land on the SAME hot entry (matching module identity
// in the runtime: one canonical URL per module, extensionless app-module form).
function canonicalHotKey(id: string): string {
	if (typeof id !== 'string' || !id) return '';
	let key = id.trim();
	// Absolute URL → path.
	key = key.replace(/^https?:\/\/[^/]+/i, '');
	// Query/hash never contribute to identity.
	key = key.replace(/[?#].*$/, '');
	// Device-module route prefix.
	if (key.startsWith('/ns/m/')) key = key.slice('/ns/m'.length);
	// Inbound tolerance: collapse tagged spellings if one ever arrives
	// (the server never emits them).
	key = key.replace(/^\/__ns_boot__\/b1\//, '/').replace(/^\/__ns_hmr__\/[^/]+\//, '/');
	key = key.replace(SCRIPT_EXT_RE, '');
	if (!key.startsWith('/')) key = '/' + key;
	return key;
}

const VERBOSE: boolean = (() => {
	try {
		return globalThis.__NS_ENV_VERBOSE__ === true;
	} catch {
		return false;
	}
})();

function createRegistry(): NsHotRegistry {
	const modules = new Map<string, HotModuleEntry>();
	const eventListeners = new Map<string, Set<HotCallback>>();
	let sendToServer: ((event: string, data?: unknown) => void) | null = null;
	let fullReloadHandler: ((message?: string) => void) | null = null;

	const entryFor = (key: string): HotModuleEntry => {
		let entry = modules.get(key);
		if (!entry) {
			entry = { data: {}, acceptCallbacks: [], disposeCallbacks: [], pruneCallbacks: [], declined: false };
			modules.set(key, entry);
		}
		return entry;
	};

	const keysToDrain = (keys?: readonly string[]): string[] => {
		if (!keys || !keys.length) return Array.from(modules.keys());
		const wanted = new Set(keys.map((k) => canonicalHotKey(String(k))));
		return Array.from(modules.keys()).filter((k) => wanted.has(k));
	};

	const drain = (which: 'disposeCallbacks' | 'pruneCallbacks', keys?: readonly string[]): number => {
		let executed = 0;
		for (const key of keysToDrain(keys)) {
			const entry = modules.get(key);
			if (!entry) continue;
			const callbacks = entry[which].splice(0);
			for (const cb of callbacks) {
				try {
					cb(entry.data);
					executed++;
				} catch (err) {
					// One bad callback must not break the HMR cycle.
					console.warn(`[ns-hot] ${which === 'disposeCallbacks' ? 'dispose' : 'prune'} callback threw for ${key}:`, (err as any)?.message ?? err);
				}
			}
		}
		return executed;
	};

	const jsFullReload = (message?: string): void => {
		const g: any = globalThis;
		const entryUrl = typeof g.__NS_DEV_ENTRY_URL__ === 'string' ? g.__NS_DEV_ENTRY_URL__ : '';
		if (!entryUrl) {
			console.warn('[ns-hot] full reload requested but no dev entry URL is known', message || '');
			return;
		}
		registry.dispatchHotEvent('vite:beforeFullReload', { message: message || '' });
		try {
			// Evict every same-origin module EXCEPT the dev-client modules (the
			// running HMR client must keep its singleton identity) so the entry
			// re-import re-fetches and re-evaluates the whole app graph. The
			// `Application.run` patch (root-placeholder.ts) converts re-entry
			// into `resetRootView`, so no second UIApplicationMain is involved.
			const origin = entryUrl.replace(/^(https?:\/\/[^/]+).*$/i, '$1');
			// Inline `__NS_DEV__` read instead of `readNsRuntimeDevHostApi` —
			// this file stays import-free (see the header note) because it is
			// served to the device independently of the client bundle.
			const dev = g.__NS_DEV__;
			const getUrls = dev?.getLoadedModuleUrls;
			const invalidate = dev?.invalidateModules;
			const list = typeof getUrls === 'function' ? getUrls() : [];
			const evict = (Array.isArray(list) ? list : []).filter((u: unknown): u is string => typeof u === 'string' && u.startsWith(origin) && !u.includes('/__ns_dev__/') && !u.includes('/node_modules/@nativescript/vite/'));
			if (evict.length && typeof invalidate === 'function') {
				invalidate(evict);
			}
			if (VERBOSE) {
				console.info(`[ns-hot] full reload: evicted ${evict.length} modules, re-importing ${entryUrl}`);
			}
		} catch (err) {
			console.warn('[ns-hot] full reload eviction failed:', (err as any)?.message ?? err);
		}
		// Fire and forget — module re-evaluation drives the app reset.
		void import(/* @vite-ignore */ entryUrl).catch((err) => {
			console.warn('[ns-hot] full reload entry re-import failed:', (err as any)?.message ?? err);
		});
	};

	const registry: NsHotRegistry = {
		canonicalHotKey,
		createHotContext(ownerId: string): NsHotContext {
			const key = canonicalHotKey(ownerId);
			const entry = entryFor(key);
			// Fresh evaluation of the module: previous accept/dispose/prune
			// registrations belong to the replaced instance. `data` persists.
			entry.acceptCallbacks = [];
			entry.disposeCallbacks = [];
			entry.pruneCallbacks = [];
			entry.declined = false;
			const ownListeners = new Map<string, Set<HotCallback>>();
			return {
				get data() {
					return entry.data;
				},
				accept(...args: unknown[]) {
					const cb = args.find((a) => typeof a === 'function') as HotCallback | undefined;
					entry.acceptCallbacks.push(cb || (() => {}));
				},
				acceptExports(_exportNames: string[], cb?: HotCallback) {
					entry.acceptCallbacks.push(cb || (() => {}));
				},
				dispose(cb: HotCallback) {
					if (typeof cb === 'function') entry.disposeCallbacks.push(cb);
				},
				prune(cb: HotCallback) {
					if (typeof cb === 'function') entry.pruneCallbacks.push(cb);
				},
				decline() {
					entry.declined = true;
				},
				invalidate(message?: string) {
					registry.requestFullReload(message ? `${key}: ${message}` : `${key} invalidated`);
				},
				on(event: string, cb: HotCallback) {
					if (typeof event !== 'string' || typeof cb !== 'function') return;
					let set = eventListeners.get(event);
					if (!set) {
						set = new Set();
						eventListeners.set(event, set);
					}
					set.add(cb);
					let own = ownListeners.get(event);
					if (!own) {
						own = new Set();
						ownListeners.set(event, own);
					}
					own.add(cb);
				},
				off(event: string, cb: HotCallback) {
					eventListeners.get(event)?.delete(cb);
					ownListeners.get(event)?.delete(cb);
				},
				send(event: string, data?: unknown) {
					if (sendToServer) {
						try {
							sendToServer(event, data);
						} catch (err) {
							console.warn('[ns-hot] hot.send failed:', (err as any)?.message ?? err);
						}
					} else if (VERBOSE) {
						console.warn(`[ns-hot] hot.send('${event}') dropped — no server socket wired yet`);
					}
				},
			};
		},
		runDispose(keys?: readonly string[]): number {
			return drain('disposeCallbacks', keys);
		},
		runPrune(keys?: readonly string[]): number {
			return drain('pruneCallbacks', keys);
		},
		hasDeclined(keys?: readonly string[]): boolean {
			for (const key of keysToDrain(keys)) {
				if (modules.get(key)?.declined) return true;
			}
			return false;
		},
		dispatchHotEvent(event: string, payload?: unknown): number {
			const listeners = eventListeners.get(event);
			if (!listeners || !listeners.size) return 0;
			let invoked = 0;
			for (const cb of Array.from(listeners)) {
				try {
					cb(payload);
					invoked++;
				} catch (err) {
					// Per-listener failures are swallowed so a single bad
					// listener can't break the dispatch.
					console.warn(`[ns-hot] listener for '${event}' threw:`, (err as any)?.message ?? err);
				}
			}
			return invoked;
		},
		listHotEventListeners(): Record<string, number> {
			const out: Record<string, number> = {};
			for (const [event, set] of eventListeners) {
				if (set.size) out[event] = set.size;
			}
			return out;
		},
		setSendToServer(fn) {
			sendToServer = typeof fn === 'function' ? fn : null;
		},
		setFullReloadHandler(fn) {
			fullReloadHandler = typeof fn === 'function' ? fn : null;
		},
		requestFullReload(message?: string) {
			if (fullReloadHandler) {
				try {
					fullReloadHandler(message);
					return;
				} catch (err) {
					console.warn('[ns-hot] full-reload handler threw; using built-in reload:', (err as any)?.message ?? err);
				}
			}
			jsFullReload(message);
		},
	};

	return registry;
}

/**
 * Install (or return the already-installed) process-wide hot registry.
 * Idempotent — safe to call from the bootstrap client, the full client and
 * tests; the first installation wins.
 */
export function installNsHotRegistry(): NsHotRegistry {
	const g: any = globalThis;
	if (g.__NS_HOT_REGISTRY__ && typeof g.__NS_HOT_REGISTRY__.createHotContext === 'function') {
		return g.__NS_HOT_REGISTRY__ as NsHotRegistry;
	}
	const registry = createRegistry();
	try {
		g.__NS_HOT_REGISTRY__ = registry;
	} catch {}
	return registry;
}

/** Read the installed registry (installing lazily so callers never race). */
export function getNsHotRegistry(): NsHotRegistry {
	return installNsHotRegistry();
}

export function createHotContext(ownerId: string): NsHotContext {
	return getNsHotRegistry().createHotContext(ownerId);
}
