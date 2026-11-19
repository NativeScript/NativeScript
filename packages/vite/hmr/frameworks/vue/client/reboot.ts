import { Application } from '@nativescript/core';
import { ELEMENT_REF } from 'nativescript-vue';
import { prepareHmrReboot as prepareRootReset, whenHmrRebootSettled as whenRootReset, type HmrRebootResult } from '../../core/client/reboot.js';

export type { HmrRebootResult };

interface VueApp {
	unmount(): void;
}

let replacedApp: VueApp | undefined;

// `app.start()` mounts the root component into an NSVRoot, the parent node of
// the root view's element, and Vue tags every mount container with its app.
function appOfRootView(): VueApp | undefined {
	const root = Application.getRootView() as any;
	return root?.[ELEMENT_REF]?.parentNode?.__vue_app__;
}

/**
 * Tears the running nativescript-vue app down for a soft reboot. The dev
 * server calls it from the app entry's `import.meta.hot.dispose`: it closes
 * open modals and makes the re-evaluated entry's `createApp(...).start()`,
 * which calls `Application.run`, replace the root view through
 * `Application.resetRootView`. The running app is unmounted by
 * {@link whenHmrRebootSettled} once the new root view is up.
 *
 * Idempotent: a retry after a failed reboot calls it again.
 */
export function prepareHmrReboot(): void {
	replacedApp = appOfRootView() ?? replacedApp;
	prepareRootReset();
}

/**
 * Settles once the re-evaluated entry's root view is loaded, then unmounts
 * the app it replaced. Resolves `{ error }` when the root view could not be
 * replaced or the old app's unmount threw. Never rejects.
 */
export async function whenHmrRebootSettled(): Promise<HmrRebootResult> {
	const result = await whenRootReset();
	const previous = replacedApp;
	// Until the root view is replaced, a failed reboot leaves the old app
	// running. Unmounting it must still follow: its components stay in Vue's
	// HMR records until then, and a later root reload would reset the root
	// view to the replaced tree. Unmount only detaches the root element from
	// its NSVRoot, so the native views are left as they are either way.
	if (result || !previous || appOfRootView() === previous) return result;
	replacedApp = undefined;
	try {
		previous.unmount();
	} catch (error) {
		return { error };
	}
}
