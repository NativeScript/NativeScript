import { existsSync } from 'node:fs';
import path from 'node:path';
import type { EnvironmentModuleNode, ErrorPayload, Plugin, Update, UpdatePayload, ViteDevServer, WebSocketClient } from 'vite';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { NS_UPDATE_RERUN_EVENT, type UpdateRerunEventData } from '../shared/protocol.js';
import { requestAppRestart } from './app-restart.js';
import { getServedModules, type ServedModules } from './served-modules.js';
import { deviceUrlForGraphUrl, transformIdForViteUrl, viteUrlForFile } from './vite-url.js';
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

const STYLESHEET_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)$/i;

const isStylesheetUrl = (url: string) => STYLESHEET_RE.test(url.split('?', 1)[0]);

/**
 * Whether `updates` restyle in place everything the withheld saves edited
 * (their files as `viteUrlForFile` URLs, per save): each save edited only
 * stylesheets, and each of those is re-sent whole, as a self-accepting
 * stylesheet module, or as a sheet `@import`ed only into re-sent ones (a
 * partial shared with a sheet that isn't re-sent would stay stale there).
 * Any other edit may sit below a boundary the passing update doesn't cross,
 * and a framework may have diffed the passing save against the withheld one
 * rather than against what the device runs.
 */
export function restylesWithheld(moduleGraph: GraphLike, updates: readonly JsUpdateLike[], withheldFiles: readonly (Iterable<string> | undefined)[], root: string): boolean {
	const resent = new Set<string>();
	const sheets = new Set<GraphNodeLike>();
	for (const update of updates) {
		const whole = update.type === 'css-update' || (update.type === 'js-update' && update.acceptedPath === update.path);
		if (!whole || !update.path || !isStylesheetUrl(update.path)) continue;
		resent.add(update.path.split('?', 1)[0]);
		const node = moduleGraph.urlToModuleMap.get(update.path);
		if (node) sheets.add(node);
	}
	const fresh = new Map<GraphNodeLike, boolean>();
	const isFresh = (node: GraphNodeLike): boolean => {
		if (sheets.has(node)) return true;
		const known = fresh.get(node);
		if (known !== undefined) return known;
		fresh.set(node, false);
		const result = isStylesheetUrl(node.url) && node.importers.size > 0 && [...node.importers].every(isFresh);
		fresh.set(node, result);
		return result;
	};
	const seen = new Set<GraphNodeLike>();
	const pending = [...sheets];
	// By file: Vite may key an `@import`ed partial as `/@fs/<file>` even inside the root.
	while (pending.length) {
		const node = pending.pop()!;
		if (seen.has(node)) continue;
		seen.add(node);
		if (node.file && isFresh(node)) resent.add(viteUrlForFile(node.file, root));
		for (const imported of node.importedModules) if (isStylesheetUrl(imported.url)) pending.push(imported);
	}
	return withheldFiles.every((files) => {
		const urls = files ? [...files] : [];
		return urls.length > 0 && urls.every((url) => isStylesheetUrl(url) && resent.has(url));
	});
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
 * failure: a transform that throws, or output the framework rejects. The
 * results stay in Vite's transform cache for the device's fetches.
 *
 * A module whose file was deleted is reached through its importers' old
 * edges until they re-transform, so it is checked after them, and only while
 * one of them still imports it.
 */
export async function checkModules(server: Pick<ViteDevServer, 'environments'>, urls: readonly string[], strategy?: Pick<FrameworkServerStrategy, 'verifyTransform'>): Promise<ErrorPayload['err'] | undefined> {
	const environment = server.environments.client;
	const nodeOf = (url: string) => environment.moduleGraph.urlToModuleMap.get(url);
	const check = async (url: string) => {
		const result = await environment.transformRequest(transformIdForViteUrl(url));
		const node = nodeOf(url);
		if (result && node?.id && strategy?.verifyTransform) {
			const failure = await strategy.verifyTransform({ id: node.id, url, code: result.code });
			if (failure) throw failure;
		}
	};
	const isDeleted = (url: string) => {
		const file = nodeOf(url)?.file;
		return !!file && path.isAbsolute(file) && !existsSync(file);
	};
	const deleted = urls.filter(isDeleted);
	const results = await Promise.allSettled(urls.filter((url) => !deleted.includes(url)).map(check));
	const stillImported = deleted.filter((url) => (nodeOf(url)?.importers.size ?? 0) > 0);
	results.push(...(await Promise.allSettled(stillImported.map(check))));
	const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
	return failed ? toErrorPayloadErr(failed.reason) : undefined;
}

/**
 * Per graph URL, the timestamp of the last save that edited its file: the
 * modules a save leaves in `ctx.modules` once every framework hook ran (a
 * template edit marks the template, or the component Analog swapped in).
 */
export type ModuleEdits = Map<string, number>;

// Keyed by the resolved config, like the served modules it is compared with.
const editsByConfig = new WeakMap<object, ModuleEdits>();

export function getModuleEdits(server: Pick<ViteDevServer, 'config'>): ModuleEdits {
	let edits = editsByConfig.get(server.config);
	if (!edits) {
		edits = new Map();
		editsByConfig.set(server.config, edits);
	}
	return edits;
}

type SendArgs = [payload: unknown, data?: unknown];
const wrappedChannels = new WeakSet<object>();

/**
 * The gate every HMR payload passes on its way to the device:
 * - an `update` with a `js-update` is compiled first; on failure the device
 *   gets Vite's `error` payload instead, and its app stays untouched;
 * - the first one that passes after such a failure becomes an entry reboot
 *   covering every edit since the last update that passed, unless those
 *   edits were only stylesheets it re-sends whole;
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
			const edits = getModuleEdits(server);
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
						withhold(timestamps, failure);
						return;
					}
					if (
						failedSaves.size &&
						!restylesWithheld(
							graph(),
							payload.updates ?? [],
							[...failedSaves].map((t) => changedBySave.get(t)),
							server.config.root,
						)
					) {
						await sendWithheld(payload.updates ?? [], timestamps);
						return;
					}
					const saves = [...failedSaves, ...timestamps];
					failedSaves.clear();
					release();
					const changed = takeChanged(saves);
					originalSend(NS_UPDATE_RERUN_EVENT, { timestamp: jsUpdates[0].timestamp!, changed: changed.map(deviceUrlForGraphUrl), rerun: rerun.map(deviceUrlForGraphUrl), root: server.config.root } satisfies UpdateRerunEventData);
					originalSend(...args);
				};

				const dropHeld = () => {
					held = [];
					if (heldTimer) clearTimeout(heldTimer);
					heldTimer = undefined;
				};

				const withhold = (timestamps: Iterable<number>, failure: ErrorPayload['err']) => {
					dropHeld();
					for (const t of timestamps) failedSaves.add(t);
					// Vite would buffer it for the next connection, where it may be stale;
					// the catch-up on connect checks again instead.
					if (!channel.clients || channel.clients.size > 0) originalSend({ type: 'error', err: failure } satisfies ErrorPayload);
				};

				/**
				 * Sent in place of the first update that passes after withheld ones.
				 * Their edits never reached the device, and the passing update's own
				 * boundaries may not cover them (a util below a component that
				 * re-renders in place), so the app reboots through its entry with
				 * every edit since the last update that passed, or restarts without
				 * an entry boundary. Gated in-place events are dropped: the reboot
				 * re-evaluates their modules.
				 */
				const sendWithheld = async (updates: readonly JsUpdateLike[], timestamps: ReadonlySet<number>) => {
					const saves = new Set([...failedSaves, ...timestamps]);
					if (!strategy?.entryBoundary) {
						dropHeld();
						failedSaves.clear();
						const changed = takeChanged(saves);
						requestAppRestart(`${changed.length} file(s) changed while an update was failing to compile`);
						return;
					}
					const timestamp = Date.now();
					restampEdits(server, edits, saves, timestamp);
					const reboot = await prepareEntryReboot(server, graph(), served, strategy, timestamp);
					if ('failure' in reboot) {
						withhold(timestamps, reboot.failure);
						return;
					}
					dropHeld();
					failedSaves.clear();
					const changed = takeChanged(saves);
					originalSend(NS_UPDATE_RERUN_EVENT, { timestamp, changed: changed.map(deviceUrlForGraphUrl), rerun: reboot.rerun.map(deviceUrlForGraphUrl), root: server.config.root } satisfies UpdateRerunEventData);
					originalSend({ type: 'update', updates: [reboot.update, ...(updates.filter((u) => u.type !== 'js-update') as Update[])] } satisfies UpdatePayload);
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
				void sendCatchUp(server, client, { graph: graph(), served, delivered, edits, strategy }).catch((error) => server.config.logger.error(`[ns-hmr] catch-up failed: ${error?.message ?? error}`));
			});
		},
		hotUpdate: {
			// After the framework hooks, which may swap the edited file's modules.
			order: 'post',
			handler(ctx) {
				if (this.environment.name !== 'client' || ctx.type !== 'update') return;
				let files = changedBySave.get(ctx.timestamp);
				if (!files) {
					files = new Set();
					changedBySave.set(ctx.timestamp, files);
					// Saves that never produced a `js-update` (in-place CSS, restarts) are dropped.
					for (const timestamp of [...changedBySave.keys()].slice(0, -32)) changedBySave.delete(timestamp);
				}
				files.add(viteUrlForFile(ctx.file, ctx.server.config.root));
				const edits = getModuleEdits(ctx.server);
				for (const mod of ctx.modules) edits.set(mod.url, ctx.timestamp);
			},
		},
	};
}

