import type { ViteDevServer } from 'vite';

/** Tracks the project's `app.css` entry and the files it imports, for HMR invalidation. */
export interface AppCssState {
	path: string;
	deps: Set<string>;
}

const appCssStateByServer = new WeakMap<ViteDevServer, AppCssState>();

export function setAppCssState(server: ViteDevServer, state: AppCssState): void {
	appCssStateByServer.set(server, state);
}

export function getAppCssState(server: ViteDevServer): AppCssState | undefined {
	return appCssStateByServer.get(server);
}
