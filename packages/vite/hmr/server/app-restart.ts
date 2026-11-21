import type { DevEnvironment, HotUpdateOptions, Plugin, ViteDevServer } from 'vite';
import * as path from 'path';
import { NS_RESTART_EVENT, NS_RESTART_REQUIRED_EVENT, type RestartEventData } from '../shared/protocol.js';
import { viteUrlForFile } from './vite-url.js';
import { resolveNonEvictableViteUrlPrefixes } from './vite-plugin.js';

/**
 * IPC message `vite serve` sends its parent (the NativeScript CLI) when a
 * change can only be applied by restarting the app process. A soft full
 * reload re-evaluates app modules in place; it can't replace code that
 * evaluates once per process or undo a half-applied teardown.
 */
export interface NativeScriptRestartMessage {
	type: 'nativescript:restart';
	reason: string;
}

export const NATIVESCRIPT_RESTART_MESSAGE_TYPE = 'nativescript:restart';

export interface AppRestartRequesterOptions {
	/** The parent's IPC channel (`process.send`), absent when the CLI spawned the server without one. */
	send?: ((message: NativeScriptRestartMessage) => unknown) | undefined;
	/** Tells connected devices a restart is required. */
	notifyDevices(data: RestartEventData): void;
	log(message: string): void;
	/** Requests within this window collapse into one restart. */
	debounceMs?: number;
}

export interface AppRestartRequester {
	request(reason: string): void;
	/** Sends a pending request now; for tests and shutdown. */
	flush(): void;
}

