/**
 * NativeScript-specific HMR events. They travel as Vite custom events on Vite's
 * own HMR WebSocket (`server.ws.send(event, data)` → `{ type: 'custom', event,
 * data }`); every other message on that socket is stock Vite protocol.
 *
 * Pure types and constants only: this module is shared by `hmr/server` and
 * `hmr/client` and must not import from either.
 */

/** A single stylesheet replacement carried by {@link NS_CSS_UPDATES_EVENT}. */
export interface CssUpdateItem {
	type: 'css-update';
	path: string;
	acceptedPath: string;
	timestamp: number;
	/**
	 * The generated stylesheet. The device applies it as is and fetches
	 * nothing: its own I/O must not go through the app's `fetch`/XHR, which
	 * Zone.js patches.
	 */
	css: string;
	/**
	 * Tag for the client's `addTaggedAdditionalCSS`/`removeTaggedAdditionalCSS`
	 * pair, so repeated edits of the same source replace instead of stacking.
	 * Omitted for the app entry CSS (the client defaults to the `app.css` tag).
	 */
	tag?: string;
}

/** Global `app.css` and Tailwind content-CSS replacements, which are not Vite modules on the device. */
export const NS_CSS_UPDATES_EVENT = 'ns:css-updates';

export interface CssUpdatesEventData {
	updates: CssUpdateItem[];
	/** `connect-sync`: the stylesheet sync sent to a client when it connects; applied without the update overlay. */
	reason?: 'connect-sync';
}

/**
 * Device → server: a change can't be applied by a soft reload (a declined
 * module, a teardown that threw). The server turns it into an app restart.
 */
export const NS_RESTART_EVENT = 'ns:restart';

/**
 * Server → device: an app restart is needed and no CLI is attached to perform
 * it. The device shows it and applies nothing further.
 */
export const NS_RESTART_REQUIRED_EVENT = 'ns:restart-required';

export interface RestartEventData {
	reason: string;
}