// A script module is a device module of its own: one the device hasn't
// fetched yet (an unvisited lazy route) will be served fresh.
const SCRIPT_FILE_RE = /\.(?:[cm]?[jt]sx?|vue|svelte)$/i;

/**
 * The modules compiled into served module `node`: itself and the non-script
 * modules it imports that the device never fetched (templates and
 * stylesheets a component compiles in), transitively.
 */
function compiledInto(node: GraphNodeLike, served: Pick<ServedModules, 'isServed'>): GraphNodeLike[] {
	const out: GraphNodeLike[] = [];
	const seen = new Set<GraphNodeLike>();
	const pending = [node];
	while (pending.length) {
		const current = pending.pop()!;
		if (seen.has(current)) continue;
		seen.add(current);
		out.push(current);
		for (const imported of current.importedModules) {
			if (!served.isServed(imported.url) && !SCRIPT_FILE_RE.test(imported.file ?? imported.url.split('?')[0])) pending.push(imported);
		}
	}
	return out;
}

/**
 * Served modules the device holds an outdated instance of: a file compiled
 * into one was edited after it was served, and that save never reached a
 * connected device (it was booting or offline). Importers Vite re-stamped on
 * the way to a boundary don't count: their own code didn't change.
 */
export function findMissedModules(graph: GraphLike, served: Pick<ServedModules, 'servedAt' | 'isServed'>, delivered: ReadonlySet<number>, edits: ReadonlyMap<string, number>): string[] {
	const missed: string[] = [];
	for (const [url, at] of served.servedAt()) {
		const node = graph.urlToModuleMap.get(url);
		if (!node) continue;
		const stale = compiledInto(node, served).some((mod) => {
			const editedAt = edits.get(mod.url);
			return editedAt !== undefined && editedAt > at && !delivered.has(editedAt);
		});
		if (stale) missed.push(url);
	}
	return missed;
}

