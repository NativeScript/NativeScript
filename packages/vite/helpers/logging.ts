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
//  - Eval usage attributed to the virtual "@nativescript/vendor" module
//  - License/annotation position warnings for the vendor bundle
// Extend this list cautiously; prefer documenting each suppression reason.
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

function shouldSuppressViteWarning(msg: string): boolean {
	// Missing sourcemap original sources
	if (msg.startsWith('Sourcemap for ') && msg.includes('missing source files')) {
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
	return false;
}
