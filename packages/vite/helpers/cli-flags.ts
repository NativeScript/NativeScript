import minimist from 'minimist';
import type { Platform } from './platform-types.js';

let cliFlags: Record<string, string | boolean> | null = null;

export function getCliFlags() {
	if (!cliFlags) {
		const cliArgs = minimist(process.argv.slice(2), { '--': true });
		cliFlags = (cliArgs['--'] || []).reduce((obj, flag) => {
			// remove env prefix
			const [rawKey, ...rest] = flag.replace(/^--env\./, '').split('=');
			obj[rawKey] = rest.length === 0 ? true : rest.join('=');
			return obj;
		}, {});
	}
	return cliFlags;
}

// Canonical platform priority, used everywhere a build platform is derived
// from a flags-like object. visionOS is checked BEFORE iOS on purpose:
// visionOS is an Apple subset and a single run can carry BOTH the `ios` and
// `visionos` flags, so iOS must lose the tie or visionOS builds mis-resolve
// as iOS (which surfaced as `__VISIONOS__ === false` in served core modules).
function pickPlatform(src: Record<string, unknown> | null | undefined): Platform | undefined {
	if (!src) return undefined;
	if (src.android) return 'android';
	if (src.visionos) return 'visionos';
	if (src.ios) return 'ios';
	return undefined;
}

/**
 * Resolve the active build platform.
 *
 * Prefers `NATIVESCRIPT_BUNDLER_ENV` (which the CLI reliably injects into the
 * dev-server process) over argv `--` flags: the post-`--` env flags parsed by
 * `getCliFlags()` aren't always present when the Vite `serve` process resolves
 * them, which previously left visionOS resolving as non-visionOS.
 *
 * @param flags optional pre-fetched flags object; defaults to `getCliFlags()`.
 */
export function resolvePlatform(flags: Record<string, unknown> = getCliFlags()): Platform | undefined {
	let envData: Record<string, unknown> | null = null;
	try {
		envData = JSON.parse(process.env.NATIVESCRIPT_BUNDLER_ENV || '{}');
	} catch {}
	return pickPlatform(envData) ?? pickPlatform(flags);
}
