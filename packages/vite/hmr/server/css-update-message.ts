import type { ViteDevServer } from 'vite';
import * as path from 'path';
import { getServerOrigin } from './server-origin.js';
import type { CssUpdateItem, CssUpdatesMessage } from '../shared/protocol.js';

/**
 * Canonical helpers for the `ns:css-updates` wire message. Every server-side
 * emitter (the `.css`-edit branch of the hot-update prologue, the Tailwind
 * content-file path in content-css-update.ts, and the connect-time sync in
 * css-connect-sync.ts) builds its payload here so the path math and message
 * shape have exactly one implementation.
 */

/**
 * Root-relative posix path (leading slash) for the app stylesheet, or `null`
 * when the path escapes the project root — an escaped path would produce a
 * `/../…` fetch URL the device cannot resolve, so callers skip the broadcast.
 */
export function appCssRootRelPath(root: string, appCssAbsPath: string): string | null {
	const rootPosix = root.replace(/\\/g, '/').replace(/\/$/, '');
	const rel = path.posix.normalize(path.posix.relative(rootPosix, appCssAbsPath.replace(/\\/g, '/')));
	if (!rel || rel === '.' || rel.startsWith('..')) {
		return null;
	}
	return rel.startsWith('/') ? rel : `/${rel}`;
}

/** One `css-update` item. `tag` scopes component-style replaces; omitted for the global stylesheet. */
export function buildCssUpdateItem(cssPath: string, opts: { tag?: string; timestamp?: number } = {}): CssUpdateItem {
	return {
		type: 'css-update',
		path: cssPath,
		acceptedPath: cssPath,
		timestamp: opts.timestamp ?? Date.now(),
		...(opts.tag ? { tag: opts.tag } : {}),
	};
}

export function buildCssUpdatesMessage(server: ViteDevServer, updates: CssUpdateItem[], opts: { reason?: 'connect-sync' } = {}): CssUpdatesMessage {
	return {
		type: 'ns:css-updates',
		origin: getServerOrigin(server),
		updates,
		...(opts.reason ? { reason: opts.reason } : {}),
	};
}
