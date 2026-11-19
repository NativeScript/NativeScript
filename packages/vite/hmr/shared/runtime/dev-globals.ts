/**
 * The one global `@nativescript/vite` keeps on a device in dev: state shared
 * between `bundle.mjs` and the modules the dev server serves, which are
 * separate module instances and can't share it through an import.
 *
 * Code inside one of those worlds shares state through ESM imports instead.
 * This module is imported by both, so it must stay stateless and
 * dependency-free: every copy resolves the same object through `Symbol.for`.
 */
import type { HmrOverlayApi } from './dev-overlay.js';

export const NS_DEV_SYMBOL_KEY = 'nativescript.dev';

export interface NativeScriptDevGlobals {
	/** Set by `bundle.mjs` once the first app root is up. The `/__ns_dev__/client` bootstrap waits for it before starting the HMR client. */
	bootComplete?: boolean;
	/** The global `app.css` text baked into `bundle.mjs`, applied by the served entry runtime. */
	appCss?: string;
	/** Rework AST of the same stylesheet, so the served core applies it without re-parsing. */
	appCssAst?: unknown;
	/** Every `Application` instance the boot placeholder's run wrapper saw. The served entry runtime restyles their root views. */
	knownApplications?: unknown[];
	/** The dev overlay installed by `bundle.mjs` and driven by the served HMR client. */
	overlay?: HmrOverlayApi;
	/** Origin of the dev server the session booted from. Generated worker code resolves worker URLs against it. */
	httpOrigin?: string;
	/** Served `@nativescript/core` modules by specifier, registered by each one's footer. Read by the `bundle.mjs` require shim and the deps bundle. */
	coreModules?: Record<string, unknown>;
	/** Turns an ESM namespace into a plain object for CommonJS callers. Installed by `bundle.mjs`; used by the core footer and the deps bundle. */
	cjsShape?: (value: unknown) => unknown;
}

/** The dev globals object, created on first access. */
export function nsDev(): NativeScriptDevGlobals {
	const g = globalThis as any;
	const key = Symbol.for(NS_DEV_SYMBOL_KEY);
	return g[key] || (g[key] = {});
}

/** {@link nsDev} as a JS expression, for code generated as a string that can't import this module. */
export const NS_DEV_EXPR = `(globalThis[Symbol.for(${JSON.stringify(NS_DEV_SYMBOL_KEY)})] || (globalThis[Symbol.for(${JSON.stringify(NS_DEV_SYMBOL_KEY)})] = {}))`;