export function createAppRestartRequester(options: AppRestartRequesterOptions): AppRestartRequester {
	const debounceMs = options.debounceMs ?? 250;
	const reasons: string[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;

	const flush = () => {
		if (timer) clearTimeout(timer);
		timer = undefined;
		if (!reasons.length) return;
		const reason = reasons.splice(0).join('; ');
		// The device stops applying updates either way, and gets to run its
		// `nativescript:beforeRestart` listeners before the CLI replaces it.
		options.notifyDevices({ reason });
		if (options.send) {
			options.send({ type: NATIVESCRIPT_RESTART_MESSAGE_TYPE, reason });
			return;
		}
		options.log(`[NativeScript] restart the app to apply: ${reason}`);
	};

	return {
		request(reason: string) {
			if (!reasons.includes(reason)) reasons.push(reason);
			if (timer) clearTimeout(timer);
			timer = setTimeout(flush, debounceMs);
		},
		flush,
	};
}

/**
 * True for a module of a package that evaluates once per process, which a
 * soft reboot can't re-evaluate: `@nativescript/core` re-evaluated in place
 * would mint a second `View` hierarchy the live native views fail
 * `instanceof` against, and the dev client keeps its identity because it is
 * the code running the update. `keepPrefixes` are the Vite URL prefixes of
 * both packages as the app resolves them (`/node_modules/…` or `/@fs/…`).
 */
export function isOncePerProcessViteUrl(viteUrl: string, keepPrefixes: readonly string[]): boolean {
	const path = viteUrl.replace(/[?#].*$/, '');
	if (!path.startsWith('/') || path.startsWith('/@vite/') || ONCE_PER_PROCESS_PACKAGE_RE.test(path)) {
		return true;
	}
	return keepPrefixes.some((prefix) => path.startsWith(prefix));
}

// The prefixes name the copies this process resolved; the device may load the
// same package through another path (a linked install's symlink, a nested copy).
const ONCE_PER_PROCESS_PACKAGE_RE = /\/node_modules\/@nativescript\/(?:core|vite)\//;

/** The module graph fields Vite's update propagation reads. */
export interface PropagationNode {
	url: string;
	isSelfAccepting?: boolean;
	importers: Set<PropagationNode>;
	acceptedHmrDeps: Set<PropagationNode>;
}

/**
 * True when propagating an update of `modules` re-evaluates a module for
 * which `isOncePerProcess` holds. Mirrors Vite's walk up the importers: a
 * chain ends at a self-accepting module or at an importer that accepts it.
 */
export function updateReachesOncePerProcessModule(modules: Iterable<PropagationNode>, isOncePerProcess: (url: string) => boolean): boolean {
	const seen = new Set<PropagationNode>();
	const pending = [...modules];
	while (pending.length) {
		const node = pending.pop()!;
		if (seen.has(node)) continue;
		seen.add(node);
		if (isOncePerProcess(node.url)) return true;
		if (node.isSelfAccepting) continue;
		for (const importer of node.importers) {
			if (!importer.acceptedHmrDeps.has(node)) pending.push(importer);
		}
	}
	return false;
}

export interface AppRestartEditOptions {
	root: string;
	keepPrefixes: readonly string[];
	/** True for a dependency pre-bundle's URL: one instance shared by every importer. */
	isOptimizedDepUrl?: (url: string) => boolean;
}

/**
 * True when an edit to `file` must restart the app: the device loaded it as
 * JavaScript, and it or a module its update re-evaluates evaluates once per
 * process. Vite's `?t=` update would load a second instance next to the live one.
 *
 * A package served from `node_modules` re-evaluates like app code unless its
 * update climbs into a pre-bundle (an excluded package that a pre-bundled one
 * imports) or core. Neither ever imports an app file.
 */
export function needsAppRestartForEdit(file: string, modules: readonly (PropagationNode & { type: string })[], options: AppRestartEditOptions): boolean {
	const jsModules = modules.filter((mod) => mod.type === 'js');
	if (!jsModules.length) return false;
	const isOncePerProcess = (url: string) => isOncePerProcessViteUrl(url, options.keepPrefixes) || !!options.isOptimizedDepUrl?.(url);
	const url = viteUrlForFile(file, options.root);
	if (isOncePerProcess(url)) return true;
	return url.includes('/node_modules/') && updateReachesOncePerProcessModule(jsModules, isOncePerProcess);
}

function relativeToRoot(file: string, root: string): string {
	const rel = path.relative(root, file).split(path.sep).join('/');
	return rel && !rel.startsWith('..') ? rel : file;
}

interface AppRestartState {
	serverStarts: number;
	/** The next server start is followed by an app restart request of its own. */
	nextStartRequestsRestart?: boolean;
	/** The first device connection to this server start requests an app restart. */
	restartOnConnect?: boolean;
}

// Module state, not plugin state: `server.restart()` (and a config edit)
// builds new plugin instances, but this module evaluates once per process.
const processState: AppRestartState = { serverStarts: 0 };
let currentServer: ViteDevServer | undefined;
const sendToCli = typeof process.send === 'function' ? (message: NativeScriptRestartMessage) => process.send!(message) : undefined;
const requester = createAppRestartRequester({
	send: sendToCli,
	notifyDevices: (data) => currentServer?.ws.send(NS_RESTART_REQUIRED_EVENT, data),
	log: (message) => (currentServer?.config.logger ?? console).warn(message),
});

/** Asks for an app restart (see {@link NativeScriptRestartMessage}). */
export function requestAppRestart(reason: string): void {
	// The CLI restarts every device, so each loads everything from this server;
	// without it, a device connecting later must still be told.
	if (sendToCli) processState.restartOnConnect = false;
	requester.request(reason);
}

/**
 * True when the CLI launches the app after the current server start: it
 * spawns `vite serve` with its build watcher and launches the app after that
 * watcher's first build, so only a process's first server start is followed
 * by a launch.
 */
export function cliLaunchesAppAfterServerStart(): boolean {
	return !!sendToCli && processState.serverStarts <= 1;
}

/**
 * Restarts the dev server for a change the caller follows with
 * {@link requestAppRestart}, so the first device connection to the new
 * server doesn't request a second app restart.
 */
export async function restartServerBeforeAppRestart(server: ViteDevServer, forceOptimize: boolean): Promise<void> {
	// Without the CLI nobody restarts the app: a device reconnecting later must still be told.
	processState.nextStartRequestsRestart = !!sendToCli;
	try {
		await server.restart(forceOptimize);
	} finally {
		processState.nextStartRequestsRestart = false;
	}
}

/**
 * Restart triggers on the dev server: edits to code a soft reload never
 * re-evaluates, a device's `ns:restart`, and the first device connection
 * after Vite restarted itself (the device's modules came from the previous
 * server's graph and plugin state).
 */
export function nsAppRestartPlugin(options: { request?: (reason: string) => void; state?: AppRestartState } = {}): Plugin {
	const request = options.request ?? requestAppRestart;
	const state = options.state ?? processState;
	let keepPrefixes: Promise<string[]> | undefined;

	return {
		name: 'nativescript-app-restart',
		apply: 'serve',
		configureServer(server) {
			currentServer = server;
			state.serverStarts++;
			state.restartOnConnect = state.serverStarts > 1 && !state.nextStartRequestsRestart;
			state.nextStartRequestsRestart = false;
			server.ws.on(NS_RESTART_EVENT, (data?: Partial<RestartEventData>) => {
				request(typeof data?.reason === 'string' && data.reason ? data.reason : 'the device requested a restart');
			});
			server.ws.on('vite:client:connect', () => {
				if (!state.restartOnConnect) return;
				state.restartOnConnect = false;
				request('the Vite dev server restarted');
			});
		},
		hotUpdate: {
			order: 'pre',
			async handler(ctx: HotUpdateOptions) {
				// Chokidar reports an edit as `create` for a file it never registered
				// (macOS FSEvents reports paths it did not walk), and Vite propagates
				// it like an `update`.
				if (this.environment.name !== 'client' || ctx.type === 'delete') return;
				keepPrefixes ??= resolveNonEvictableViteUrlPrefixes(ctx.server).catch(() => []);
				const optimizer = (this.environment as DevEnvironment).depsOptimizer;
				const isOptimizedDepUrl = optimizer && ((url: string) => optimizer.isOptimizedDepUrl(url));
				if (!needsAppRestartForEdit(ctx.file, ctx.modules, { root: ctx.server.config.root, keepPrefixes: await keepPrefixes, isOptimizedDepUrl })) return;
				request(`${relativeToRoot(ctx.file, ctx.server.config.root)} changed`);
				return [];
			},
		},
	};
}
