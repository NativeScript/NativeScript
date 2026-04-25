import { createLogger, type Logger } from 'vite';

const GLOBAL_VERBOSE_FLAG = '__NS_ENV_VERBOSE__';
const ENV_VERBOSE_KEYS = ['NS_VITE_VERBOSE', 'NS_ENV_VERBOSE', 'NS_VERBOSE', 'VERBOSE', 'VITE_DEBUG_LOGS', 'DEBUG'];

type Primitive = string | number | boolean | undefined | null;

type ResolveOptions = {
	env?: Record<string, Primitive>;
	cliFlags?: Record<string, Primitive> | null;
	defaultValue?: boolean;
	cache?: boolean;
	useGlobalFlag?: boolean;
};

let cachedVerbose: boolean | undefined;

function coerceBoolean(value: Primitive): boolean | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (!normalized) return undefined;
		if (['1', 'true', 'yes', 'y', 'on', 'debug'].includes(normalized)) {
			return true;
		}
		if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
			return false;
		}
		return true;
	}
	return undefined;
}

export function resolveVerboseFlag(options: ResolveOptions = {}): boolean {
	if (options.cache !== false && typeof cachedVerbose === 'boolean') {
		return cachedVerbose;
	}

	const { env = typeof process !== 'undefined' ? process.env : undefined, cliFlags } = options;
	let resolved: boolean | undefined;

	if (cliFlags && typeof cliFlags === 'object') {
		const cliVerbose = coerceBoolean(cliFlags.verbose ?? cliFlags.VERBOSE);
		if (typeof cliVerbose === 'boolean') {
			resolved = cliVerbose;
		}
	}

	if (resolved === undefined && options.useGlobalFlag !== false) {
		try {
			const globalVerbose = (globalThis as any)?.[GLOBAL_VERBOSE_FLAG];
			const coerced = coerceBoolean(globalVerbose);
			if (typeof coerced === 'boolean') {
				resolved = coerced;
			}
		} catch {}
	}

	if (resolved === undefined && env) {
		for (const key of ENV_VERBOSE_KEYS) {
			if (Object.prototype.hasOwnProperty.call(env, key)) {
				const envVerbose = coerceBoolean(env[key]);
				if (typeof envVerbose === 'boolean') {
					resolved = envVerbose;
					break;
				}
			}
		}
	}

	if (resolved === undefined) {
		resolved = options.defaultValue ?? false;
	}

	if (options.cache !== false) {
		cachedVerbose = resolved;
	}

	return resolved;
}

export function clearVerboseCache(): void {
	cachedVerbose = undefined;
}

// Vite/Rollup warning filter helper
// Centralizes suppression of noisy build warnings that are either benign or
// expected given NativeScript's virtual vendor bundling strategy.
// Currently filters:
//  - Sourcemap missing source files (common in published packages)
//  - Sourcemap source paths that walk outside the published package (the map
//    was generated in a monorepo and still references workspace paths the
//    consumer's node_modules doesn't have)
//  - Sidecar `.js.map` files listed in a `//# sourceMappingURL=` comment that
//    were not published alongside the `.js` file
//  - Eval usage attributed to the virtual "@nativescript/vendor" module
//  - License/annotation position warnings for the vendor bundle
//  - Analog Angular optimizer/router plugins that never emit sourcemaps
// Extend this list cautiously; prefer documenting each suppression reason.
//
// All matching uses `.includes()` (never `.startsWith()`) because Vite wraps
// some warnings in picocolors ANSI escape sequences before handing them to
// the logger, which would defeat `startsWith`-style probes on TTY output.
export function createFilteredViteLogger(): Logger {
	const baseLogger = createLogger(undefined, { allowClearScreen: true });
	return {
		...baseLogger,
		warn(message: any, options?: any) {
			const msg = String(message || '');
			if (shouldSuppressViteWarning(msg)) return;
			return baseLogger.warn(message, options);
		},
		warnOnce(message: any) {
			const msg = String(message || '');
			if (shouldSuppressViteWarning(msg)) return;
			return baseLogger.warnOnce(message);
		},
	};
}

// Exported for unit tests. Keep this function pure so the test suite can
// exercise every suppression pattern without instantiating a real logger.
export function shouldSuppressViteWarning(msg: string): boolean {
	// Missing sourcemap original sources (kept as-is — published packages
	// frequently drop a few `sources[n]` entries during transpile).
	if (msg.includes('Sourcemap for ') && msg.includes('missing source files')) {
		return true;
	}
	// Cross-package sourcemap path. Emitted for every `@nativescript/core`
	// file at dev-server startup when the consumer has the published
	// package installed: the shipped `.js.map` still references the
	// original monorepo `packages/core/**` path, which does not exist in
	// the consumer's node_modules. There is nothing we (or the app
	// author) can do about this short of republishing core with relative
	// sources — silently dropping it is correct.
	if (msg.includes('Sourcemap for ') && msg.includes('points to a source file outside its package')) {
		return true;
	}
	// Missing sidecar .js.map file. A couple of community packages
	// (e.g. `@nativescript-community/observable`) ship the `.js` with a
	// `//# sourceMappingURL=foo.js.map` footer but never include the
	// actual map. Vite's sourcemap loader then retries the ENOENT on
	// every request, flooding the terminal. We cannot resolve the
	// missing file, so suppressing the warn-level diagnostic is the
	// least invasive fix.
	if (msg.includes('Failed to load source map for')) {
		return true;
	}
	// Vendor eval usage (third-party libs aggregated); benign
	if (msg.includes('Use of eval') && (msg.includes('@nativescript/vendor') || msg.includes('"@nativescript/vendor"'))) {
		return true;
	}
	// Annotation/license position warning for vendor bundle
	if ((msg.includes('contains an annotation that Rollup cannot interpret') || msg.includes('position of the comment')) && (msg.includes('@nativescript/vendor') || msg.includes('"@nativescript/vendor"'))) {
		return true;
	}
	// Analog Angular optimizer/router plugins do not emit sourcemaps; Vite floods logs with warnings.
	if (msg.includes('Sourcemap is likely to be incorrect') && (msg.includes('analogjs-router-optimization') || msg.includes('@analogjs/vite-plugin-angular-optimizer'))) {
		return true;
	}
	return false;
}
