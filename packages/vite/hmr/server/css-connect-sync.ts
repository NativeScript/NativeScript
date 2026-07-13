import type { ViteDevServer } from 'vite';
import * as path from 'path';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { getServerOrigin } from './server-origin.js';
import type { CssUpdatesMessage } from '../shared/protocol.js';

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
	if (!state?.path || typeof state.hasChangedSinceStartup !== 'function') {
		return false;
	}

	let changed: boolean;
	try {
		changed = await state.hasChangedSinceStartup();
	} catch (error) {
		// Conservative: syncing identical CSS is idempotent; skipping a real
		// drift leaves the relaunched app stale for the rest of the session.
		changed = true;
		if (opts.verbose) console.warn('[hmr-ws] connect-sync drift check failed; syncing anyway', error);
	}
	if (!changed) {
		return false;
	}

	const root = (server.config?.root || process.cwd()).replace(/\\/g, '/').replace(/\/$/, '');
	const rel = path.posix.normalize(path.posix.relative(root, state.path.replace(/\\/g, '/')));
	if (!rel || rel === '.' || rel.startsWith('..')) {
		return false;
	}
	const appCssRel = rel.startsWith('/') ? rel : `/${rel}`;

	const openState = typeof ws.OPEN === 'number' ? ws.OPEN : 1;
	if (typeof ws.readyState === 'number' && ws.readyState !== openState) {
		return false;
	}

	const timestamp = Date.now();
	const msg: CssUpdatesMessage = {
		type: 'ns:css-updates',
		origin: getServerOrigin(server),
		reason: 'connect-sync',
		updates: [
			{
				type: 'css-update',
				path: appCssRel,
				acceptedPath: appCssRel,
				timestamp,
			},
		],
	};
	try {
		ws.send(JSON.stringify(msg));
	} catch (error) {
		if (opts.verbose) console.warn('[hmr-ws] connect-sync send failed', error);
		return false;
	}
	console.info(`[hmr-ws] app.css changed since server startup → synced ${appCssRel} to newly connected client`);
	return true;
}
