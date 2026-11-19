/**
 * Device HMR client: a port of Vite's browser client
 * (`vite/dist/client/client.mjs`) on Vite's own HMR WebSocket. NativeScript
 * adds what a browser has and the device lacks: an in-process full reload
 * (`full-reload.ts`), the dev overlay, and `ns:css-updates` for stylesheets
 * that are not Vite modules on the device.
 *
 * Importing this module has no side effects. The `/__ns_dev__/client`
 * bootstrap calls `start()` once the app has booted.
 */
import type { ConnectedPayload, CustomPayload, ErrorPayload, FullReloadPayload, PrunePayload, Update, UpdatePayload } from 'vite';
import { Queue, type HMRClient, type ModuleNamespace } from './hmr-client.js';
import { hmrClient } from './hot-state.js';
import { createViteSocketTransport, waitForSuccessfulPing, type ViteSocketTransport, type WebSocketFactory } from './vite-transport.js';
import { performFullReload, THIN_PREFIX, viteUrlPrefixFromDeviceUrl } from './full-reload.js';
import { overlayDriver, type HmrOverlayDriver } from './overlay-driver.js';
import { handleCssUpdates } from './css-handler.js';
import { buildCssAppliedDetail, buildCssApplyingDetail } from './css-update-overlay.js';
import { NS_CSS_UPDATES_EVENT, type CssUpdateItem, type CssUpdatesEventData } from '../shared/protocol.js';
import { readNsRuntimeDevHostApi, type NsRuntimeDevHostApi } from '../shared/runtime/browser-runtime-contract.js';
import { sweepTrackedWorkers } from '../shared/runtime/worker-tracking.js';
import { ENV_VERBOSE } from './utils.js';

type DeviceFullReloadPayload = FullReloadPayload & { ifFallback?: boolean };
export type DeviceHotPayload = ConnectedPayload | { type: 'ping' } | UpdatePayload | DeviceFullReloadPayload | CustomPayload | ErrorPayload | PrunePayload;

export interface NsHmrStartOptions {
	/** Vite's HMR WebSocket URL, token included. */
	wsUrl: string;
	wsProtocol: string;
	/** Session entry, re-imported by a full reload. */
	entryUrl: string;
	/** Dev-server origin every `/ns/v` module URL starts with. */
	origin: string;
	/** Device URL prefixes of packages a full reload must not re-evaluate even when served from outside `node_modules`. */
	keepUrlPrefixes?: string[];
}

export interface NsHmrRuntimeDeps {
	client?: HMRClient;
	createSocket?: WebSocketFactory;
	importModule?: (url: string) => Promise<any>;
	devHost?: NsRuntimeDevHostApi;
	overlay?: HmrOverlayDriver;
	applyCssUpdates?: (updates: CssUpdateItem[], origin: string) => Promise<void>;
	sweepWorkers?: () => void;
	/** Device URL of this package's directory; derived from `import.meta.url` by default. */
	clientPackageUrl?: string;
	reloadDebounceMs?: number;
	pingRetryMs?: number;
}

export interface NsHmrRuntime {
	readonly client: HMRClient;
	readonly transport: ViteSocketTransport;
	/** Queues a payload behind every earlier one, as it arrives from the socket. */
	onMessage(payload: DeviceHotPayload): Promise<unknown>;
	connect(): Promise<void>;
}

const defaultCreateSocket: WebSocketFactory = (url, protocol) => new (globalThis as any).WebSocket(url, protocol);

const defaultImportModule = (url: string): Promise<any> => import(/* @vite-ignore */ url);

function ownPackageUrl(): string | undefined {
	try {
		return new URL('../../', import.meta.url).href;
	} catch {
		return undefined;
	}
}

function describePaths(paths: string[]): string {
	const unique = Array.from(new Set(paths.map((p) => p.split('?')[0])));
	return unique.length > 2 ? `${unique.slice(0, 2).join(', ')} and ${unique.length - 2} more` : unique.join(', ');
}

function errorMessage(err: unknown): string {
	return String((err as any)?.message ?? err);
}

