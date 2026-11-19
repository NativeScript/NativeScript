import type { EnvironmentModuleNode, HotUpdateOptions, Plugin, ViteDevServer } from 'vite';
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
 * True for a module a soft reboot can re-evaluate. `@nativescript/core` and
 * other `node_modules` packages evaluate once per process: core re-evaluated
 * in place would mint a second `View` hierarchy the live native views fail
 * `instanceof` against. The dev client keeps its identity because it is the
 * code running the update. `keepPrefixes` are Vite URL prefixes of such
 * packages served from outside `node_modules` (`/@fs/…`).
 */
export function isAppOwnedViteUrl(viteUrl: string, keepPrefixes: readonly string[]): boolean {
	const path = viteUrl.replace(/[?#].*$/, '');
	if (!path.startsWith('/') || path.includes('/node_modules/') || path.startsWith('/@vite/')) {
		return false;
	}
	return !keepPrefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * True when an edit to `file` must restart the app: the device loaded it as
 * JavaScript and it evaluates once per process (`isAppOwnedViteUrl`). Vite's
 * `?t=` update for such a file would load a second instance next to the live one.
 */
export function needsAppRestartForEdit(file: string, modules: readonly Pick<EnvironmentModuleNode, 'type'>[], root: string, keepPrefixes: readonly string[]): boolean {
	if (!modules.some((mod) => mod.type === 'js')) return false;
	return !isAppOwnedViteUrl(viteUrlForFile(file, root), keepPrefixes);
}

function relativeToRoot(file: string, root: string): string {
	const rel = path.relative(root, file).split(path.sep).join('/');
	return rel && !rel.startsWith('..') ? rel : file;
}

interface AppRestartState {
	serverStarts: number;
	/** The next server start is followed by an app restart request of its own. */
	nextStartRequestsRestart?: boolean;
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
	requester.request(reason);
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
			let restartPending = state.serverStarts > 1 && !state.nextStartRequestsRestart;
			state.nextStartRequestsRestart = false;
			server.ws.on(NS_RESTART_EVENT, (data?: Partial<RestartEventData>) => {
				request(typeof data?.reason === 'string' && data.reason ? data.reason : 'the device requested a restart');
			});
			server.ws.on('vite:client:connect', () => {
				if (!restartPending) return;
				restartPending = false;
				request('the Vite dev server restarted');
			});
		},
		hotUpdate: {
			order: 'pre',
			async handler(ctx: HotUpdateOptions) {
				if (this.environment.name !== 'client' || ctx.type !== 'update') return;
				keepPrefixes ??= resolveNonEvictableViteUrlPrefixes(ctx.server).catch(() => []);
				if (!needsAppRestartForEdit(ctx.file, ctx.modules, ctx.server.config.root, await keepPrefixes)) return;
				request(`${relativeToRoot(ctx.file, ctx.server.config.root)} changed`);
				return [];
			},
		},
	};
}
