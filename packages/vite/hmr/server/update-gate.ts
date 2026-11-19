import type { ErrorPayload, Plugin, ViteDevServer, WebSocketClient } from 'vite';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { NS_UPDATE_RERUN_EVENT, type UpdateRerunEventData } from '../shared/protocol.js';
import { requestAppRestart } from './app-restart.js';
import { getServedModules, type ServedModules } from './served-modules.js';
import { transformIdForViteUrl, viteUrlForFile } from './thin/thin-mode.js';
import { resolveProjectMainEntryPath } from './vite-plugin.js';

interface GraphNodeLike {
	id: string | null;
	url: string;
	file?: string | null;
	type: string;
	lastHMRTimestamp: number;
	importedModules: Set<GraphNodeLike>;
	importers: Set<GraphNodeLike>;
}

interface GraphLike {
	urlToModuleMap: Map<string, GraphNodeLike>;
}

interface JsUpdateLike {
	type?: string;
	path?: string;
	acceptedPath?: string;
	timestamp?: number;
}

/**
 * Vite URLs of the JS modules the device re-evaluates for these `js-update`s:
 * each `acceptedPath`, which it imports with `?t=`, plus the imports reachable
 * from it whose current `?t=` URL the device hasn't loaded yet. Import
 * analysis gives a module `?t=<lastHMRTimestamp>`, so that URL is new to the
 * device exactly when the stamp was never served; everything else is a cache
 * hit. Without `served`, a module re-runs when it carries the update's own
 * stamp. Vite also stamps importers above a boundary that stops early (a
 * template accepted in place), so the stamp alone over-counts.
 */
export function collectRerunUrls(moduleGraph: GraphLike, updates: readonly JsUpdateLike[], served?: Pick<ServedModules, 'has'>): string[] {
	// Templates are graph nodes (watch files of their component) but never device modules.
	const urls = new Set<string>();
	const seen = new Set<GraphNodeLike>();
	for (const update of updates) {
		if (update.type !== 'js-update' || !update.acceptedPath) continue;
		const start = moduleGraph.urlToModuleMap.get(update.acceptedPath);
		if (!start) continue;
		const pending = [start];
		while (pending.length) {
			const node = pending.pop()!;
			if (seen.has(node)) continue;
			seen.add(node);
			if (node.id && node.type === 'js' && !isTemplateFile(node.file)) urls.add(node.url);
			for (const imported of node.importedModules) {
				const stamp = imported.lastHMRTimestamp;
				const reruns = served ? stamp > 0 && !served.has(imported.url, stamp) : stamp === update.timestamp;
				if (reruns) pending.push(imported);
			}
		}
	}
	return [...urls];
}

const TEMPLATE_RE = /\.html?$/i;

function isTemplateFile(file: string | null | undefined): boolean {
	return !!file && TEMPLATE_RE.test(file);
}

/**
 * Modules whose transform decides whether an update can apply: the re-run
 * set, plus the components that compile an accepted template (an in-place
 * template update re-runs nothing on the device, yet a broken template must
 * not apply).
 */
export function collectCheckedUrls(moduleGraph: GraphLike, rerun: readonly string[], acceptedPaths: readonly string[] = []): string[] {
	const urls = new Set(rerun);
	for (const url of acceptedPaths) {
		const node = moduleGraph.urlToModuleMap.get(url);
		if (!isTemplateFile(node?.file)) continue;
		for (const importer of node!.importers) {
			if (importer.id && importer.type === 'js' && !importer.url.includes('/node_modules/')) urls.add(importer.url);
		}
	}
	return [...urls];
}

