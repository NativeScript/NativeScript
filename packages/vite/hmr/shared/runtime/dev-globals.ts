/**
 * The one global `@nativescript/vite` keeps on a device in dev, readable by
 * code generated as strings (worker constructors) that can't import this
 * module.
 *
 * Code inside one module graph shares state through ESM imports instead.
 * This module must stay stateless and dependency-free: every copy resolves
 * the same object through `Symbol.for`.
 */
import type { HmrOverlayApi } from './dev-overlay.js';

export const NS_DEV_SYMBOL_KEY = 'nativescript.dev';

export interface NativeScriptDevGlobals {
	/** Set once the app has launched. The dev client bootstrap waits for it before starting the HMR client. */
	bootComplete?: boolean;
	/** The dev overlay installed at boot and driven by the HMR client. */
	overlay?: HmrOverlayApi;
	/** Origin of the dev server the session booted from. Generated worker code resolves worker URLs against it. */
	httpOrigin?: string;
}

/** The dev globals object, created on first access. */
export function nsDev(): NativeScriptDevGlobals {
	const g = globalThis as any;
	const key = Symbol.for(NS_DEV_SYMBOL_KEY);
	return g[key] || (g[key] = {});
}

/** {@link nsDev} as a JS expression, for code generated as a string that can't import this module. */
export const NS_DEV_EXPR = `(globalThis[Symbol.for(${JSON.stringify(NS_DEV_SYMBOL_KEY)})] || (globalThis[Symbol.for(${JSON.stringify(NS_DEV_SYMBOL_KEY)})] = {}))`;
