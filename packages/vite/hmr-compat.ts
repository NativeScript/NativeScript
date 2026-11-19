/**
 * `@nativescript/vite/hmr-compat` (experimental, opt-in): deprecated shims for the globals of the
 * pre-thin HMR client, so existing app code keeps working while it moves to `import.meta.hot`.
 * Import it first in the app entry:
 *
 * ```ts
 * import '@nativescript/vite/hmr-compat';
 * ```
 *
 * Each global forwards to `import.meta.hot` and warns once. Everything runs inside
 * `if (import.meta.hot)`, so release and webpack builds get nothing.
 */
/// <reference types="vite/client" />
import { clientDispatchOf, defineViteHmrCompatGlobals } from './hmr/client/compat-globals.js';

if (import.meta.hot) {
	defineViteHmrCompatGlobals(globalThis, {
		hot: import.meta.hot,
		dispatch: clientDispatchOf(import.meta.hot),
		origin: new URL(import.meta.url).origin,
	});
}
