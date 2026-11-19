/**
 * The global `app.css` applier `entry-runtime.ts` installs for the served
 * `@nativescript/core`, read by the HMR client's CSS handler. Both import
 * this module relatively, so the dev server resolves it to one URL and the
 * device evaluates one instance.
 */

export type AppCssApplier = (cssText: string, refreshRoot?: boolean) => void;

let applier: AppCssApplier | null = null;

export function setAppCssApplier(fn: AppCssApplier): void {
	applier = fn;
}

export function getAppCssApplier(): AppCssApplier | null {
	return applier;
}
