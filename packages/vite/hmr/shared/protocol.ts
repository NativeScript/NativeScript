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
	 * Tag for the client's `addTaggedAdditionalCSS`/`removeTaggedAdditionalCSS`
	 * pair, so repeated edits of the same source replace instead of stacking.
	 * Omitted for the app entry CSS (the client defaults to the `app.css` tag).
	 */
	tag?: string;
}

/** Global `app.css` and Tailwind content-CSS replacements, which are not Vite modules on the device. */
export const NS_CSS_UPDATES_EVENT = 'ns:css-updates';

export interface CssUpdatesEventData {
	/** HTTP origin the device fetches each `path` from. */
	origin: string;
	updates: CssUpdateItem[];
	/** `connect-sync`: the stylesheet sync sent to a client when it connects; applied without the update overlay. */
	reason?: 'connect-sync';
}
