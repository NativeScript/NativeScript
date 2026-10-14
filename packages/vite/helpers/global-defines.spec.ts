import { afterEach, describe, expect, it } from 'vitest';

import { buildDefineShimStatements, buildGuardedDefineSeedStatement, getGlobalDefines, getRuntimeDefineValues, getRuntimeSeedValues, getUserDefineEntries, isHmrProgressOverlayEnabled, setUserDefineEntries } from './global-defines.js';

describe('setUserDefineEntries / getUserDefineEntries', () => {
	afterEach(() => setUserDefineEntries(undefined));

	it('captures __FOO__ keys as [key, expression] pairs, JSON-encoding non-string values', () => {
		setUserDefineEntries({ __VUE_OPTIONS_API__: true, __APP_VERSION__: '"1.2.3"', 'process.env.FOO': '"bar"', 'global.isIOS': 'true', __not_a_define: '1' });
		expect(getUserDefineEntries()).toEqual([
			['__VUE_OPTIONS_API__', 'true'],
			['__APP_VERSION__', '"1.2.3"'],
		]);
	});

	it('is empty when no config has been captured', () => {
		setUserDefineEntries(undefined);
		expect(getUserDefineEntries()).toEqual([]);
	});
});

describe('isHmrProgressOverlayEnabled (NS_VITE_PROGRESS_OVERLAY)', () => {
	it('defaults to enabled when the env var is unset', () => {
		expect(isHmrProgressOverlayEnabled({} as any)).toBe(true);
	});

	it('treats an empty string as enabled (default)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '' } as any)).toBe(true);
	});

	it('treats whitespace as enabled (defensive default — typical user typo)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '   ' } as any)).toBe(true);
	});

	it("disables when explicitly set to '0', 'false', 'off', or 'no'", () => {
		for (const value of ['0', 'false', 'off', 'no']) {
			expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: value } as any)).toBe(false);
		}
	});

	it('disables case-insensitively (NS_VITE_PROGRESS_OVERLAY=FALSE works the same as =false)', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'FALSE' } as any)).toBe(false);
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'Off' } as any)).toBe(false);
	});

	it("treats truthy spellings ('1', 'true') as enabled", () => {
		// We intentionally don't try to enable from these — the default
		// IS enabled — but we also must not accidentally interpret them
		// as falsy. This pins the policy.
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '1' } as any)).toBe(true);
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: 'true' } as any)).toBe(true);
	});

	it('trims surrounding whitespace before classifying', () => {
		expect(isHmrProgressOverlayEnabled({ NS_VITE_PROGRESS_OVERLAY: '  0  ' } as any)).toBe(false);
	});
});

describe('getGlobalDefines — webpack compatibility', () => {
	it('maps __non_webpack_require__ to the runtime require (raw expression, not a string literal)', () => {
		// webpack's APIPlugin provides `__non_webpack_require__`; some NativeScript
		// plugins (e.g. @nativescript/firebase-core on Android) reference it unguarded,
		// so Vite must define it or those plugins ReferenceError at runtime.
		const defines = getGlobalDefines({ platform: 'android', targetMode: 'development', verbose: false, flavor: 'angular' });
		expect((defines as Record<string, unknown>).__non_webpack_require__).toBe('globalThis.require');
		// Must be a bare expression, not JSON.stringified (which would inject a string).
		expect((defines as Record<string, unknown>).__non_webpack_require__).not.toBe('"globalThis.require"');
	});
});

describe('windows platform defines', () => {
	it('sets __WINDOWS__ and keeps every other platform flag (including __APPLE__) false', () => {
		const values = getRuntimeDefineValues({ platform: 'windows', isDevMode: true, verbose: false });
		expect(values.__WINDOWS__).toBe(true);
		expect(values.__ANDROID__).toBe(false);
		expect(values.__IOS__).toBe(false);
		expect(values.__VISIONOS__).toBe(false);
		expect(values.__APPLE__).toBe(false);
	});

	it('keeps __WINDOWS__ false on the existing platforms', () => {
		for (const platform of ['android', 'ios', 'visionos']) {
			expect(getRuntimeDefineValues({ platform, isDevMode: true, verbose: false }).__WINDOWS__).toBe(false);
		}
	});

	it('mirrors webpack: __WINDOWS__ and global.isWindows in the Vite define map', () => {
		const defines = getGlobalDefines({ platform: 'windows', targetMode: 'development', verbose: false, flavor: 'typescript' }) as Record<string, unknown>;
		expect(defines.__WINDOWS__).toBe('true');
		expect(defines['global.isWindows']).toBe('true');
		expect(defines['global.isIOS']).toBe('false');
		expect(defines['global.isAndroid']).toBe('false');
		const ios = getGlobalDefines({ platform: 'ios', targetMode: 'development', verbose: false, flavor: 'typescript' }) as Record<string, unknown>;
		expect(ios.__WINDOWS__).toBe('false');
		expect(ios['global.isWindows']).toBe('false');
	});

	it('seeds the legacy isWindows runtime global', () => {
		const seed = getRuntimeSeedValues({ platform: 'windows', isDevMode: true, verbose: false, flavor: 'typescript' });
		expect(seed.isWindows).toBe(true);
		expect(seed.isIOS).toBe(false);
		expect(seed.isAndroid).toBe(false);
		expect(getRuntimeSeedValues({ platform: 'android', isDevMode: true, verbose: false, flavor: 'typescript' }).isWindows).toBe(false);
	});

	it('guarded seed plants __WINDOWS__ / isWindows only when no platform flag is set yet', () => {
		const stmt = buildGuardedDefineSeedStatement(getRuntimeDefineValues({ platform: 'windows', isDevMode: true, verbose: false }));
		const run = (g: Record<string, unknown>) => new Function('globalThis', stmt)(g);

		const fresh: Record<string, unknown> = {};
		run(fresh);
		expect(fresh).toMatchObject({ __WINDOWS__: true, __ANDROID__: false, __IOS__: false, __APPLE__: false, isWindows: true, isIOS: false, isAndroid: false });

		// A seed that already ran (bundle entry) must win.
		const seeded: Record<string, unknown> = { __WINDOWS__: true, isWindows: true };
		run(seeded);
		expect(seeded.__IOS__).toBeUndefined();
		expect(seeded.isIOS).toBeUndefined();
	});

	it('emits a per-module __WINDOWS__ shim', () => {
		const shims = buildDefineShimStatements(getRuntimeDefineValues({ platform: 'windows', isDevMode: true, verbose: false }));
		expect(shims).toContain('const __WINDOWS__ = globalThis.__WINDOWS__ !== undefined ? globalThis.__WINDOWS__ : true;');
		expect(shims).toContain('const __APPLE__ = globalThis.__APPLE__ !== undefined ? globalThis.__APPLE__ : false;');
	});
});