// eslint-disable-next-line no-control-regex
const ansiRE = /\u001b\[[0-9;]*m/g;
const stripAnsi = (value: unknown) => (typeof value === 'string' ? value.replace(ansiRE, '') : undefined);

/** Vite's `error` payload fields for an error thrown by a transform (`prepareError`). */
export function toErrorPayloadErr(error: unknown): ErrorPayload['err'] {
	const err = (error ?? {}) as Record<string, any>;
	return {
		message: stripAnsi(err.message) ?? String(error),
		stack: stripAnsi(err.stack) ?? '',
		id: err.id,
		frame: stripAnsi(err.frame),
		plugin: err.plugin,
		pluginCode: err.pluginCode?.toString(),
		loc: err.loc,
	};
}

/**
 * Transforms `urls` as the device would request them and returns the first
 * failure, in `urls` order: a transform that throws, or output the framework
 * rejects. The results stay in Vite's transform cache for the device's fetches.
 */
export async function checkModules(server: Pick<ViteDevServer, 'environments'>, urls: readonly string[], strategy?: Pick<FrameworkServerStrategy, 'verifyTransform'>): Promise<ErrorPayload['err'] | undefined> {
	const environment = server.environments.client;
	const results = await Promise.allSettled(
		urls.map(async (url) => {
			const result = await environment.transformRequest(transformIdForViteUrl(url));
			const node = environment.moduleGraph.urlToModuleMap.get(url);
			if (result && node?.id && strategy?.verifyTransform) {
				const failure = await strategy.verifyTransform({ id: node.id, url, code: result.code });
				if (failure) throw failure;
			}
		}),
	);
	const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
	return failed ? toErrorPayloadErr(failed.reason) : undefined;
}

type SendArgs = [payload: unknown, data?: unknown];
const wrappedChannels = new WeakSet<object>();

/**
 * The gate every HMR payload passes on its way to the device:
 * - an `update` with a `js-update` is compiled first; on failure the device
 *   gets Vite's `error` payload instead, and its app stays untouched;
 * - otherwise `ns:rerun` (what re-runs) goes right before it;
 * - the flavor's gated events (Angular's `angular:component-update`) wait
 *   for that verdict, so a broken template never applies in place;
 * - a device that connects after missing updates gets one catch-up reboot.
 *
 * Payloads leave in the order they were sent.
 */
export function nsRerunPlugin(opts: { flavor?: string } = {}): Plugin {
	// Keyed by the save's timestamp, which Vite reuses for its `js-update`s;
	// other payloads of the same save (Analog's `css-update`) don't consume it.
	const changedBySave = new Map<number, Set<string>>();
	const strategy = opts.flavor ? getFrameworkServerStrategy(opts.flavor) : undefined;
	const gatedEvents = new Set(strategy?.gatedEvents ?? []);

	return {
		name: 'nativescript-rerun',
		apply: 'serve',
		configureServer(server) {
			const channel = server.ws as unknown as { send: (...args: SendArgs) => void; clients?: Set<unknown> };
			const graph = () => server.environments.client.moduleGraph as unknown as GraphLike;
			const served = getServedModules(server);
			// Saves the device was told about while connected, as an update or an error.
			const delivered = new Set<number>();
			const noteDelivered = (timestamps: Iterable<number>) => {
				if (!channel.clients || channel.clients.size > 0) for (const t of timestamps) delivered.add(t);
			};

			const takeChanged = (timestamps: Iterable<number>) => {
				const changed = new Set<string>();
				for (const timestamp of timestamps) {
					for (const url of changedBySave.get(timestamp) ?? []) changed.add(url);
					changedBySave.delete(timestamp);
				}
				return [...changed];
			};

			if (!wrappedChannels.has(channel)) {
				wrappedChannels.add(channel);
				const originalSend = channel.send.bind(channel);
				let held: SendArgs[] = [];
				let heldTimer: ReturnType<typeof setTimeout> | undefined;
				let queue: Promise<void> = Promise.resolve();
				// Saves whose update failed its check: their edits re-run with the next update that passes.
				const failedSaves = new Set<number>();

				const release = () => {
					if (heldTimer) clearTimeout(heldTimer);
					heldTimer = undefined;
					for (const args of held.splice(0)) originalSend(...args);
				};

				const handle = async (args: SendArgs): Promise<void> => {
					const payload = args[0] as { type?: string; event?: string; updates?: JsUpdateLike[] } | string;
					// Analog batches its notifications and flushes them in object form.
					const event = typeof payload === 'string' ? payload : payload?.type === 'custom' ? payload.event : undefined;
					if (event !== undefined && gatedEvents.has(event)) {
						held.push(args);
						// A gated event whose save produces no update (Vite found nothing
						// to propagate) still goes out.
						heldTimer ??= setTimeout(() => {
							queue = queue.then(release);
						}, 200);
						return;
					}
					if (typeof payload !== 'object' || payload?.type !== 'update') {
						release();
						originalSend(...args);
						return;
					}
					const jsUpdates = (payload.updates ?? []).filter((u) => u.type === 'js-update' && typeof u.timestamp === 'number');
					if (!jsUpdates.length) {
						noteDelivered((payload.updates ?? []).map((u) => u.timestamp).filter((t): t is number => typeof t === 'number'));
						release();
						originalSend(...args);
						return;
					}
					const timestamps = new Set(jsUpdates.map((u) => u.timestamp!));
					const rerun = collectRerunUrls(graph(), jsUpdates, served);
					const failure = await checkModules(
						server,
						collectCheckedUrls(
							graph(),
							rerun,
							jsUpdates.map((u) => u.acceptedPath ?? ''),
						),
						strategy,
					);
					noteDelivered(timestamps);
					if (failure) {
						held = [];
						if (heldTimer) clearTimeout(heldTimer);
						heldTimer = undefined;
						for (const t of timestamps) failedSaves.add(t);
						// Vite would buffer it for the next connection, where it may be stale;
						// the catch-up on connect checks again instead.
						if (!channel.clients || channel.clients.size > 0) originalSend({ type: 'error', err: failure } satisfies ErrorPayload);
						return;
					}
					release();
					const changed = takeChanged([...failedSaves, ...timestamps]);
					failedSaves.clear();
					originalSend(NS_UPDATE_RERUN_EVENT, { timestamp: jsUpdates[0].timestamp!, changed, rerun, root: server.config.root } satisfies UpdateRerunEventData);
					originalSend(...args);
				};

				channel.send = (...args: SendArgs) => {
					queue = queue
						.then(() => handle(args))
						.catch((error) => {
							server.config.logger.error(`[ns-hmr] update check failed: ${error?.message ?? error}`);
							// An unchecked payload beats a lost one.
							originalSend(...args);
						});
				};
			}

			server.ws.on('vite:client:connect', (_data: unknown, client: WebSocketClient) => {
				void sendCatchUp(server, client, { graph: graph(), served, delivered, strategy }).catch((error) => server.config.logger.error(`[ns-hmr] catch-up failed: ${error?.message ?? error}`));
			});
		},
		hotUpdate(ctx) {
			if (this.environment.name !== 'client' || ctx.type !== 'update') return;
			let files = changedBySave.get(ctx.timestamp);
			if (!files) {
				files = new Set();
				changedBySave.set(ctx.timestamp, files);
				// Saves that never produced a `js-update` (in-place CSS, restarts) are dropped.
				for (const timestamp of [...changedBySave.keys()].slice(0, -32)) changedBySave.delete(timestamp);
			}
			files.add(viteUrlForFile(ctx.file, ctx.server.config.root));
		},
	};
}

/**
 * Served modules the device holds an outdated instance of: Vite stamped them
 * after they were served, and the update for that save never reached a
 * connected device (it was booting or offline).
 */
export function findMissedModules(graph: GraphLike, served: Pick<ServedModules, 'servedAt'>, delivered: ReadonlySet<number>): string[] {
	const missed: string[] = [];
	for (const [url, at] of served.servedAt()) {
		const stamp = graph.urlToModuleMap.get(url)?.lastHMRTimestamp ?? 0;
		if (stamp > at && !delivered.has(stamp)) missed.push(url);
	}
	return missed;
}

/** One soft reboot (or a restart without an entry boundary) for a device that connects having missed updates. */
export async function sendCatchUp(server: Pick<ViteDevServer, 'config' | 'environments'>, client: Pick<WebSocketClient, 'send'>, state: { graph: GraphLike; served: ServedModules; delivered: Set<number>; strategy?: FrameworkServerStrategy }): Promise<'none' | 'reboot' | 'restart' | 'error'> {
	const missed = findMissedModules(state.graph, state.served, state.delivered);
	if (!missed.length) return 'none';
	if (!state.strategy?.entryBoundary) {
		requestAppRestart(`${missed.length} module(s) changed while the app was starting`);
		return 'restart';
	}
	const entry = resolveProjectMainEntryPath(server.config.root);
	const timestamp = Date.now();
	const update = { type: 'js-update' as const, path: entry, acceptedPath: entry, timestamp, explicitImportRequired: false, isWithinCircularImport: false };
	const rerun = collectRerunUrls(state.graph, [update], state.served);
	const failure = await checkModules(server, collectCheckedUrls(state.graph, rerun), state.strategy);
	if (failure) {
		client.send({ type: 'error', err: failure });
		return 'error';
	}
	client.send(NS_UPDATE_RERUN_EVENT, { timestamp, changed: missed, rerun, root: server.config.root } satisfies UpdateRerunEventData);
	client.send({ type: 'update', updates: [update] });
	return 'reboot';
}