/** One soft reboot (or a restart without an entry boundary) for a device that connects having missed updates. */
export async function sendCatchUp(server: Pick<ViteDevServer, 'config' | 'environments'>, client: Pick<WebSocketClient, 'send'>, state: { graph: GraphLike; served: ServedModules; delivered: Set<number>; edits: ReadonlyMap<string, number>; strategy?: FrameworkServerStrategy }): Promise<'none' | 'reboot' | 'restart' | 'error'> {
	const missed = findMissedModules(state.graph, state.served, state.delivered, state.edits);
	if (!missed.length) return 'none';
	if (!state.strategy?.entryBoundary) {
		requestAppRestart(`${missed.length} module(s) changed while the app was starting`);
		return 'restart';
	}
	const timestamp = Date.now();
	const reboot = await prepareEntryReboot(server, state.graph, state.served, state.strategy, timestamp);
	if ('failure' in reboot) {
		client.send({ type: 'error', err: reboot.failure });
		return 'error';
	}
	client.send(NS_UPDATE_RERUN_EVENT, { timestamp, changed: missed.map(deviceUrlForGraphUrl), rerun: reboot.rerun.map(deviceUrlForGraphUrl), root: server.config.root } satisfies UpdateRerunEventData);
	client.send({ type: 'update', updates: [reboot.update] });
	return 'reboot';
}

/**
 * A `js-update` of the app entry, and the modules it re-runs: everything
 * below the entry whose current `?t=` stamp the device hasn't loaded.
 * Checked like any other update.
 */
async function prepareEntryReboot(server: Pick<ViteDevServer, 'config' | 'environments'>, graph: GraphLike, served: ServedModules, strategy: FrameworkServerStrategy | undefined, timestamp: number): Promise<{ update: Update; rerun: string[] } | { failure: ErrorPayload['err'] }> {
	const entry = resolveProjectMainEntryPath(server.config.root);
	const update: Update = { type: 'js-update', path: entry, acceptedPath: entry, timestamp, explicitImportRequired: false, isWithinCircularImport: false };
	const rerun = collectRerunUrls(graph, [update], served);
	const failure = await checkModules(server, collectCheckedUrls(graph, rerun), strategy);
	return failure ? { failure } : { update, rerun };
}

/**
 * Stamps the modules `saves` edited, and their importers up to one that
 * accepts them, with `timestamp`, as Vite does for an edit. A module updated
 * in place (an Angular template) leaves its importers' stamps alone, and an
 * entry reboot only re-imports modules whose stamp the device hasn't loaded.
 */
function restampEdits(server: Pick<ViteDevServer, 'environments'>, edits: ModuleEdits, saves: ReadonlySet<number>, timestamp: number): void {
	const moduleGraph = server.environments.client.moduleGraph;
	const seen = new Set<EnvironmentModuleNode>();
	for (const [url, editedAt] of edits) {
		if (!saves.has(editedAt)) continue;
		const mod = moduleGraph.urlToModuleMap.get(url);
		if (mod) moduleGraph.invalidateModule(mod, seen, timestamp, true);
	}
}
