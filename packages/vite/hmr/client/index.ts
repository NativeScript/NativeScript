/**
 * Device HMR client: a port of Vite's browser client
 * (`vite/dist/client/client.mjs`) on Vite's own HMR WebSocket. Where a
 * browser reloads the page, the device asks the dev server for an app
 * restart. NativeScript adds the soft reboot (an update whose boundary is the
 * app entry, wrapped in `nativescript:beforeReboot`/`afterReboot`) and the dev
 * overlay.
 *
 * Importing this module has no side effects. The `/__ns_dev__/client`
 * bootstrap calls `start()` once the app has booted.
 */
import type { ConnectedPayload, CustomPayload, ErrorPayload, FullReloadPayload, PrunePayload, Update, UpdatePayload } from 'vite';
import { Queue, type HMRClient, type ModuleNamespace } from './hmr-client.js';
import { clearEntryBoundary, getEntryBoundarySettled, hmrClient } from './hot-state.js';
import { createViteSocketTransport, waitForSuccessfulPing, type ViteSocketTransport, type WebSocketFactory } from './vite-transport.js';
import { overlayDriver, type HmrOverlayDriver, type HmrOverlayInfo } from './overlay-driver.js';
import { describeRuntimeError, describeServerError, deviceModuleUrlsInStack, type ErrorOverlayText } from './error-overlay.js';
import { NS_AFTER_REBOOT_EVENT, NS_BEFORE_REBOOT_EVENT, NS_BEFORE_RERUN_EVENT, NS_BEFORE_RESTART_EVENT, NS_RESTART_EVENT, NS_RESTART_REQUIRED_EVENT, NS_UPDATE_RERUN_EVENT, type BeforeRerunEventData, type RebootEventData, type RestartEventData, type UpdateRerunEventData } from '../shared/protocol.js';
import { createUpdateModules, viteUrlCandidates, type UpdateModules } from '../shared/update-modules.js';
import { readNsRuntimeDevHostApi, type NsRuntimeDevHostApi } from '../shared/runtime/browser-runtime-contract.js';
import { ENV_VERBOSE } from './utils.js';

type DeviceFullReloadPayload = FullReloadPayload & { ifFallback?: boolean };
export type DeviceHotPayload = ConnectedPayload | { type: 'ping' } | UpdatePayload | DeviceFullReloadPayload | CustomPayload | ErrorPayload | PrunePayload;

export interface NsHmrStartOptions {
	/** Vite's HMR WebSocket URL, token included. */
	wsUrl: string;
	wsProtocol: string;
	/** Session entry; a `js-update` of it is a soft reboot. */
	entryUrl: string;
	/** Dev-server origin. A module's device URL is this origin followed by its Vite URL. */
	origin: string;
	/** Vite's project root; error locations under it are shown root-relative. */
	root?: string;
}

export interface NsHmrRuntimeDeps {
	client?: HMRClient;
	createSocket?: WebSocketFactory;
	importModule?: (url: string) => Promise<any>;
	overlay?: HmrOverlayDriver;
	pingRetryMs?: number;
	/** How long a soft reboot waits for the entry's `settled` provider before moving on. */
	rebootSettledTimeoutMs?: number;
	/** How long `nativescript:beforeRestart` listeners may hold up a restart. */
	beforeRestartTimeoutMs?: number;
	/** The runtime's `ns:module` API; read from the runtime when absent. */
	devHost?: Pick<NsRuntimeDevHostApi, 'invalidateModules'>;
}

export interface NsHmrRuntime {
	readonly client: HMRClient;
	readonly transport: ViteSocketTransport;
	/** Queues a payload behind every earlier one, as it arrives from the socket. */
	onMessage(payload: DeviceHotPayload): Promise<unknown>;
	connect(): Promise<void>;
	/** Asks the dev server to restart the app; from then on the client applies nothing. */
	requestRestart(reason: string): Promise<void>;
}

const MAX_ANNOUNCED_RERUNS = 16;

const RESTART_ACTION_LABEL = 'Restart app';

const defaultCreateSocket: WebSocketFactory = (url, protocol) => new (globalThis as any).WebSocket(url, protocol);

const defaultImportModule = (url: string): Promise<any> => import(/* @vite-ignore */ url);

function describePaths(paths: readonly string[]): string {
	const unique = Array.from(new Set(paths.map((p) => p.split('?')[0])));
	return unique.length > 2 ? `${unique.slice(0, 2).join(', ')} and ${unique.length - 2} more` : unique.join(', ');
}

