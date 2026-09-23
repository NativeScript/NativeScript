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
	/**
	 * `hot.accept(dep | deps, cb)` registrations by the CURRENT evaluation,
	 * keyed by the dependency's canonical hot key. Mirrored into the
	 * registry-wide `depAcceptors` index so an update to the dependency can
	 * find its acceptors without an import edge — the spawner of a Worker
	 * accepts the worker script this way, and the graph carries no edge
	 * between them.
	 */
	acceptDeps: Map<string, HotCallback>;
	disposeCallbacks: HotCallback[];
	pruneCallbacks: HotCallback[];
	declined: boolean;
	/**
	 * Custom-event listeners (`hot.on`) registered by the module's CURRENT
	 * evaluation, so the next evaluation can prune them from the global
	 * registry (Vite parity: stock Vite clears a module's stale event
	 * listeners in `createHotContext`). Without pruning, every re-evaluation
	 * (eviction + re-import, reboots) stacks another listener holding the
	 * previous module instance in its closure — for Angular that means each
	 * `angular:component-update` fans out to N stale
	 * `Component_HmrLoad` fetches + `ɵɵreplaceMetadata` calls against dead
	 * component classes.
	 */
	ownListeners?: Map<string, Set<HotCallback>>;
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
	/**
	 * Accept callbacks registered by `key`'s CURRENT evaluation (a copy; an
	 * argument-less `hot.accept()` contributes a no-op). They belong to the
	 * module instance being replaced, so a framework strategy must read them
	 * BEFORE eviction — `createHotContext` resets them the moment the fresh body
	 * evaluates — and invoke them with the fresh namespace afterwards (Vite's
	 * accept contract). A non-empty result is what makes a module a
	 * self-accepting HMR boundary.
	 */
	getAcceptCallbacks(key: string): HotCallback[];
	/**
	 * Modules whose CURRENT evaluation accepts updates to `depKey` through the
	 * dependency form of `hot.accept`. Each callback takes the array Vite
	 * passes (`[freshNamespace]`, `[undefined]` when the dependency does not
	 * evaluate in this realm). Same lifetime rule as `getAcceptCallbacks`.
	 */
	getDepAcceptors(depKey: string): Array<{ owner: string; callback: HotCallback }>;
	/** True when `ownerKey`'s current evaluation accepts `depKey` via the dependency form. */
	acceptsDep(ownerKey: string, depKey: string): boolean;
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

/**
 * Canonical hot key of a dependency specifier as written in `hot.accept` —
 * relative to the owner module's key (`./embers`, `../util/x`) or already
 * root-absolute (`/src/x`). Bare specifiers are not hot-acceptable (they are
 * vendor modules) and yield ''.
 */
