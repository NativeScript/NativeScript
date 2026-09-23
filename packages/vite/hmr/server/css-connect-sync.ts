import type { ViteDevServer } from 'vite';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { appCssRootRelPath, buildCssUpdateItem, buildCssUpdatesMessage } from './css-update-message.js';
import { isSocketClientOpen } from './socket-utils.js';

/**
 * Boot-time stylesheet sync for freshly connected full HMR clients.
 *
 * `bundle.mjs` bakes `app.css` at `ns prepare` time. If the user edits any
 * CSS (or adds a Tailwind utility) during the session and then the app cold
 * relaunches — manual restart, crash, OS eviction — the new JS context
 * applies that stale boot snapshot and every accumulated CSS hot update is
 * lost until the NEXT css edit happens to broadcast. This closes that gap:
 * when a full client connects, compare the current generated `app.css`
 * against the server-startup baseline (≈ what prepare baked in) and, only
 * when they differ, push a regular `ns:css-updates` message to that one
 * client. The client applies it through the same pipeline as a live CSS
 * edit; `reason: 'connect-sync'` just suppresses the HMR-applying overlay.
 *
 * Only `full`-role sockets get the sync. The bootstrap fallback socket
 * connects BEFORE the boot CSS is applied, so a sync sent there would be
 * overwritten by the stale boot snapshot moments later. The full client
 * starts strictly after boot CSS lands (`__NS_HMR_BOOT_COMPLETE__` gate in
 * the browser-runtime bootstrap), which makes its connect a safe sync point.
 */
export async function maybeSendConnectCssSync(server: ViteDevServer, ws: { send: (data: string) => void; readyState?: number; OPEN?: number }, opts: { verbose?: boolean } = {}): Promise<boolean> {
	const state = getAppCssState(server);
	if (!state?.path || typeof state.refresh !== 'function') {
		return false;
	}

	// Cheap gate first: the drift check below re-runs Tailwind/PostCSS.
	const root = server.config?.root || process.cwd();
	const appCssRel = appCssRootRelPath(root, state.path);
	if (!appCssRel) {
		return false;
	}

	// `refresh` is non-throwing by contract and conservative on failure
	// (reports changed — reapplying identical CSS is idempotent, while
	// skipping a real drift leaves the relaunched app stale all session).
	const { changedSinceStartup } = await state.refresh();
	if (!changedSinceStartup) {
		return false;
	}

	// Re-check openness AFTER the await — the socket can close during the
	// Tailwind compilation.
	if (!isSocketClientOpen(ws)) {
		return false;
	}

	const msg = buildCssUpdatesMessage(server, [buildCssUpdateItem(appCssRel)], { reason: 'connect-sync' });
	try {
		ws.send(JSON.stringify(msg));
	} catch (error) {
		if (opts.verbose) console.warn('[hmr-ws] connect-sync send failed', error);
		return false;
	}
	console.info(`[hmr-ws] app.css changed since server startup → synced ${appCssRel} to newly connected client`);
	return true;
}
