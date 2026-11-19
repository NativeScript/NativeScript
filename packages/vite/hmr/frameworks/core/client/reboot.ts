import { Application, Frame } from '@nativescript/core';

/** What {@link whenHmrRebootSettled} resolves to: `{ error }` when the new root view could not be mounted. */
export type HmrRebootResult = void | { error: unknown };

type RunEntry = Parameters<typeof Application.run>[0];

interface Redirect {
	restore(): void;
}

let redirect: Redirect | null = null;
let outcome: { ran: boolean; error?: unknown; previousRoot?: unknown } = { ran: false };
let rebootPending = false;
let rebootedPageModule: string | undefined;

function closeModals(): void {
	const root = Application.getRootView() as any;
	root?._closeAllModalViewsInternal?.();
}

function topmostPageModule(): string | undefined {
	try {
		const moduleName = Frame.topmost()?.currentEntry?.moduleName;
		return typeof moduleName === 'string' && moduleName ? moduleName : undefined;
	} catch {
		return undefined;
	}
}

// Installed at dispose time: the boot placeholder restores the original
// `run` once boot completes, so a patch made at module load would be undone.
// The original `run` must never be called after launch: iOS presents the new
// root as a modal and Android throws "Application is already started".
function armRedirect(): void {
	const app = Application as any;
	const hadOwnRun = Object.prototype.hasOwnProperty.call(app, 'run');
	const previousRun = app.run;
	const restore = () => {
		if (redirect !== armed) return;
		redirect = null;
		if (hadOwnRun) app.run = previousRun;
		else delete app.run;
	};
	const armed: Redirect = { restore };
	redirect = armed;
	app.run = function hmrRebootRun(entry?: RunEntry): void {
		restore();
		outcome = { ran: true, previousRoot: Application.getRootView() };
		if (!entry) {
			outcome.error = new Error('Application.run() was called without an entry, so the root view was not replaced.');
			return;
		}
		try {
			Application.resetRootView(entry);
		} catch (error) {
			outcome.error = error;
		}
	};
}

/**
 * Tears the running app down for a soft reboot. The dev server calls it from
 * the app entry's `import.meta.hot.dispose`: it closes open modals and makes
 * the re-evaluated entry's `Application.run(entry)` replace the root view
 * through `Application.resetRootView(entry)`.
 *
 * Idempotent: a retry after a failed reboot calls it again, possibly on an
 * app whose new root never mounted.
 */
export function prepareHmrReboot(): void {
	closeModals();
	// A retry runs on an app that may have no frame yet; the page to restore
	// is still the one of the last good app.
	const page = topmostPageModule();
	if (page || !rebootPending) rebootedPageModule = page;
	rebootPending = true;
	outcome = { ran: false };
	if (!redirect) armRedirect();
}

/**
 * Settles once the re-evaluated entry's root view is loaded. Resolves
 * `{ error }` when `resetRootView` threw or left the root unchanged, and
 * right away when the entry never called `Application.run`. Never rejects.
 */
export function whenHmrRebootSettled(): Promise<HmrRebootResult> {
	try {
		const { ran, error, previousRoot } = outcome;
		outcome = { ran: false };
		if (redirect || !ran) {
			redirect?.restore();
			rebootPending = false;
			return Promise.resolve();
		}
		if (error !== undefined) return Promise.resolve({ error });
		const root = Application.getRootView();
		if (!root || root === previousRoot) return Promise.resolve({ error: new Error('Application.resetRootView() did not replace the root view.') });
		rebootPending = false;
		if (root.isLoaded) return Promise.resolve();
		return new Promise((resolve) => {
			const onLoaded = () => {
				root.off('loaded', onLoaded);
				resolve();
			};
			root.on('loaded', onLoaded);
		});
	} catch (error) {
		return Promise.resolve({ error });
	}
}

/**
 * Opt-in: navigates the topmost frame back to the page that was current when
 * the soft reboot started, without its navigation context or back stack. A
 * reboot otherwise lands on the root module's default page. Only pages
 * navigated to by `moduleName` can be restored. Returns whether it navigated.
 *
 * Call it from the app entry:
 * ```ts
 * import { restorePageAfterHmrReboot } from '@nativescript/vite/hmr/frameworks/core/client/reboot.js';
 * import.meta.hot?.on('nativescript:afterReboot', (event) => {
 *   if (!event.error) restorePageAfterHmrReboot();
 * });
 * ```
 */
export function restorePageAfterHmrReboot(): boolean {
	const moduleName = rebootedPageModule;
	rebootedPageModule = undefined;
	if (!moduleName) return false;
	const frame = Frame.topmost();
	if (!frame || frame.currentEntry?.moduleName === moduleName) return false;
	frame.navigate({ moduleName, clearHistory: true, animated: false });
	return true;
}
