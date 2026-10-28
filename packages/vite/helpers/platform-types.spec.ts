import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { shouldExcludePlatformFile } from './bundler-context.js';
import { getThemeCoreGenericAliases } from './theme-core-plugins.js';
import { PLATFORMS, PLATFORM_SUFFIX_ALT, isApplePlatform, isOtherPlatformTagged, isPlatform, platformCssExt, platformExtensions, platformSuffixOf, platformSuffixes } from './platform-types.js';

describe('platform-types', () => {
	it('lists every platform, and the suffix alternation covers each one', () => {
		expect([...PLATFORMS].sort()).toEqual(['android', 'ios', 'visionos', 'windows']);
		expect(PLATFORM_SUFFIX_ALT.split('|').sort()).toEqual([...PLATFORMS].sort());
	});

	it('isPlatform / isApplePlatform', () => {
		expect(isPlatform('windows')).toBe(true);
		expect(isPlatform('web')).toBe(false);
		expect(isPlatform(undefined)).toBe(false);
		expect(isApplePlatform('ios')).toBe(true);
		expect(isApplePlatform('visionos')).toBe(true);
		expect(isApplePlatform('android')).toBe(false);
		expect(isApplePlatform('windows')).toBe(false);
		expect(isApplePlatform(undefined)).toBe(false);
	});

	it('platformSuffixes: Apple platforms share files, android/windows only load their own', () => {
		expect(platformSuffixes('android')).toEqual(['android']);
		expect(platformSuffixes('ios')).toEqual(['ios', 'visionos']);
		expect(platformSuffixes('visionos')).toEqual(['visionos', 'ios']);
		expect(platformSuffixes('windows')).toEqual(['windows']);
	});

	it('platformSuffixOf reads only a trailing suffix', () => {
		expect(platformSuffixOf('ui/frame/index.windows')).toBe('windows');
		expect(platformSuffixOf('ui/frame/index.ios')).toBe('ios');
		expect(platformSuffixOf('ui/frame/index')).toBeNull();
		expect(platformSuffixOf('ui/windows/index')).toBeNull();
	});

	it('isOtherPlatformTagged', () => {
		expect(isOtherPlatformTagged('app/foo.ios.ts', 'android')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.visionos.ts', 'android')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.windows.ts', 'android')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.android.ts', 'android')).toBe(false);

		expect(isOtherPlatformTagged('app/foo.android.ts', 'ios')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.windows.ts', 'ios')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.visionos.ts', 'ios')).toBe(false);
		expect(isOtherPlatformTagged('app/foo.ios.ts', 'visionos')).toBe(false);

		expect(isOtherPlatformTagged('app/foo.ios.ts', 'windows')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.android.ts', 'windows')).toBe(true);
		expect(isOtherPlatformTagged('app/foo.windows.ts', 'windows')).toBe(false);

		// untagged files, and a platform name that is not a `.<tag>.` segment
		expect(isOtherPlatformTagged('app/foo.ts', 'windows')).toBe(false);
		expect(isOtherPlatformTagged('app/windows/ios-helper.ts', 'android')).toBe(false);
		expect(isOtherPlatformTagged('app/foo.ios', 'android')).toBe(false);
	});

	it('platformExtensions puts platform variants ahead of each base', () => {
		expect(platformExtensions('android', ['.tsx', '.jsx', '.ts', '.js'])).toEqual(['.android.tsx', '.tsx', '.android.jsx', '.jsx', '.android.ts', '.ts', '.android.js', '.js']);
		expect(platformExtensions('ios', ['.ts', '.js'])).toEqual(['.ios.ts', '.visionos.ts', '.ts', '.ios.js', '.visionos.js', '.js']);
		expect(platformExtensions('visionos', ['.ts'])).toEqual(['.visionos.ts', '.ios.ts', '.ts']);
		expect(platformExtensions('windows', ['.ts', '.js'])).toEqual(['.windows.ts', '.ts', '.windows.js', '.js']);
	});

	it('platformCssExt', () => {
		expect(platformCssExt('android')).toBe('.android.css');
		expect(platformCssExt('ios')).toBe('.ios.css');
		expect(platformCssExt('visionos')).toBe('.ios.css');
		expect(platformCssExt('windows')).toBe('.windows.css');
		expect(platformCssExt(undefined)).toBe('.ios.css');
	});
});

