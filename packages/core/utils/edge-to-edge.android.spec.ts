import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { Color } from '../color';
import { setDarkModeHandler, setNavigationBarColor, setStatusBarColor, refreshEdgeToEdge } from './native-helper-for-android';

describe('Android edge-to-edge setters', () => {
	let globals: Record<string, any>;
	let enableEdgeToEdge: ReturnType<typeof vi.fn>;

	class HandleDarkMode {
		constructor(readonly implementation: { onHandle(bar: number, resources: any): boolean }) {}
	}

	beforeEach(() => {
		globals = { android: (global as any).android, org: (global as any).org, java: (global as any).java };
		enableEdgeToEdge = vi.fn();
		(global as any).android = { ...globals.android, view: { ...globals.android?.view, Window: class Window {} } };
		(global as any).org = { nativescript: { widgets: { Utils: { enableEdgeToEdge, HandleDarkMode } } } };
		(global as any).java = { lang: { Integer: { valueOf: (value: number) => value } } };
	});

	afterEach(() => {
		Object.assign(global, globals);
	});

	/** The dark mode handler last passed to the native enableEdgeToEdge, as a JS function. */
	function lastHandler(): (bar: number) => boolean {
		const args = enableEdgeToEdge.mock.calls.at(-1);
		const handler = args.at(-1);
		return handler instanceof HandleDarkMode ? (bar) => handler.implementation.onHandle(bar, null) : null;
	}

	function lastColors(): number[] {
		return enableEdgeToEdge.mock.calls.at(-1).slice(1, 5);
	}

	it('uses the latest dark mode handler', () => {
		const activity = {} as any;

		setDarkModeHandler({ activity, handler: () => false });
		setDarkModeHandler({ activity, handler: () => true });
		expect(lastHandler()(0)).toBe(true);

		refreshEdgeToEdge(activity);
		expect(lastHandler()(0)).toBe(true);
	});

	it('keeps the settings of the activity it was given', () => {
		const activity = {} as any;

		setStatusBarColor({ activity, lightColor: new Color('#ff0000') });
		setNavigationBarColor({ activity, darkColor: new Color('#0000ff') });
		refreshEdgeToEdge(activity);

		const [statusBarLight, , , navigationBarDark] = lastColors();
		expect(statusBarLight).toBe(new Color('#ff0000').android);
		expect(navigationBarDark).toBe(new Color('#0000ff').android);
	});

	it('replaces colors set before and keeps the ones not given', () => {
		const activity = {} as any;

		setStatusBarColor({ activity, lightColor: new Color('#ff0000'), darkColor: new Color('#00ff00') });
		setStatusBarColor({ activity, lightColor: new Color('#0000ff') });

		const [statusBarLight, statusBarDark] = lastColors();
		expect(statusBarLight).toBe(new Color('#0000ff').android);
		expect(statusBarDark).toBe(new Color('#00ff00').android);
	});
});
