import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
	const builderCalls: { path: string; settings: string }[] = [];
	(globalThis as any).__builderCalls = builderCalls;
	// Families listed here build fine with every variation setting; entries in
	// `__rejectWght` throw when the settings string mentions the wght axis,
	// modelling Typeface.Builder's failure on fonts that lack it.
	(globalThis as any).__rejectWght = new Set<string>();
	(globalThis as any).android = {
		graphics: {
			Typeface: {
				Builder: class {
					settings: string;
					constructor(public path: string) {}
					setFontVariationSettings(s: string) {
						this.settings = s;
					}
					build() {
						builderCalls.push({ path: this.path, settings: this.settings });
						if (this.settings?.includes('wght') && (globalThis as any).__rejectWght.has(this.path)) {
							throw new Error(`Font does not support the 'wght' axis: ${this.path}`);
						}
						return { built: this.settings, path: this.path };
					}
				},
				SANS_SERIF: 'sans-serif-typeface',
				SERIF: 'serif-typeface',
				MONOSPACE: 'monospace-typeface',
				BOLD: 1,
				ITALIC: 2,
				create: (...args: any[]) => ({ created: args }),
			},
		},
	};
});

vi.mock('../../utils/constants', () => ({ SDK_VERSION: 30 }));
vi.mock('../../application/helpers-common', () => ({
	getNativeApp: () => ({ getApplicationContext: () => ({ getAssets: () => ({}) }) }),
}));
vi.mock('../../file-system', () => ({
	path: { join: (...parts: string[]) => parts.join('/').replace(/\/+/g, '/') },
	knownFolders: { currentApp: () => ({ path: '/app' }) },
	File: { exists: () => true },
}));

import { Font } from './font.android';

function builderSettings(): string[] {
	return (globalThis as any).__builderCalls.map((c) => c.settings);
}

describe('loadFontFromFile wght axis (API 26+)', () => {
	beforeEach(() => {
		(globalThis as any).__builderCalls.length = 0;
		(globalThis as any).__rejectWght.clear();
	});

	it('maps fontWeight onto the wght variation axis', () => {
		const font = new Font('WghtSpecA', undefined, undefined, '700');
		font.getAndroidTypeface();
		expect(builderSettings()).toEqual(["'wght' 700"]);
	});

	it('keeps an explicit wght axis instead of deriving one from fontWeight', () => {
		const font = new Font('WghtSpecB', undefined, undefined, '700', 1, [{ axis: 'wght', value: 500 }]);
		font.getAndroidTypeface();
		expect(builderSettings()).toEqual(["'wght' 500"]);
	});

	it('appends wght after explicit variation settings', () => {
		const font = new Font('WghtSpecC', undefined, undefined, '300', 1, [{ axis: 'wdth', value: 75 }]);
		font.getAndroidTypeface();
		expect(builderSettings()).toEqual(["'wdth' 75, 'wght' 300"]);
	});

	it('falls back to the explicit settings when the font lacks the wght axis', () => {
		(globalThis as any).__rejectWght.add('/app/fonts/WghtSpecD.ttf');
		const font = new Font('WghtSpecD', undefined, undefined, '400');
		expect(() => font.getAndroidTypeface()).not.toThrow();
		expect(builderSettings()).toEqual(["'wght' 400", '']);
	});

	it('uses the default typeface when an explicit wght axis fails', () => {
		(globalThis as any).__rejectWght.add('/app/fonts/WghtSpecE.ttf');
		const font = new Font('WghtSpecE', undefined, undefined, '400', 1, [{ axis: 'wght', value: 500 }]);
		// The build error propagates to loadFontFromFile's outer catch, so the
		// explicit request is NOT retried — the font falls back to the default.
		expect(() => font.getAndroidTypeface()).not.toThrow();
		expect(builderSettings()).toEqual(["'wght' 500"]);
	});

	it('keys the typeface cache by fontWeight', () => {
		new Font('WghtSpecF', undefined, undefined, '400').getAndroidTypeface();
		new Font('WghtSpecF', undefined, undefined, '700').getAndroidTypeface();
		expect(builderSettings()).toEqual(["'wght' 400", "'wght' 700"]);
	});
});