function errorMessage(err: unknown): string {
	return String((err as any)?.message ?? err);
}

function stringList(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function updateModulesOf(announced: UpdateRerunEventData | undefined): UpdateModules {
	return createUpdateModules({ changed: stringList(announced?.changed), rerun: stringList(announced?.rerun), root: typeof announced?.root === 'string' ? announced.root : undefined });
}

function fullReloadReason(payload: DeviceFullReloadPayload): string {
	if (payload.triggeredBy) return `full reload: ${payload.triggeredBy}`;
	if (payload.path && payload.path !== '*') return `full reload: ${payload.path}`;
	return 'full reload requested by the dev server';
}

const TIMED_OUT = Symbol('timed out');

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<typeof TIMED_OUT>((resolve) => {
		timer = setTimeout(() => resolve(TIMED_OUT), ms);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function createNsHmrRuntime(options: NsHmrStartOptions, deps: NsHmrRuntimeDeps = {}): NsHmrRuntime {
	const client = deps.client ?? hmrClient;
	const origin = options.origin.replace(/\/$/, '');
	const importModule = deps.importModule ?? defaultImportModule;
	const createSocket = deps.createSocket ?? defaultCreateSocket;
	const rawOverlay = deps.overlay ?? overlayDriver;
	const pingRetryMs = deps.pingRetryMs ?? 1000;
	const rebootSettledTimeoutMs = deps.rebootSettledTimeoutMs ?? 15_000;
	const beforeRestartTimeoutMs = deps.beforeRestartTimeoutMs ?? 5_000;
	const entryPath = viteUrlCandidates(options.entryUrl, undefined)[0] ?? options.entryUrl;

	const pingUrl = options.wsUrl.split('?')[0];
	const transport = createViteSocketTransport({ url: options.wsUrl, protocol: options.wsProtocol, createSocket });

	// Set once the app needs a restart; only a new process clears it.
	let restartReason: string | undefined;
	let shownRestartReason: string | undefined;
	let serverRequiresRestart = false;
	let unsentRestart: RestartEventData | undefined;
	let beforeRestartNotified: Promise<void> | undefined;

	// `ns:rerun` announcements by the timestamp of the update they describe.
	const announcedReruns = new Map<number, UpdateRerunEventData>();
	let entryImportStarted = false;
	let entryImportError: unknown;
	let projectRoot = options.root;
	// The message of the last soft reboot whose entry import failed; cleared by one whose import succeeds.
	let failedRebootMessage: string | undefined;

	const overlay: HmrOverlayDriver = {
		setUpdateStage: (stage, info) => {
			if (restartReason === undefined) rawOverlay.setUpdateStage(stage, info);
		},
		setConnectionStage: (stage, info) => {
			if (restartReason === undefined) rawOverlay.setConnectionStage(stage, info);
		},
		hide: (reason) => {
			if (restartReason === undefined) rawOverlay.hide(reason);
		},
	};
	const queue = new Queue();
	let connectionOverlayShown = false;

	const restartAction = { label: RESTART_ACTION_LABEL, onTap: () => void requestRestart('requested from the error overlay') };

	function showFailed(text: ErrorOverlayText): void {
		const info: HmrOverlayInfo = { detail: text.detail, action: restartAction };
		if (text.code) info.code = text.code;
		overlay.setUpdateStage('failed', info);
	}

	function invalidateModules(urls: string[]): void {
		if (!urls.length) return;
		try {
			const invalidate = (deps.devHost ?? readNsRuntimeDevHostApi(globalThis)).invalidateModules;
			if (typeof invalidate === 'function') invalidate(urls);
		} catch (err) {
			client.logger.error(err);
		}
	}

	const onMessage = (payload: DeviceHotPayload) =>
		queue
			.enqueue(() => handleMessage(payload))
			.catch((err) => {
				client.logger.error(err);
			});

	client.attach(transport, async function importUpdatedModule({ acceptedPath, timestamp, explicitImportRequired, isWithinCircularImport }: Update): Promise<ModuleNamespace> {
		const [acceptedPathWithoutQuery, query] = acceptedPath.split('?');
		if (acceptedPath === entryPath) entryImportStarted = true;
		// The runtime resolves a non-`http(s)://` dynamic specifier on the filesystem and drops its query.
		const importPromise = importModule(`${origin}${acceptedPathWithoutQuery}?${explicitImportRequired ? 'import&' : ''}t=${timestamp}${query ? `&${query}` : ''}`);
		if (isWithinCircularImport) {
			importPromise.catch(() => {
				console.info(`[hmr] ${acceptedPath} failed to apply HMR as it's within a circular import. Restarting the app to reset the execution order.`);
				void requestRestart(`${acceptedPath} failed to apply within a circular import`);
			});
		}
		try {
			return await importPromise;
		} catch (err) {
			// `fetchUpdate` only logs a failed import; the reboot needs it for `afterReboot`.
			if (acceptedPath === entryPath) entryImportError = err;
			throw err;
		}
	});

	function showRestartRequired(reason: string): void {
		shownRestartReason = reason;
		console.error(`[vite] app restart required: ${reason}`);
		rawOverlay.setUpdateStage('restart-required', { detail: reason });
	}

	function notifyBeforeRestart(reason: string): Promise<void> {
		beforeRestartNotified ??= (async () => {
			try {
				const results = await withTimeout(client.notifyListenersSettled(NS_BEFORE_RESTART_EVENT, { reason }), beforeRestartTimeoutMs);
				if (results === TIMED_OUT) {
					console.warn(`[vite] ${NS_BEFORE_RESTART_EVENT} listeners did not finish within ${beforeRestartTimeoutMs} ms; restarting anyway.`);
					return;
				}
				for (const result of results) {
					if (result.status === 'rejected') client.logger.error(result.reason);
				}
			} catch (err) {
				client.logger.error(err);
			}
		})();
		return beforeRestartNotified;
	}

	function flushRestartRequest(): void {
		const data = unsentRestart;
		if (!data || !transport.connected) return;
		unsentRestart = undefined;
		transport.send({ type: 'custom', event: NS_RESTART_EVENT, data }).catch((err) => {
			unsentRestart ??= data;
			client.logger.error(err);
		});
	}

	async function requestRestart(reason: string): Promise<void> {
		if (restartReason !== undefined) return;
		restartReason = reason;
		await notifyBeforeRestart(reason);
		// The server may have required the restart while the listeners ran.
		if (serverRequiresRestart) return;
		showRestartRequired(reason);
		unsentRestart = { reason };
		flushRestartRequest();
	}

	async function onServerRestartRequired(data: RestartEventData | undefined): Promise<void> {
		const reason = typeof data?.reason === 'string' && data.reason ? data.reason : 'the dev server asked for an app restart';
		serverRequiresRestart = true;
		unsentRestart = undefined;
		restartReason ??= reason;
		await notifyBeforeRestart(reason);
		if (reason !== shownRestartReason) showRestartRequired(reason);
	}

	function ignoreWhileRestartRequired(what: string): void {
		console.warn(`[vite] ignoring ${what}: the app needs a restart (${restartReason}).`);
	}

	async function applyJsUpdates(payload: UpdatePayload): Promise<void> {
		// A `css-update` has no `<link>` to swap on the device; whoever loaded
		// the stylesheet reloads it from `vite:beforeUpdate`.
		await Promise.all(payload.updates.map((update) => (update.type === 'js-update' ? client.queueUpdate(update) : undefined)));
	}

	/** The `ns:rerun` announcement of `payload`; older unmatched ones are dropped. */
	function takeAnnouncedRerun(payload: UpdatePayload): UpdateRerunEventData | undefined {
		const timestamp = payload.updates.find((u) => u.type === 'js-update')?.timestamp;
		if (timestamp === undefined) return undefined;
		const announced = announcedReruns.get(timestamp);
		announcedReruns.delete(timestamp);
		return announced;
	}

	async function notifyBeforeRerun(rerun: UpdateRerunEventData | undefined): Promise<void> {
		if (!rerun) return;
		const data: BeforeRerunEventData = { ...updateModulesOf(rerun), timestamp: rerun.timestamp };
		const results = await client.notifyOwnerListeners(NS_BEFORE_RERUN_EVENT, data, Array.from(data.modules.keys()));
		for (const result of results) {
			if (result.status === 'rejected') client.logger.error(result.reason);
		}
	}

	async function handleUpdate(payload: UpdatePayload, rerun: UpdateRerunEventData | undefined): Promise<void> {
		const paths = describePaths(payload.updates.map((u) => u.path));
		overlay.setUpdateStage('received', { detail: paths });
		try {
			await client.notifyListeners('vite:beforeUpdate', payload);
			await notifyBeforeRerun(rerun);
			overlay.setUpdateStage('reimporting', { detail: paths });
			await applyJsUpdates(payload);
			await client.notifyListeners('vite:afterUpdate', payload);
			overlay.setUpdateStage('complete', { detail: `Updated ${paths}` });
		} catch (err) {
			client.logger.error(err);
			showFailed(describeRuntimeError(err, origin));
		}
	}

	/**
	 * Resolves to the provider's failure, or undefined once it settles or times
	 * out. A provider reports a failed boot by rejecting or by resolving to
	 * `{ error }` (which spares it an unhandled rejection when nobody awaits it).
	 */
	async function waitForEntrySettled(): Promise<unknown> {
		const settled = getEntryBoundarySettled();
		if (!settled) return undefined;
		try {
			const result = await withTimeout(
				Promise.resolve().then(() => settled()),
				rebootSettledTimeoutMs,
			);
			if (result === TIMED_OUT) {
				console.warn(`[vite] the app did not report its reboot settled within ${rebootSettledTimeoutMs} ms; continuing.`);
				return undefined;
			}
			if (result && typeof result === 'object' && 'error' in result) {
				const failure = (result as { error: unknown }).error ?? new Error('the app failed to boot');
				client.logger.error(failure);
				return failure;
			}
			return undefined;
		} catch (err) {
			client.logger.error(err);
			return err;
		}
	}

	async function handleReboot(payload: UpdatePayload, announced: UpdateRerunEventData | undefined): Promise<void> {
		const event: RebootEventData = { ...updateModulesOf(announced), entry: entryPath };
		const detail = describePaths(event.changed.length ? event.changed : payload.updates.map((u) => u.path));
		overlay.setUpdateStage('received', { detail });

		let beforeRebootSent = false;
		// What threw while the old app was torn down, if anything.
		let teardownFailure: string | undefined;
		let thrown: { err: unknown } | undefined;
		let error: unknown;
		let importError: unknown;
		try {
			await client.notifyListeners('vite:beforeUpdate', payload);
			beforeRebootSent = true;
			const rejected = (await client.notifyListenersSettled(NS_BEFORE_REBOOT_EVENT, event)).filter((r): r is PromiseRejectedResult => r.status === 'rejected');
			if (rejected.length) {
				// The listeners that did run have already released their part of the app.
				teardownFailure = `a ${NS_BEFORE_REBOOT_EVENT} listener failed`;
				rejected.slice(1).forEach((r) => client.logger.error(r.reason));
				throw rejected[0].reason;
			}
			await notifyBeforeRerun(announced);
			overlay.setUpdateStage('rebooting', { detail });
			// Only a provider the new entry registers may be awaited: after a
			// failed import the registered one belongs to the torn-down app.
			clearEntryBoundary();
			entryImportStarted = false;
			entryImportError = undefined;
			await applyJsUpdates(payload).catch((err) => {
				if (!entryImportStarted) teardownFailure = 'dispose before the app reboot failed';
				throw err;
			});
			importError = entryImportError;
			error = importError ?? (await waitForEntrySettled());
		} catch (err) {
			client.logger.error(err);
			thrown = { err };
			error = err;
		}

		if (beforeRebootSent) {
			try {
				await client.notifyListeners(NS_AFTER_REBOOT_EVENT, error === undefined ? event : { ...event, error: errorMessage(error) });
			} catch (err) {
				client.logger.error(err);
			}
		}
		if (!thrown) {
			try {
				await client.notifyListeners('vite:afterUpdate', payload);
			} catch (err) {
				client.logger.error(err);
				error ??= err;
			}
		}
		if (error === undefined) overlay.setUpdateStage('complete', { detail: `Rebooted for ${detail}` });
		else showFailed(describeRuntimeError(error, origin));
		// A teardown that threw before the new entry was imported leaves the app
		// half torn down; only a failed import is retried by the next edit.
		if (teardownFailure !== undefined) {
			await requestRestart(`${teardownFailure}: ${errorMessage(error)}`);
		} else if (!thrown) {
			if (importError === undefined) failedRebootMessage = undefined;
			else await onRebootImportFailed(importError, event);
		}
	}

	async function onRebootImportFailed(err: unknown, event: RebootEventData): Promise<void> {
		const message = errorMessage(err);
		const stackUrls = deviceModuleUrlsInStack((err as any)?.stack, origin);
		// Only modules this reboot evaluated may hold a failed record; evicting a
		// module outside it would re-evaluate a live module into a second instance.
		invalidateModules(stackUrls.filter((url) => event.isRerun(url)));
		const previous = failedRebootMessage;
		failedRebootMessage = message;
		if (previous === undefined) return;
		// Without device URLs in the stack or the update's module set the culprit
		// can't be placed, so the same failure twice in a row stands in for "outside".
		const outsideChain = stackUrls.length && event.modules.size ? !stackUrls.some((url) => event.isRerun(url)) : previous === message;
		if (outsideChain) await requestRestart(`the app failed to reload: ${message}`);
	}

	async function handleFullReload(payload: DeviceFullReloadPayload): Promise<void> {
		try {
			await client.notifyListeners('vite:beforeFullReload', payload);
		} catch (err) {
			client.logger.error(err);
		}
		await requestRestart(fullReloadReason(payload));
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
				flushRestartRequest();
				return;
			} catch (err) {
				console.error(`[vite] failed to connect to websocket (${errorMessage(err)}).`);
				showConnectionStage('offline', `Retrying ${pingUrl}`);
				await wait(pingRetryMs);
				await waitForSuccessfulPing(pingUrl, createSocket, pingRetryMs);
			}
		}
	}

	// Vite's browser client reloads the page once the server is back; the device
	// only reconnects. Its modules stay valid while the server is unchanged, and
	// a restarted server asks for an app restart itself when the device reconnects.
	async function handleDisconnect(): Promise<void> {
		console.log('[vite] server connection lost. Polling for restart...');
		showConnectionStage('reconnecting', `Waiting for ${pingUrl}`);
		await waitForSuccessfulPing(pingUrl, createSocket, pingRetryMs);
		await connect();
	}

	async function handleMessage(payload: DeviceHotPayload): Promise<unknown> {
		switch (payload.type) {
			case 'connected':
				if (ENV_VERBOSE) console.log('[vite] connected.');
				if (connectionOverlayShown) {
					connectionOverlayShown = false;
					overlay.hide('healthy');
				}
				break;
			case 'update': {
				const announced = takeAnnouncedRerun(payload);
				if (restartReason !== undefined) {
					ignoreWhileRestartRequired('update');
					break;
				}
				// Vite's server doesn't act on `hot.decline()`, so the boundary it
				// picked may be a module that refuses hot updates.
				const declined = payload.updates.flatMap((u) => (u.type === 'js-update' ? [u.path, u.acceptedPath] : [])).find((path) => client.isDeclined(path));
				if (declined) {
					await requestRestart(`hot.decline() in ${declined}`);
					break;
				}
				if (payload.updates.some((u) => u.type === 'js-update' && u.path === entryPath)) {
					await handleReboot(payload, announced);
				} else {
					await handleUpdate(payload, announced);
				}
				break;
			}
			case 'custom':
				await client.notifyListeners(payload.event, payload.data);
				if (payload.event === NS_UPDATE_RERUN_EVENT) {
					const data = payload.data as UpdateRerunEventData | undefined;
					if (typeof data?.root === 'string' && data.root) projectRoot = data.root;
					if (typeof data?.timestamp === 'number') {
						announcedReruns.set(data.timestamp, data);
						// Bounded: an announced update may never arrive (dropped while a restart is pending).
						if (announcedReruns.size > MAX_ANNOUNCED_RERUNS) announcedReruns.delete(announcedReruns.keys().next().value!);
					}
				} else if (payload.event === NS_RESTART_REQUIRED_EVENT) {
					await onServerRestartRequired(payload.data);
				} else if (payload.event === 'vite:ws:disconnect') {
					await handleDisconnect();
				}
				break;
			case 'full-reload':
				if (restartReason !== undefined) {
					ignoreWhileRestartRequired('full-reload');
					break;
				}
				if (payload.ifFallback) break;
				// Vite reloads for an `.html` path only when it is the open page; the device has no HTML page.
				if (payload.path && payload.path.endsWith('.html')) break;
				await handleFullReload(payload);
				break;
			case 'prune':
				if (restartReason !== undefined) {
					ignoreWhileRestartRequired('prune');
					break;
				}
				await client.notifyListeners('vite:beforePrune', payload);
				await client.prunePaths(payload.paths);
				break;
			case 'error': {
				await client.notifyListeners('vite:error', payload);
				const err = payload.err;
				console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
				showFailed(describeServerError(err, projectRoot));
				break;
			}
			case 'ping':
				break;
			default:
				return payload;
		}
	}

	return { client, transport, onMessage, connect, requestRestart };
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