describe('cli-flags platform resolution (windows)', () => {
	const originalArgv = process.argv;
	const originalEnv = process.env.NATIVESCRIPT_BUNDLER_ENV;

	afterEach(() => {
		process.argv = originalArgv;
		if (originalEnv === undefined) delete process.env.NATIVESCRIPT_BUNDLER_ENV;
		else process.env.NATIVESCRIPT_BUNDLER_ENV = originalEnv;
		vi.resetModules();
	});

	it('resolves windows from the CLI env flags', async () => {
		delete process.env.NATIVESCRIPT_BUNDLER_ENV;
		process.argv = ['node', 'vite', '--', '--env.windows', '--env.hmr'];
		vi.resetModules();
		const { getCliFlags, resolvePlatform } = await import('./cli-flags.js');
		expect(getCliFlags().windows).toBe(true);
		expect(resolvePlatform()).toBe('windows');
	});

	it('prefers NATIVESCRIPT_BUNDLER_ENV over argv flags', async () => {
		process.env.NATIVESCRIPT_BUNDLER_ENV = JSON.stringify({ windows: true });
		process.argv = ['node', 'vite', '--', '--env.ios'];
		vi.resetModules();
		const { resolvePlatform } = await import('./cli-flags.js');
		expect(resolvePlatform()).toBe('windows');
	});
});

describe('platform helper consumers', () => {
	it('shouldExcludePlatformFile drops other-platform files, windows included', () => {
		expect(shouldExcludePlatformFile('/app/foo.windows.ts', 'android')).toBe(true);
		expect(shouldExcludePlatformFile('/app/foo.windows.ts', 'ios')).toBe(true);
		expect(shouldExcludePlatformFile('/app/foo.windows.ts', 'windows')).toBe(false);
		expect(shouldExcludePlatformFile('/app/foo.ios.ts', 'windows')).toBe(true);
		expect(shouldExcludePlatformFile('/app/foo.android.ts', 'windows')).toBe(true);
		expect(shouldExcludePlatformFile('/app/foo.visionos.ts', 'ios')).toBe(false);
		expect(shouldExcludePlatformFile('/app/foo.ts', 'windows')).toBe(false);
		expect(shouldExcludePlatformFile('/app/foo.ios.ts', undefined)).toBe(false);
	});

	describe('getThemeCoreGenericAliases', () => {
		const tmpRoot = mkdtempSync(path.join(tmpdir(), 'ns-theme-core-'));
		const themeRoot = path.join(tmpRoot, 'nativescript-theme-core');
		afterAll(() => rmSync(tmpRoot, { recursive: true, force: true }));
		mkdirSync(path.join(themeRoot, 'css'), { recursive: true });
		for (const f of ['core.light.android.css', 'core.light.ios.css', 'blue.android.css', 'blue.ios.css']) {
			writeFileSync(path.join(themeRoot, 'css', f), '');
		}

		it('aliases generic css to the platform variant', () => {
			const android = getThemeCoreGenericAliases(themeRoot, 'android');
			expect(android.map((a) => path.basename(a.replacement)).sort()).toEqual(['blue.android.css', 'core.light.android.css']);
			const ios = getThemeCoreGenericAliases(themeRoot, 'ios');
			expect(ios.map((a) => path.basename(a.replacement)).sort()).toEqual(['blue.ios.css', 'core.light.ios.css']);
		});

		it('aliases to an empty stylesheet on windows when theme-core ships no .windows.css', () => {
			const windows = getThemeCoreGenericAliases(themeRoot, 'windows');
			expect(windows).toHaveLength(2);
			for (const a of windows) {
				expect(path.basename(a.replacement)).toBe('empty-theme.css');
				expect(existsSync(a.replacement)).toBe(true);
			}
			expect(windows.some((a) => a.find.test('nativescript-theme-core/css/core.light.css'))).toBe(true);
		});

		it('prefers a real .windows.css variant when one exists', () => {
			writeFileSync(path.join(themeRoot, 'css', 'blue.windows.css'), '');
			const blue = getThemeCoreGenericAliases(themeRoot, 'windows').find((a) => a.find.test('nativescript-theme-core/css/blue.css'));
			expect(path.basename(blue.replacement)).toBe('blue.windows.css');
		});
	});
});
