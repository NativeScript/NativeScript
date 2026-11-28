/**
 * NativeScript-specific HMR events. They travel as Vite custom events on Vite's
 * own HMR WebSocket (`server.ws.send(event, data)` → `{ type: 'custom', event,
 * data }`); every other message on that socket is stock Vite protocol.
 *
 * Pure types and constants only: this module is shared by `hmr/server` and
 * `hmr/client` and must not import from either.
 */
import type { UpdateModules } from './update-modules.js';

/**
 * Device → server: a change can't be applied by a hot update (a Vite
 * `full-reload`, a declined module, a teardown that threw). The server turns
 * it into an app restart. Any device module may send it with
 * `import.meta.hot.send(NS_RESTART_EVENT, { reason })`.
 */
export const NS_RESTART_EVENT = 'ns:restart';

/**
 * Server → device: an app restart is needed. The device shows it and applies
 * nothing further; without a CLI attached nobody else will restart it.
 */
export const NS_RESTART_REQUIRED_EVENT = 'ns:restart-required';

export interface RestartEventData {
	reason: string;
}

/**
 * Client-dispatched custom events around a soft reboot: an update whose
 * boundary is the app entry. Listeners register with
 * `import.meta.hot.on(event, cb)` and are awaited. Order:
 * `vite:beforeUpdate` → `nativescript:beforeReboot` → the entry's
 * `hot.dispose` → the new entry evaluates and the framework bootstraps →
 * `nativescript:afterReboot` → `vite:afterUpdate`.
 */
export const NS_BEFORE_REBOOT_EVENT = 'nativescript:beforeReboot';
export const NS_AFTER_REBOOT_EVENT = 'nativescript:afterReboot';

export interface RebootEventData extends UpdateModules {
	/** Vite URL of the app entry being re-evaluated. */
	entry: string;
	/** Set on `nativescript:afterReboot` when the new entry or its bootstrap failed. */
	error?: string;
}

/**
 * Server → device, sent right before every `update` payload with a
 * `js-update`: the edits behind it and the modules it re-evaluates, matched to
 * the payload by `timestamp`. A custom event because Vite rebuilds its own
 * `update` payloads and plugins (Analog) buffer them.
 */
export const NS_UPDATE_RERUN_EVENT = 'ns:rerun';

export interface UpdateRerunEventData {
	/** The `timestamp` of the first `js-update` of the payload it describes. */
	timestamp: number;
	/** Vite URLs of the edited files. */
	changed: string[];
	/**
	 * Vite URLs of every module the update re-evaluates: the edited modules and
	 * their importer chains up to and including each boundary. Module URLs
	 * without `t`/`import`, the form `createHotContext` owner paths take.
	 */
	rerun: string[];
	/** The server's project root, so a module may look itself up by absolute file path. */
	root: string;
}

/**
 * Client-dispatched to the listeners registered by the hot contexts of the
 * modules about to re-run (`UpdateRerunEventData.rerun`), and to no other
 * module, once per update, before any boundary's `hot.dispose`. Vite only
 * disposes the boundary; this lets every other re-running module release what
 * its old instance holds, e.g. `import.meta.hot?.on('nativescript:beforeRerun', () => off())`.
 */
export const NS_BEFORE_RERUN_EVENT = 'nativescript:beforeRerun';

export interface BeforeRerunEventData extends UpdateModules {
	timestamp: number;
}

/** Client-dispatched before the device asks for an app restart or shows that one is required. Awaited, best effort. */
export const NS_BEFORE_RESTART_EVENT = 'nativescript:beforeRestart';
