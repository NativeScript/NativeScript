/**
 * Port of Vite's shared HMR client (`vite/src/shared/hmr.ts` and
 * `hmrHandler.ts`): hot contexts keyed by the exact Vite URL that
 * `createHotContext(ownerPath)` receives, the accept/dispose/prune maps, the
 * update queue and the serialized message queue.
 *
 * Pure: no socket, no globals, no device APIs. The transport and the module
 * importer are attached by the device entry (`index.ts`) when it connects.
 */
import type { Update } from 'vite';

export type ModuleNamespace = Record<string, any>;

export interface HotCallback {
	deps: string[];
	fn: (modules: Array<ModuleNamespace | undefined>) => void;
	exports?: string[];
}

export interface HotModule {
	id: string;
	callbacks: HotCallback[];
}

export type CustomListener = (data: any) => unknown;

export interface HMRLogger {
	error(msg: unknown): void;
	debug(...msg: unknown[]): void;
}

export interface HMRTransport {
	send(payload: unknown): Promise<void>;
}

export type ImportUpdatedModule = (update: Update) => Promise<ModuleNamespace>;

export class SendBeforeConnectError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SendBeforeConnectError';
	}
}

const DISCONNECTED_TRANSPORT: HMRTransport = {
	send: () => Promise.reject(new SendBeforeConnectError('send was called before connect')),
};

const NO_IMPORTER: ImportUpdatedModule = () => Promise.reject(new Error('the HMR client is not connected'));

export class HMRContext {
	private hmrClient: HMRClient;
	private ownerPath: string;
	private newListeners: Map<string, CustomListener[]>;

	constructor(hmrClient: HMRClient, ownerPath: string) {
		this.hmrClient = hmrClient;
		this.ownerPath = ownerPath;
		if (!hmrClient.dataMap.has(ownerPath)) {
			hmrClient.dataMap.set(ownerPath, {});
		}
		const mod = hmrClient.hotModulesMap.get(ownerPath);
		if (mod) {
			mod.callbacks = [];
		}
		const staleListeners = hmrClient.ctxToListenersMap.get(ownerPath);
		if (staleListeners) {
			for (const [event, staleFns] of staleListeners) {
				const listeners = hmrClient.customListenersMap.get(event);
				if (listeners) {
					hmrClient.customListenersMap.set(
						event,
						listeners.filter((l) => !staleFns.includes(l)),
					);
				}
			}
		}
		this.newListeners = new Map();
		hmrClient.ctxToListenersMap.set(ownerPath, this.newListeners);
		hmrClient.declinedPaths.delete(ownerPath);
	}

	get data(): any {
		return this.hmrClient.dataMap.get(this.ownerPath);
	}

	accept(deps?: any, callback?: any): void {
		if (typeof deps === 'function' || !deps) {
			this.acceptDeps([this.ownerPath], ([mod]) => deps?.(mod));
		} else if (typeof deps === 'string') {
			this.acceptDeps([deps], ([mod]) => callback?.(mod));
		} else if (Array.isArray(deps)) {
			this.acceptDeps(deps, callback);
		} else {
			throw new Error(`invalid hot.accept() usage.`);
		}
	}

	acceptExports(exportNames: string | readonly string[], callback?: (mod: ModuleNamespace | undefined) => void): void {
		this.acceptDeps([this.ownerPath], ([mod]) => callback?.(mod), typeof exportNames === 'string' ? [exportNames] : [...exportNames]);
	}

	dispose(cb: (data: any) => void): void {
		this.hmrClient.disposeMap.set(this.ownerPath, cb);
	}

	prune(cb: (data: any) => void): void {
		this.hmrClient.pruneMap.set(this.ownerPath, cb);
	}

	/** Vite treats this as a no-op; NativeScript restarts the app instead of applying a change to a declined module. */
	decline(): void {
		this.hmrClient.declinedPaths.add(this.ownerPath);
	}

