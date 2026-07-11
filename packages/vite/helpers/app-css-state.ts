import type { ViteDevServer } from 'vite';

/** Tracks the project's `app.css` entry and the files it imports, for HMR invalidation. */
export interface AppCssState {
	path: string;
	deps: Set<string>;
}

/**
 * Storage keys chosen to survive Vite's dev-server WRAPPERS.
 *
 * Under Vite 8, the legacy `handleHotUpdate` hook does not receive the same
 * object `configureServer` got: `ctx.server` is a backward-compat wrapper
 * (prototype-inheriting / proxy-like) over the real dev server. Property
 * reads forward to the underlying server, but the wrapper is a DIFFERENT
 * object identity — so a `WeakMap<ViteDevServer, …>` populated with the raw
 * server in `configureServer` always misses when queried with `ctx.server`
 * from a hot update. That identity split silently killed every consumer of
 * this state in the hot-update path (most visibly the Tailwind content-file
 * broadcast: new utility classes in templates never re-generated `app.css`).
 *
 * Two wrapper-proof mechanisms, both used:
 *   1. A symbol property stamped on the server. Writes in `configureServer`
 *      land on the raw server; reads through a wrapper find it via the
 *      prototype chain / proxy forwarding.
 *   2. A WeakMap keyed by `server.config` — the ResolvedConfig is the same
 *      object identity through any wrapper, and covers exotic wrappers that
 *      block property reads.
 */
const APP_CSS_STATE_KEY = Symbol.for('@nativescript/vite:app-css-state');
const appCssStateByConfig = new WeakMap<object, AppCssState>();

export function setAppCssState(server: ViteDevServer, state: AppCssState): void {
	try {
		(server as any)[APP_CSS_STATE_KEY] = state;
	} catch {}
	try {
		if (server?.config && typeof server.config === 'object') {
			appCssStateByConfig.set(server.config, state);
		}
	} catch {}
}

export function getAppCssState(server: ViteDevServer): AppCssState | undefined {
	try {
		const stamped = (server as any)?.[APP_CSS_STATE_KEY] as AppCssState | undefined;
		if (stamped) return stamped;
	} catch {}
	try {
		if (server?.config && typeof server.config === 'object') {
			return appCssStateByConfig.get(server.config);
		}
	} catch {}
	return undefined;
}