function resolveDepHotKey(ownerKey: string, specifier: string): string {
	if (typeof specifier !== 'string' || !specifier) return '';
	const spec = specifier.trim();
	if (/^https?:\/\//i.test(spec) || spec.startsWith('/')) return canonicalHotKey(spec);
	if (!spec.startsWith('.')) return '';
	const base = ownerKey.slice(0, ownerKey.lastIndexOf('/') + 1) || '/';
	const segments: string[] = base.split('/').filter(Boolean);
	for (const part of spec.split('/')) {
		if (part === '' || part === '.') continue;
		if (part === '..') segments.pop();
		else segments.push(part);
	}
	return canonicalHotKey('/' + segments.join('/'));
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
	// depKey → owner keys whose current evaluation accepts it.
	const depAcceptors = new Map<string, Set<string>>();
	let sendToServer: ((event: string, data?: unknown) => void) | null = null;
	let fullReloadHandler: ((message?: string) => void) | null = null;

	const entryFor = (key: string): HotModuleEntry => {
		let entry = modules.get(key);
		if (!entry) {
			entry = { data: {}, acceptCallbacks: [], acceptDeps: new Map(), disposeCallbacks: [], pruneCallbacks: [], declined: false };
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

	// A graph reload replaces what the app owns and nothing else. `@nativescript/core`
	// (`/ns/core*`), the vendor bundle and per-file vendor modules (`/ns/m/node_modules/*`)
	// evaluate once per process: core re-evaluated in place would mint a second
	// `View` hierarchy the still-live native views fail `instanceof` against, and
	// vendor re-evaluation would split every singleton a plugin keeps. The
	// running dev client keeps its identity for the same reason.
	const isAppOwnedModuleUrl = (url: string, origin: string): boolean => {
		if (!url.startsWith(origin)) return false;
		const path = url.slice(origin.length).replace(/[?#].*$/, '');
		if (path.startsWith('/ns/m/')) return !path.startsWith('/ns/m/node_modules/');
		return path.startsWith('/ns/sfc') || path.startsWith('/ns/asm');
	};

	const jsFullReload = (message?: string): void => {
		const g: any = globalThis;
		const entryUrl = typeof g.__NS_DEV_ENTRY_URL__ === 'string' ? g.__NS_DEV_ENTRY_URL__ : '';
		if (!entryUrl) {
			console.warn('[ns-hot] full reload requested but no dev entry URL is known', message || '');
			registry.dispatchHotEvent('ns:full-reload-failed', { message: 'no dev entry URL is known' });
			return;
		}
		registry.dispatchHotEvent('vite:beforeFullReload', { message: message || '' });
		// Every app module is about to be replaced, so its `hot.dispose`
		// registrations are due now — the in-process analogue of the page
		// teardown a browser reload implies (an entry module uses this to
		// unmount the root it created before the re-evaluated entry mounts a
		// new one).
		registry.runDispose();
		try {
			// Evict every same-origin module EXCEPT the dev-client modules (the
			// running HMR client must keep its singleton identity) so the entry
			// re-import re-fetches and re-evaluates the whole app graph. The
			// `Application.run` patch (root-placeholder.ts) converts re-entry
			// into `resetRootView`, so no second UIApplicationMain is involved.
			const origin = entryUrl.replace(/^(https?:\/\/[^/]+).*$/i, '$1');
			// Inline `ns:module` require instead of `readNsRuntimeDevHostApi` —
			// this file stays import-free (see the header note) because it is
			// served to the device independently of the client bundle.
			let dev: any;
			try {
				dev = typeof g.require === 'function' ? g.require('ns:module') : undefined;
			} catch {
				dev = undefined;
			}
			const getUrls = dev?.getLoadedModuleUrls;
			const invalidate = dev?.invalidateModules;
			const list = typeof getUrls === 'function' ? getUrls() : [];
			const evict = (Array.isArray(list) ? list : []).filter((u: unknown): u is string => typeof u === 'string' && isAppOwnedModuleUrl(u, origin));
			if (evict.length && typeof invalidate === 'function') {
				invalidate(evict);
			}
			if (VERBOSE) {
				console.info(`[ns-hot] full reload: evicted ${evict.length} modules, re-importing ${entryUrl}`);
			}
		} catch (err) {
			console.warn('[ns-hot] full reload eviction failed:', (err as any)?.message ?? err);
		}
		// Module re-evaluation drives the app reset; the settled import is the
		// only signal that the reloaded graph has finished evaluating.
		void import(/* @vite-ignore */ entryUrl)
			.then(() => {
				registry.dispatchHotEvent('ns:full-reload-complete', { message: message || '' });
			})
			.catch((err) => {
				console.warn('[ns-hot] full reload entry re-import failed:', (err as any)?.message ?? err);
				registry.dispatchHotEvent('ns:full-reload-failed', { message: String((err as any)?.message ?? err) });
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
			for (const depKey of entry.acceptDeps.keys()) {
				const owners = depAcceptors.get(depKey);
				owners?.delete(key);
				if (owners && owners.size === 0) depAcceptors.delete(depKey);
			}
			entry.acceptDeps = new Map();
			entry.disposeCallbacks = [];
			entry.pruneCallbacks = [];
			entry.declined = false;
			// Prune the previous evaluation's `hot.on` listeners (see
			// `HotModuleEntry.ownListeners`) — they close over the replaced
			// module instance and would otherwise fire forever.
			if (entry.ownListeners) {
				for (const [event, callbacks] of entry.ownListeners) {
					const globalSet = eventListeners.get(event);
					if (!globalSet) continue;
					for (const cb of callbacks) {
						globalSet.delete(cb);
					}
					if (globalSet.size === 0) {
						eventListeners.delete(event);
					}
				}
			}
			const ownListeners = new Map<string, Set<HotCallback>>();
			entry.ownListeners = ownListeners;
			return {
				get data() {
					return entry.data;
				},
				accept(...args: unknown[]) {
					const cb = args.find((a) => typeof a === 'function') as HotCallback | undefined;
					const deps = typeof args[0] === 'string' ? [args[0]] : Array.isArray(args[0]) ? args[0] : null;
					if (deps === null) {
						entry.acceptCallbacks.push(cb || (() => {}));
						return;
					}
					for (const dep of deps) {
						const depKey = resolveDepHotKey(key, String(dep));
						if (!depKey) continue;
						entry.acceptDeps.set(depKey, cb || (() => {}));
						let owners = depAcceptors.get(depKey);
						if (!owners) {
							owners = new Set();
							depAcceptors.set(depKey, owners);
						}
						owners.add(key);
					}
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
		getAcceptCallbacks(key: string): HotCallback[] {
			const entry = modules.get(canonicalHotKey(String(key)));
			return entry ? entry.acceptCallbacks.slice() : [];
		},
		getDepAcceptors(depKey: string) {
			const owners = depAcceptors.get(canonicalHotKey(String(depKey)));
			if (!owners) return [];
			const out: Array<{ owner: string; callback: HotCallback }> = [];
			for (const owner of owners) {
				const callback = modules.get(owner)?.acceptDeps.get(canonicalHotKey(String(depKey)));
				if (callback) out.push({ owner, callback });
			}
			return out;
		},
		acceptsDep(ownerKey: string, depKey: string): boolean {
			return modules.get(canonicalHotKey(String(ownerKey)))?.acceptDeps.has(canonicalHotKey(String(depKey))) === true;
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