	invalidate(message?: string): void {
		const firstInvalidatedBy = this.hmrClient.currentFirstInvalidatedBy ?? this.ownerPath;
		this.hmrClient.notifyListeners('vite:invalidate', {
			path: this.ownerPath,
			message,
			firstInvalidatedBy,
		});
		this.send('vite:invalidate', {
			path: this.ownerPath,
			message,
			firstInvalidatedBy,
		});
		this.hmrClient.logger.debug(`invalidate ${this.ownerPath}${message ? `: ${message}` : ''}`);
	}

	on(event: string, cb: CustomListener): void {
		const addToMap = (map: Map<string, CustomListener[]>) => {
			const existing = map.get(event) || [];
			existing.push(cb);
			map.set(event, existing);
		};
		addToMap(this.hmrClient.customListenersMap);
		addToMap(this.newListeners);
	}

	off(event: string, cb: CustomListener): void {
		const removeFromMap = (map: Map<string, CustomListener[]>) => {
			const existing = map.get(event);
			if (existing === undefined) {
				return;
			}
			const pruned = existing.filter((l) => l !== cb);
			if (pruned.length === 0) {
				map.delete(event);
				return;
			}
			map.set(event, pruned);
		};
		removeFromMap(this.hmrClient.customListenersMap);
		removeFromMap(this.newListeners);
	}

	send(event: string, data?: unknown): void {
		this.hmrClient.send({ type: 'custom', event, data });
	}

	private acceptDeps(deps: string[], callback: HotCallback['fn'] = () => {}, exports?: string[]): void {
		const mod: HotModule = this.hmrClient.hotModulesMap.get(this.ownerPath) || {
			id: this.ownerPath,
			callbacks: [],
		};
		mod.callbacks.push({ deps, fn: callback, exports });
		this.hmrClient.hotModulesMap.set(this.ownerPath, mod);
	}
}

export class HMRClient {
	hotModulesMap = new Map<string, HotModule>();
	disposeMap = new Map<string, (data: any) => void | Promise<void>>();
	pruneMap = new Map<string, (data: any) => void | Promise<void>>();
	dataMap = new Map<string, any>();
	customListenersMap = new Map<string, CustomListener[]>();
	ctxToListenersMap = new Map<string, Map<string, CustomListener[]>>();
	/** Owner paths whose current evaluation called `hot.decline()`. */
	declinedPaths = new Set<string>();
	currentFirstInvalidatedBy: string | undefined;

	private updateQueue: Array<Promise<(() => void) | undefined>> = [];
	private pendingUpdateQueue = false;

	logger: HMRLogger;
	private transport: HMRTransport;
	private importUpdatedModule: ImportUpdatedModule;

	constructor(logger: HMRLogger, transport: HMRTransport = DISCONNECTED_TRANSPORT, importUpdatedModule: ImportUpdatedModule = NO_IMPORTER) {
		this.logger = logger;
		this.transport = transport;
		this.importUpdatedModule = importUpdatedModule;
	}

	/** Contexts exist from the first module evaluation; the socket and importer only once the device connects. */
	attach(transport: HMRTransport, importUpdatedModule: ImportUpdatedModule): void {
		this.transport = transport;
		this.importUpdatedModule = importUpdatedModule;
	}

	async notifyListeners(event: string, data: unknown): Promise<void> {
		const cbs = this.customListenersMap.get(event);
		if (cbs) {
			await Promise.allSettled(cbs.map((cb) => cb(data)));
		}
	}

	/** Like {@link notifyListeners}, but a listener that throws synchronously is reported as rejected instead of escaping. */
	async notifyListenersSettled(event: string, data: unknown): Promise<PromiseSettledResult<unknown>[]> {
		const cbs = this.customListenersMap.get(event);
		if (!cbs) return [];
		return Promise.allSettled(cbs.map(async (cb) => cb(data)));
	}

	/**
	 * Calls only the `event` listeners registered by the hot contexts of
	 * `ownerPaths`, once per context, instead of broadcasting.
	 */
	async notifyOwnerListeners(event: string, data: unknown, ownerPaths: readonly string[]): Promise<PromiseSettledResult<unknown>[]> {
		const cbs = Array.from(new Set(ownerPaths)).flatMap((path) => this.ctxToListenersMap.get(path)?.get(event) ?? []);
		return Promise.allSettled(cbs.map(async (cb) => cb(data)));
	}