export function createNsHmrRuntime(options: NsHmrStartOptions, deps: NsHmrRuntimeDeps = {}): NsHmrRuntime {
	const client = deps.client ?? hmrClient;
	const origin = options.origin.replace(/\/$/, '');
	const importModule = deps.importModule ?? defaultImportModule;
	const createSocket = deps.createSocket ?? defaultCreateSocket;
	const devHost = deps.devHost ?? readNsRuntimeDevHostApi(globalThis);
	const overlay = deps.overlay ?? overlayDriver;
	const applyCssUpdates = deps.applyCssUpdates ?? handleCssUpdates;
	const sweepWorkers = deps.sweepWorkers ?? (() => void sweepTrackedWorkers(globalThis));
	const reloadDebounceMs = deps.reloadDebounceMs ?? 20;
	const pingRetryMs = deps.pingRetryMs ?? 1000;
	const pingUrl = options.wsUrl.split('?')[0];
	const keepPrefixes = [deps.clientPackageUrl ?? ownPackageUrl(), ...(options.keepUrlPrefixes ?? [])].map((url) => viteUrlPrefixFromDeviceUrl(url, origin)).filter((prefix): prefix is string => !!prefix);

	const transport = createViteSocketTransport({ url: options.wsUrl, protocol: options.wsProtocol, createSocket });
	const queue = new Queue();
	let connectionOverlayShown = false;

	const onMessage = (payload: DeviceHotPayload) =>
		queue
			.enqueue(() => handleMessage(payload))
			.catch((err) => {
				client.logger.error(err);
			});

	client.attach(transport, async function importUpdatedModule({ acceptedPath, timestamp, explicitImportRequired, isWithinCircularImport }: Update): Promise<ModuleNamespace> {
		const [acceptedPathWithoutQuery, query] = acceptedPath.split('?');
		const importPromise = importModule(`${origin}${THIN_PREFIX}${acceptedPathWithoutQuery}?${explicitImportRequired ? 'import&' : ''}t=${timestamp}${query ? `&${query}` : ''}`);
		if (isWithinCircularImport) {
			importPromise.catch(() => {
				console.info(`[hmr] ${acceptedPath} failed to apply HMR as it's within a circular import. Reloading the app to reset the execution order.`);
				pageReload({ type: 'full-reload' });
			});
		}
		return await importPromise;
	});

	// After a failed full reload the app modules are evicted and their hot
	// contexts dropped, so nothing is left to apply an update: the next one
	// reloads instead (Vite's `clearOverlayOrReloadOnFirstUpdate`).
	let lastReloadFailed = false;

	async function reloadNow(payload: DeviceFullReloadPayload): Promise<void> {
		overlay.setUpdateStage('received');
		overlay.setUpdateStage('rebooting');
		const result = await performFullReload(payload, {
			client,
			origin,
			entryUrl: options.entryUrl,
			keepPrefixes,
			getLoadedModuleUrls: devHost.getLoadedModuleUrls,
			invalidateModules: devHost.invalidateModules,
			importModule,
			beforeEvict: sweepWorkers,
		});
		lastReloadFailed = !!result.error;
		if (result.error) {
			console.error('[vite] full reload failed:', errorMessage(result.error));
			overlay.setUpdateStage('failed', { detail: errorMessage(result.error) });
		} else {
			if (ENV_VERBOSE) console.debug(`[vite] full reload: re-evaluated ${result.evicted.length} modules`);
			overlay.setUpdateStage('complete', { detail: 'App reloaded' });
		}
	}

	let reloadTimer: ReturnType<typeof setTimeout> | undefined;
	let pendingReload: DeviceFullReloadPayload = { type: 'full-reload' };
	// Debounced like Vite's `pageReload`, then run through the message queue:
	// a browser reload ends the page, but here later updates keep arriving
	// and must not interleave with the re-import.
	function pageReload(payload: DeviceFullReloadPayload): void {
		pendingReload = payload;
		if (reloadTimer) clearTimeout(reloadTimer);
		reloadTimer = setTimeout(() => {
			reloadTimer = undefined;
			const next = pendingReload;
			queue.enqueue(() => reloadNow(next)).catch((err) => client.logger.error(err));
		}, reloadDebounceMs);
	}

	async function handleUpdate(payload: UpdatePayload): Promise<void> {
		const paths = describePaths(payload.updates.map((u) => u.path));
		overlay.setUpdateStage('received', { detail: paths });
		try {
			await client.notifyListeners('vite:beforeUpdate', payload);
			overlay.setUpdateStage('reimporting', { detail: paths });
			// A `css-update` has no `<link>` to swap on the device; whoever loaded
			// the stylesheet reloads it from `vite:beforeUpdate`.
			await Promise.all(payload.updates.map((update) => (update.type === 'js-update' ? client.queueUpdate(update) : undefined)));
			await client.notifyListeners('vite:afterUpdate', payload);
			overlay.setUpdateStage('complete', { detail: `Updated ${paths}` });
		} catch (err) {
			client.logger.error(err);
			overlay.setUpdateStage('failed', { detail: errorMessage(err) });
		}
	}

	async function handleNsCssUpdates(data: CssUpdatesEventData | undefined): Promise<void> {
		const updates = Array.isArray(data?.updates) ? data!.updates : [];
		if (!updates.length) return;
		const silent = data!.reason === 'connect-sync';
		if (!silent) {
			overlay.setUpdateStage('received', { detail: buildCssApplyingDetail(updates.length) });
		}
		try {
			await applyCssUpdates(updates, typeof data!.origin === 'string' && data!.origin ? data!.origin : origin);
			if (!silent) overlay.setUpdateStage('complete', { detail: buildCssAppliedDetail(updates.length) });
		} catch (err) {
			console.warn('[ns-hmr] CSS update failed:', errorMessage(err));
			if (!silent) overlay.setUpdateStage('failed', { detail: errorMessage(err) });
		}
	}

	function showConnectionStage(stage: 'reconnecting' | 'offline', detail: string): void {
		connectionOverlayShown = true;
		overlay.setConnectionStage(stage, { detail });
	}

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	async function connect(): Promise<void> {
		for (;;) {
			try {
				await transport.connect({ onMessage, onDisconnection() {} });
				return;
			} catch (err) {
				console.error(`[vite] failed to connect to websocket (${errorMessage(err)}).`);
				showConnectionStage('offline', `Retrying ${pingUrl}`);
				await wait(pingRetryMs);
				await waitForSuccessfulPing(pingUrl, createSocket, pingRetryMs);
			}
		}
	}

	async function handleDisconnect(): Promise<void> {
		console.log('[vite] server connection lost. Polling for restart...');
		showConnectionStage('reconnecting', `Waiting for ${pingUrl}`);
		await waitForSuccessfulPing(pingUrl, createSocket, pingRetryMs);
		await reloadNow({ type: 'full-reload' });
		await connect();
	}

	async function handleMessage(payload: DeviceHotPayload): Promise<unknown> {
		switch (payload.type) {
			case 'connected':
				if (ENV_VERBOSE) console.debug('[vite] connected.');
				if (connectionOverlayShown) {
					connectionOverlayShown = false;
					overlay.hide('healthy');
				}
				break;
			case 'update':
				if (lastReloadFailed) {
					pageReload({ type: 'full-reload', path: '*' });
					break;
				}
				await handleUpdate(payload);
				break;
			case 'custom':
				await client.notifyListeners(payload.event, payload.data);
				if (payload.event === NS_CSS_UPDATES_EVENT) {
					await handleNsCssUpdates(payload.data);
				} else if (payload.event === 'vite:ws:disconnect') {
					await handleDisconnect();
				}
				break;
			case 'full-reload':
				if (payload.ifFallback) break;
				// Vite reloads for an `.html` path only when it is the open page; the device has no HTML page.
				if (payload.path && payload.path.endsWith('.html')) break;
				pageReload(payload);
				break;
			case 'prune':
				await client.notifyListeners('vite:beforePrune', payload);
				await client.prunePaths(payload.paths);
				break;
			case 'error': {
				await client.notifyListeners('vite:error', payload);
				const err = payload.err;
				console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
				overlay.setUpdateStage('failed', { detail: err.message });
				break;
			}
			case 'ping':
				break;
			default:
				return payload;
		}
	}

	return { client, transport, onMessage, connect };
}

let active: NsHmrRuntime | undefined;

/** Connects the device to Vite's HMR server. Later calls return the running client. */
export function start(options: NsHmrStartOptions): NsHmrRuntime {
	if (active) return active;
	active = createNsHmrRuntime(options);
	void active.connect();
	return active;
}

export default start;
