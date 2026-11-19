import type { EnvironmentModuleNode, HotUpdateOptions, Plugin, ViteDevServer, WebSocketClient } from 'vite';
import { isCSSRequest } from 'vite';
import * as path from 'path';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { NS_CSS_UPDATES_EVENT, type CssUpdateItem, type CssUpdatesEventData } from '../shared/protocol.js';
import { getServerOrigin } from './server-origin.js';

/**
 * The global stylesheet (`app.css`, or `styles.css`) is baked into
 * `bundle.mjs` and is not a module the device imports, so Vite's own updates
 * never reach it. Its edits, and Tailwind/PostCSS regenerations triggered by
 * content files, travel as the `ns:css-updates` custom event instead.
 */

/**
 * Root-relative posix path (leading slash) for the app stylesheet, or `null`
 * when it escapes the project root: the device could not fetch a `/../…` URL.
 */
export function appCssRootRelPath(root: string, appCssAbsPath: string): string | null {
	const rootPosix = root.replace(/\\/g, '/').replace(/\/$/, '');
	const rel = path.posix.normalize(path.posix.relative(rootPosix, appCssAbsPath.replace(/\\/g, '/')));
	if (!rel || rel === '.' || rel.startsWith('..')) {
		return null;
	}
	return rel.startsWith('/') ? rel : `/${rel}`;
}

export function buildCssUpdateItem(cssPath: string, timestamp = Date.now()): CssUpdateItem {
	return { type: 'css-update', path: cssPath, acceptedPath: cssPath, timestamp };
}

export function buildCssUpdatesEventData(server: ViteDevServer, updates: CssUpdateItem[], reason?: CssUpdatesEventData['reason']): CssUpdatesEventData {
	return { origin: getServerOrigin(server), updates, ...(reason ? { reason } : {}) };
}

const normalizeFsPath = (p: string): string => path.resolve(p).replace(/\\/g, '/');

/**
 * Drops the modules through which Vite would push its own update for the
 * stylesheet: the device's fetched copy of it, and file-only entries (PostCSS
 * `@import` partials, Tailwind content files) that nothing but that copy imports.
 */
function withoutAppCssCarriers(modules: EnvironmentModuleNode[], appCssPath: string): EnvironmentModuleNode[] {
	const isAppCss = (mod: EnvironmentModuleNode) => !!mod.file && normalizeFsPath(mod.file) === appCssPath;
	return modules.filter((mod) => !isAppCss(mod) && !(mod.id == null && mod.importers.size > 0 && [...mod.importers].every(isAppCss)));
}

/**
 * Client-environment `hotUpdate` for the global stylesheet. Sends
 * `ns:css-updates` when `file` is the stylesheet or one of its `.css` imports
 * (always), or a Tailwind/PostCSS content file whose edit changed the
 * generated output. Resolves only after the event is sent, so it precedes
 * Vite's own payload for the same edit on the socket.
 */
export async function handleAppCssHotUpdate(options: Pick<HotUpdateOptions, 'type' | 'file' | 'modules' | 'server'>, verbose = false): Promise<EnvironmentModuleNode[] | undefined> {
	const { type, file, modules, server } = options;
	if (type !== 'update') return undefined;
	const state = getAppCssState(server);
	if (!state?.path) return undefined;
	const changed = normalizeFsPath(file);
	if (!state.deps.has(changed) && changed !== state.path) return undefined;

	const appCssRel = appCssRootRelPath(server.config.root || process.cwd(), state.path);
	if (!appCssRel) {
		if (verbose) console.warn(`[ns-css] ${state.path} is outside the project root; no ns:css-updates sent`);
		return undefined;
	}

	const isStylesheet = changed === state.path || isCSSRequest(changed);
	if (!isStylesheet) {
		const { changed: outputChanged } = await state.refresh();
		if (!outputChanged) {
			if (verbose) console.info(`[ns-css] Tailwind/PostCSS output unchanged after ${path.basename(file)}`);
			return undefined;
		}
	}

	server.ws.send(NS_CSS_UPDATES_EVENT, buildCssUpdatesEventData(server, [buildCssUpdateItem(appCssRel)]));
	if (verbose) console.info(`[ns-css] ${path.basename(file)} → ${NS_CSS_UPDATES_EVENT} ${appCssRel}`);

	// ns:css-updates already applies the stylesheet under its `app.css` tag; a
	// Vite update of the device's fetched copy would apply it a second time.
	// Content files keep their modules: Vite full-reloads an `.html` edit left
	// with none.
	return isStylesheet ? withoutAppCssCarriers(modules, state.path) : undefined;
}

/**
 * Sends `ns:css-updates` (`reason: 'connect-sync'`) to a client that connects
 * after the stylesheet drifted from the one `bundle.mjs` baked at prepare
 * time: a cold relaunch applies that stale copy, and every live CSS edit of
 * the session would otherwise be lost until the next one. The device must
 * connect only after it has applied the baked stylesheet, or this sync is
 * overwritten.
 */
export async function sendConnectCssSync(server: ViteDevServer, client: Pick<WebSocketClient, 'send'> & { socket?: { readyState?: number } }, verbose = false): Promise<boolean> {
	const state = getAppCssState(server);
	if (!state?.path) return false;
	const appCssRel = appCssRootRelPath(server.config.root || process.cwd(), state.path);
	if (!appCssRel) return false;

	const { changedSinceStartup } = await state.refresh();
	// The socket can close during the Tailwind compile.
	if (!changedSinceStartup || (client.socket && client.socket.readyState !== 1)) return false;

	try {
		client.send(NS_CSS_UPDATES_EVENT, buildCssUpdatesEventData(server, [buildCssUpdateItem(appCssRel)], 'connect-sync'));
	} catch (error) {
		if (verbose) console.warn('[ns-css] connect-sync send failed', error);
		return false;
	}
	console.info(`[ns-css] app.css changed since server startup → synced ${appCssRel} to the connecting client`);
	return true;
}

export function nsCssUpdatesPlugin(opts: { verbose?: boolean }): Plugin {
	const verbose = !!opts.verbose;
	return {
		name: 'nativescript-css-updates',
		apply: 'serve',
		configureServer(server) {
			server.ws.on('vite:client:connect', (_data, client) => {
				sendConnectCssSync(server, client, verbose).catch((error) => {
					if (verbose) console.warn('[ns-css] connect-sync failed', error);
				});
			});
		},
		async hotUpdate(options) {
			if (this.environment.name !== 'client') return;
			return handleAppCssHotUpdate(options, verbose);
		},
	};
}
