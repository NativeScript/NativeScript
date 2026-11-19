import type { Plugin } from 'vite';
import path from 'path';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import type { FrameworkEntryBoundary } from './framework-strategy.js';
import { NS_UPDATE_RERUN_EVENT, type UpdateRerunEventData } from '../shared/protocol.js';
import { viteUrlForFile } from './thin/thin-mode.js';
import { resolveProjectMainEntryPath } from './vite-plugin.js';

/**
 * Code prepended to the app entry. `import.meta.hot.accept()` makes the entry
 * the HMR boundary for everything below it: Vite then answers an edit with a
 * `js-update` of the entry and `?t=`-stamps only the changed import chain, and
 * the device disposes the running app and re-evaluates the entry.
 *
 * Placed first so the boundary is registered even when the entry body throws;
 * the framework's exports are read through a namespace so an older framework
 * build without them still links.
 */
export function createEntryBoundaryCode(boundary: FrameworkEntryBoundary): string {
	const call = (name: string | undefined) => (name ? `(typeof __nsFramework[${JSON.stringify(name)}] === 'function' ? __nsFramework[${JSON.stringify(name)}]() : undefined)` : 'undefined');
	return [`import { registerEntryBoundary as __nsRegisterEntryBoundary } from '/@vite/client';`, `import * as __nsFramework from ${JSON.stringify(boundary.module)};`, `if (import.meta.hot) {`, `\timport.meta.hot.accept();`, `\timport.meta.hot.dispose(() => ${call(boundary.dispose)});`, `\t__nsRegisterEntryBoundary(() => ${call(boundary.settled)});`, `}`, ''].join('\n');
}

type SendArgs = [payload: unknown, data?: unknown];

interface GraphNodeLike {
	id: string | null;
	url: string;
	type: string;
	lastHMRTimestamp: number;
	importedModules: Set<GraphNodeLike>;
}

interface JsUpdateLike {
	type?: string;
	acceptedPath?: string;
	timestamp?: number;
}

/**
 * Vite URLs of the JS modules the device re-evaluates for these `js-update`s:
 * each `acceptedPath`, which it imports with `?t=`, plus the imports reachable
 * from it that Vite stamped with the same timestamp, which import analysis
 * rewrites to new `?t=` URLs. Everything else is a cache hit. Vite also stamps
 * importers above a boundary that stops early (a template accepted in place),
 * so the stamp alone over-counts.
 */
export function collectRerunUrls(moduleGraph: { urlToModuleMap: Map<string, GraphNodeLike> }, updates: readonly JsUpdateLike[]): string[] {
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
			if (node.id && node.type === 'js') urls.add(node.url);
			for (const imported of node.importedModules) {
				if (imported.lastHMRTimestamp === update.timestamp) pending.push(imported);
			}
		}
	}
	return [...urls];
}

const wrappedChannels = new WeakSet<object>();

/**
 * Makes the app entry the HMR boundary of a flavor that declares one: the
 * device then reboots the app in place for any edit below the entry.
 */
export function nsEntryBoundaryPlugin(opts: { flavor: string }): Plugin | undefined {
	const boundary = getFrameworkServerStrategy(opts.flavor)?.entryBoundary;
	if (!boundary) return undefined;
	const code = createEntryBoundaryCode(boundary);
	let entryFile: string | undefined;

	return {
		name: 'nativescript-entry-boundary',
		apply: 'serve',
		// After the framework's own compile (Analog replaces the source it is
		// given), before Vite's import analysis, which must see the `accept()`.
		enforce: 'post',
		configResolved(config) {
			entryFile = path.join(config.root, resolveProjectMainEntryPath(config.root));
		},
		transform(source, id) {
			if (this.environment?.name !== 'client' || !entryFile) return null;
			if (path.resolve(id.split('?', 1)[0]) !== path.resolve(entryFile)) return null;
			return { code: code + source, map: null };
		},
	};
}

/**
 * Sends `ns:rerun` right before every `update` with a `js-update`: the edits
 * behind it and the modules it re-evaluates, which the device turns into
 * `nativescript:beforeReboot` and the targeted `nativescript:beforeRerun`.
 */
export function nsRerunPlugin(): Plugin {
	// Keyed by the save's timestamp, which Vite reuses for its `js-update`s;
	// other payloads of the same save (Analog's `css-update`) don't consume it.
	const changedBySave = new Map<number, Set<string>>();

	return {
		name: 'nativescript-rerun',
		apply: 'serve',
		configureServer(server) {
			const channel = server.ws as unknown as { send: (...args: SendArgs) => void };
			if (wrappedChannels.has(channel)) return;
			wrappedChannels.add(channel);
			const originalSend = channel.send.bind(channel);
			channel.send = (...args: SendArgs) => {
				const payload = args[0] as { type?: string; updates?: JsUpdateLike[] } | string;
				if (typeof payload === 'object' && payload?.type === 'update') {
					// Analog may flush the updates of several saves as one payload.
					const jsUpdates = (payload.updates ?? []).filter((u) => u.type === 'js-update' && typeof u.timestamp === 'number');
					if (jsUpdates.length) {
						const changed = new Set<string>();
						for (const timestamp of new Set(jsUpdates.map((u) => u.timestamp!))) {
							for (const url of changedBySave.get(timestamp) ?? []) changed.add(url);
							changedBySave.delete(timestamp);
						}
						const rerun = collectRerunUrls(server.environments.client.moduleGraph as any, jsUpdates);
						originalSend(NS_UPDATE_RERUN_EVENT, { timestamp: jsUpdates[0].timestamp!, changed: [...changed], rerun, root: server.config.root } satisfies UpdateRerunEventData);
					}
				}
				return originalSend(...args);
			};
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
