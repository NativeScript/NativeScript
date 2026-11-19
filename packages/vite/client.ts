/**
 * `@nativescript/vite/client`: types for app code. List it in
 * `compilerOptions.types`, as `vite/client`, to type `import.meta.hot` and the
 * NativeScript HMR events:
 *
 * ```ts
 * import.meta.hot?.on('nativescript:beforeRerun', () => off());
 * import.meta.hot?.on('nativescript:beforeReboot', (e) => {
 *   if (e.isRerun(import.meta.url)) cleanup();
 * });
 * ```
 */
/// <reference types="vite/client" preserve="true" />
import type { BeforeRerunEventData, RebootEventData, RestartEventData } from './hmr/shared/protocol.js';

export type { BeforeRerunEventData, RebootEventData, RestartEventData } from './hmr/shared/protocol.js';
export type { HmrModuleChange, UpdateModules } from './hmr/shared/update-modules.js';

declare module 'vite/types/customEvent.d.ts' {
	interface CustomEventMap {
		/** An update whose boundary is the app entry is about to re-evaluate it. Awaited. */
		'nativescript:beforeReboot': RebootEventData;
		/** The re-evaluated entry's app has started (or failed: `error`). */
		'nativescript:afterReboot': RebootEventData;
		/** Only for modules about to re-run in this update; before any boundary's `dispose`. Awaited. */
		'nativescript:beforeRerun': BeforeRerunEventData;
		/** The app is about to be restarted. Awaited, best effort. */
		'nativescript:beforeRestart': RestartEventData;
	}
}
