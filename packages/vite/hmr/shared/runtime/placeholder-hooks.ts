/**
 * Hooks between the boot placeholder (`root-placeholder.ts`) and code that
 * swaps the app root without depending on it. `runtime/core-aliases-early.ts`
 * imports this module and is bundled into release builds too, so it must
 * stay dependency-free: importing it must not pull placeholder code into a
 * release bundle.
 */

type RestorePlaceholder = (reason?: string) => void;

let restore: RestorePlaceholder | null = null;
let resetRootPatched = false;

/** Installed by the boot placeholder: finalizes it once the real app root is committed. */
export function setRestorePlaceholder(fn: RestorePlaceholder): void {
	restore = fn;
}

/** Ask the boot placeholder to finalize; a no-op when none is installed. */
export function restorePlaceholder(reason?: string): void {
	restore?.(reason);
}

/** Whether `Application.resetRootView` already calls {@link restorePlaceholder}. */
export function isResetRootPatched(): boolean {
	return resetRootPatched;
}

export function markResetRootPatched(): void {
	resetRootPatched = true;
}
