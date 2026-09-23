import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getWindow } from './native-helper.ios';
import { getActiveWindow, getiOSWindow, setActiveWindow, setiOSWindow } from '../application/helpers-common';

/** A UIWindow stands in for identity only - `getWindow` never reads anything off it. */
function createUIWindow(tag: string): any {
	return { tag };
}

function createNativeWindow(uiWindow: any, state: 'attached' | 'detached' | 'closed' = 'attached'): any {
	return {
		state,
		ios: {
			scene: undefined,
			uiWindow,
		},
	};
}

describe('getWindow', () => {
	let previousActiveWindow: any;
	let previousiOSWindow: any;
	let previousApplication: any;

	beforeEach(() => {
		previousActiveWindow = getActiveWindow();
		previousiOSWindow = getiOSWindow();
		previousApplication = global.UIApplication;

		setActiveWindow(undefined);
		setiOSWindow(undefined);
	});

	afterEach(() => {
		setActiveWindow(previousActiveWindow);
		setiOSWindow(previousiOSWindow);
		global.UIApplication = previousApplication;
	});

	it('returns the active window UIWindow ahead of every other source', () => {
		const activeUIWindow = createUIWindow('active');
		setActiveWindow(createNativeWindow(activeUIWindow));
		setiOSWindow(createUIWindow('recorded'));
		global.UIApplication = { sharedApplication: { keyWindow: createUIWindow('key') } } as any;

		expect(getWindow()).toBe(activeUIWindow);
	});

	it('skips a detached active window, whose UIWindow no longer has a surface', () => {
		const recorded = createUIWindow('recorded');
		setActiveWindow(createNativeWindow(createUIWindow('detached'), 'detached'));
		setiOSWindow(recorded);

		expect(getWindow()).toBe(recorded);
	});

	it('falls back to the recorded window when there is no active window', () => {
		const recorded = createUIWindow('recorded');
		setiOSWindow(recorded);
		global.UIApplication = { sharedApplication: { keyWindow: createUIWindow('key') } } as any;

		expect(getWindow()).toBe(recorded);
	});

	it('falls back to the key window when NativeScript has recorded no window', () => {
		const keyWindow = createUIWindow('key');
		global.UIApplication = { sharedApplication: { keyWindow } } as any;

		expect(getWindow()).toBe(keyWindow);
	});

	it('falls back to the first application window when there is no key window', () => {
		const firstWindow = createUIWindow('first');
		global.UIApplication = {
			sharedApplication: {
				keyWindow: null,
				windows: {
					count: 2,
					objectAtIndex: (index: number) => (index === 0 ? firstWindow : createUIWindow('second')),
				},
			},
		} as any;

		expect(getWindow()).toBe(firstWindow);
	});

	it('returns undefined when there is no application at all', () => {
		global.UIApplication = { sharedApplication: null } as any;

		expect(getWindow()).toBeUndefined();
	});
});

/**
 * `SDK_VERSION` is resolved once at module evaluation, so reaching the scene-aware factory
 * branch means re-importing the module against a 15+ system version. The reimported module
 * graph brings its own copy of the window registry, which is empty - exactly the state the
 * factory lookup exists for.
 */
describe('getWindow on iOS 15+', () => {
	let previousSystemVersion: string;

	beforeEach(() => {
		previousSystemVersion = global.UIDevice.currentDevice.systemVersion;
		global.UIDevice.currentDevice.systemVersion = '15.0';
		vi.resetModules();
	});

	afterEach(() => {
		global.UIDevice.currentDevice.systemVersion = previousSystemVersion;
		delete (global as any).NativeScriptViewFactory;
		vi.resetModules();
	});

	it('uses the scene-aware key window from NativeScriptViewFactory', async () => {
		const factoryWindow = createUIWindow('factory');
		(global as any).NativeScriptViewFactory = { getKeyWindow: () => factoryWindow };

		const { getWindow: freshGetWindow } = await import('./native-helper.ios');

		expect(freshGetWindow()).toBe(factoryWindow);
	});
});
