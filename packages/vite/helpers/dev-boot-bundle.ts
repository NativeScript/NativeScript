import { deviceUrlForGraphUrl } from '../hmr/server/vite-url.js';
import type { DevBootLoaderOptions } from '../runtime/dev-boot-loader.js';

// Under HMR, everything `bundle.mjs` boots with is this one module, served by
// the dev server: Vite's import analysis then writes every URL it imports,
// exactly as it does for the app graph, so each file has one device URL.
export const DEV_BOOT_VIRTUAL_ID = 'virtual:ns-dev-boot';
export const DEV_BOOT_RESOLVED = '\0' + DEV_BOOT_VIRTUAL_ID;
/** The root-relative URL the device requests the dev boot module under. */
export const DEV_BOOT_DEVICE_PATH = deviceUrlForGraphUrl(DEV_BOOT_RESOLVED);

/**
 * Prepended to every emitted chunk, and to the dev `bundle.mjs`, so the timer
 * globals exist at module-instantiation time, before
 * `@nativescript/core/globals` installs them: ESM evaluates dependency chunks
 * before the importing module's body, and a vendor package (or the dev boot
 * loader) may use a timer first. A no-op once the runtime exposes the
 * unprefixed names itself.
 */
export const BOOT_TIMER_PRELUDE = [`typeof globalThis !== 'undefined' && typeof globalThis.setTimeout === 'undefined' && typeof globalThis.__ns__setTimeout === 'function' && (`, `  globalThis.setTimeout = globalThis.__ns__setTimeout,`, `  globalThis.setInterval = globalThis.__ns__setInterval,`, `  globalThis.clearTimeout = globalThis.__ns__clearTimeout,`, `  globalThis.clearInterval = globalThis.__ns__clearInterval`, `);`].join('\n');

/** What the dev `bundle.mjs` passes `bootFromDevServer` for the dev server at `origin`. */
export function devBootLoaderOptions(origin: string, token: string, verbose: boolean): DevBootLoaderOptions {
	return { origin, bootUrl: origin + DEV_BOOT_DEVICE_PATH, token, verbose };
}

/**
 * The dev `bundle.mjs` as the dev server writes it: the compiled dev boot
 * loader (`runtime/dev-boot-loader.js`, which imports nothing) and one call.
 * Its source map stays behind: the comment would name a file the app doesn't
 * ship.
 */
export function composeDevBootBundle(loaderSource: string, options: DevBootLoaderOptions): string {
	const loader = loaderSource.replace(/\/\/# sourceMappingURL=\S*\s*$/, '').trimEnd();
	return `${BOOT_TIMER_PRELUDE}\n${loader}\nawait bootFromDevServer(${JSON.stringify(options)});\n`;
}