	isDeclined(path: string): boolean {
		return this.declinedPaths.has(path);
	}

	send(payload: unknown): void {
		this.transport.send(payload).catch((err) => {
			this.logger.error(err);
		});
	}

	clear(): void {
		this.hotModulesMap.clear();
		this.disposeMap.clear();
		this.pruneMap.clear();
		this.dataMap.clear();
		this.customListenersMap.clear();
		this.ctxToListenersMap.clear();
		this.declinedPaths.clear();
	}

	async prunePaths(paths: string[]): Promise<void> {
		try {
			await Promise.all(
				paths.map((path) => {
					const disposer = this.disposeMap.get(path);
					if (disposer) return disposer(this.dataMap.get(path));
				}),
			);
			await Promise.all(
				paths.map((path) => {
					const fn = this.pruneMap.get(path);
					if (fn) return fn(this.dataMap.get(path));
				}),
			);
		} finally {
			paths.forEach((path) => {
				this.dataMap.delete(path);
				this.declinedPaths.delete(path);
			});
		}
	}

	protected warnFailedUpdate(err: unknown, path: string | string[]): void {
		if (!(err instanceof Error) || !err.message.includes('fetch')) {
			this.logger.error(err);
		}
		this.logger.error(`Failed to reload ${path}. This could be due to syntax errors or importing non-existent modules. (see errors above)`);
	}

	/**
	 * Buffers the hot updates of one change so their callbacks run in the
	 * order the server sent them, whatever order the imports settle in.
	 */
	async queueUpdate(payload: Update): Promise<void> {
		this.updateQueue.push(this.fetchUpdate(payload));
		if (!this.pendingUpdateQueue) {
			this.pendingUpdateQueue = true;
			await Promise.resolve();
			this.pendingUpdateQueue = false;
			const loading = [...this.updateQueue];
			this.updateQueue = [];
			(await Promise.all(loading)).forEach((fn) => fn && fn());
		}
	}

	private async fetchUpdate(update: Update): Promise<(() => void) | undefined> {
		const { path, acceptedPath, firstInvalidatedBy } = update;
		const mod = this.hotModulesMap.get(path);
		if (!mod) {
			return;
		}
		let fetchedModule: ModuleNamespace | undefined;
		const isSelfUpdate = path === acceptedPath;
		const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => deps.includes(acceptedPath));
		if (isSelfUpdate || qualifiedCallbacks.length > 0) {
			const disposer = this.disposeMap.get(acceptedPath);
			if (disposer) await disposer(this.dataMap.get(acceptedPath));
			try {
				fetchedModule = await this.importUpdatedModule(update);
			} catch (e) {
				this.warnFailedUpdate(e, acceptedPath);
			}
		}
		return () => {
			try {
				this.currentFirstInvalidatedBy = firstInvalidatedBy;
				for (const { deps, fn } of qualifiedCallbacks) {
					fn(deps.map((dep) => (dep === acceptedPath ? fetchedModule : undefined)));
				}
				const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
				this.logger.debug(`hot updated: ${loggedPath}`);
			} finally {
				this.currentFirstInvalidatedBy = undefined;
			}
		};
	}
}

/** Runs `handler` for one payload at a time, in arrival order. */
export function createHMRHandler<T>(handler: (payload: T) => Promise<unknown>): (payload: T) => Promise<unknown> {
	const queue = new Queue();
	return (payload) => queue.enqueue(() => handler(payload));
}

export class Queue {
	private queue: Array<{ promise: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (err: unknown) => void }> = [];
	private pending = false;

	enqueue(promise: () => Promise<unknown>): Promise<unknown> {
		return new Promise((resolve, reject) => {
			this.queue.push({ promise, resolve, reject });
			this.dequeue();
		});
	}

	private dequeue(): boolean {
		if (this.pending) {
			return false;
		}
		const item = this.queue.shift();
		if (!item) {
			return false;
		}
		this.pending = true;
		item
			.promise()
			.then(item.resolve)
			.catch(item.reject)
			.finally(() => {
				this.pending = false;
				this.dequeue();
			});
		return true;
	}
}
