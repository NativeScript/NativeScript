import type { ViteDevServer } from 'vite';
import type { WebSocketServer } from 'ws';
import * as path from 'path';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { appCssRootRelPath, buildCssUpdateItem, buildCssUpdatesMessage } from './css-update-message.js';
import type { CssUpdateItem } from '../shared/protocol.js';

export interface ContentCssUpdateOptions {
	server: ViteDevServer;
	file: string;
	root: string;
	wss: WebSocketServer;
	isSocketClientOpen: (client: { readyState?: number; OPEN?: number } | null | undefined) => boolean;
	/**
	 * The active framework strategy's `defersContentCssToFrameworkUpdate`
	 * verdict for this file: `true` routes the update into the framework's own
	 * message (returned as `deferredCssUpdates`) instead of broadcasting.
	 */
	deferToFrameworkUpdate: boolean;
	verbose: boolean;
}

export interface ContentCssUpdateResult {
	/** Present when the framework tail must carry the CSS update in its own message. */
	deferredCssUpdates?: CssUpdateItem[];
	/** Open sockets the standalone `ns:css-updates` broadcast reached. */
	recipients: number;
}

/**
 * Tailwind / content-scanning CSS routing for non-CSS edits.
 *
 * Background: when a `.html` template or `.ts` file scanned by Tailwind's
 * `content` config gains a brand-new utility class (e.g. a `pt-6` never used
 * before), the booted CSS bundle has no rule for it — the template HMR swaps
 * the markup, the class lookup misses, and the layout regresses.
 *
 * In a stock Vite setup the `vite:css` plugin registers each PostCSS content
 * dependency as an importer of the CSS module, so a content edit invalidates
 * the CSS through the moduleGraph. NS HMR breaks that chain: `app.css` loads
 * through `virtual:ns-app-css` whose `load` hook calls `preprocessCSS(...)`
 * and emits a JS module — the CSS is never a moduleGraph node, so the importer
 * chain never forms. `mainEntryPlugin` bridges the gap by tracking the
 * `preprocessCSS` dep set on the server (see `AppCssState`).
 *
 * When the changed file is in that set, regenerate the stylesheet and compare
 * with the previous output. Ordinary content edits are skipped; output that
 * actually changed is either broadcast as `ns:css-updates` or — when the
 * framework's own update message must carry it (Angular TS reboots, via the
 * `defersContentCssToFrameworkUpdate` strategy hook) — returned as
 * `deferredCssUpdates` so the device serializes CSS with the framework's
 * update cycle instead of racing view-tree teardown.
 *
 * Never throws: refresh is non-throwing by contract and the broadcast guards
 * each send.
 */
export async function processContentCssUpdate(opts: ContentCssUpdateOptions): Promise<ContentCssUpdateResult> {
	const { server, file, root, wss, isSocketClientOpen, deferToFrameworkUpdate, verbose } = opts;
	const none: ContentCssUpdateResult = { recipients: 0 };

	const appCssState = getAppCssState(server);
	if (!appCssState?.deps || !appCssState.path) {
		return none;
	}
	const normalizedFile = path.resolve(file).replace(/\\/g, '/');
	if (!appCssState.deps.has(normalizedFile)) {
		return none;
	}

	const { changed } = await appCssState.refresh();
	if (!changed) {
		if (verbose) console.info(`[ns-hmr][server] Tailwind/PostCSS output unchanged after ${path.basename(file)}; skipped app.css refresh`);
		return none;
	}

	const appCssRel = appCssRootRelPath(root, appCssState.path);
	if (!appCssRel) {
		return none;
	}
	const update = buildCssUpdateItem(appCssRel);

	if (deferToFrameworkUpdate) {
		if (verbose) console.info(`[ns-hmr][server] Tailwind/PostCSS output changed after ${path.basename(file)}; deferred ${appCssRel} to framework update`);
		return { deferredCssUpdates: [update], recipients: 0 };
	}

	let recipients = 0;
	try {
		const payload = JSON.stringify(buildCssUpdatesMessage(server, [update]));
		wss.clients.forEach((client) => {
			if (isSocketClientOpen(client)) {
				try {
					client.send(payload);
					recipients += 1;
				} catch {}
			}
		});
		if (verbose) console.info(`[ns-hmr][server] Tailwind/PostCSS content-file edit (${path.basename(file)}) broadcast ${appCssRel}`);
	} catch (error) {
		console.warn('[hmr-ws] CSS content-source broadcast failed:', error);
	}
	return { recipients };
}
