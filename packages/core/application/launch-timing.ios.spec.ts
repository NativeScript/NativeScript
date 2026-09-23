import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Observable } from '../data/observable';
import { iOSApplication } from './application.ios';
import { getAppMainEntry, getiOSWindow, setAppMainEntry, setiOSWindow } from './helpers-common';

/**
 * `vitest.setup.ts` installs a `NativeScriptGlobals` whose event bus methods are no-ops, and
 * `ApplicationCommon` binds them per instance. Swapping in a real Observable before each
 * Application is constructed is what makes its events observable at all.
 */
function installApplicationEventBus(): Observable {
	const events = new Observable();
	const bus = (global.NativeScriptGlobals as any).events;

	bus.on = events.on.bind(events);
	bus.once = events.once.bind(events);
	bus.off = events.off.bind(events);
	bus.notify = events.notify.bind(events);
	bus.hasListeners = events.hasListeners.bind(events);

	return events;
}

/** Mirrors the surface of UIWindow the non-scene launch path touches. */
function createFakeUIWindow() {
	return {
		backgroundColor: null,
		rootViewController: null,
		makeKeyAndVisible() {},
	} as unknown as UIWindow;
}

function createLaunchNotification() {
	return {
		userInfo: {
			objectForKey: () => null,
		},
	} as unknown as NSNotification;
}

describe('non-scene launch timing', () => {
	let app: iOSApplication;
	let order: string[];
	let previousMainEntry: any;
	let previousWindow: UIWindow;
	let previousApplicationState: any;

	beforeEach(() => {
		previousMainEntry = getAppMainEntry();
		previousWindow = getiOSWindow();
		previousApplicationState = (UIApplication.sharedApplication as any).applicationState;
		(global as any).UIApplicationState = { Active: 0, Inactive: 1, Background: 2 };
		(UIApplication.sharedApplication as any).applicationState = 0;

		installApplicationEventBus();
		app = new iOSApplication();
		vi.spyOn(app, 'supportsScenes').mockReturnValue(false);
		// Display-link plumbing, unrelated to launch timing and with no stand-in under test.
		vi.spyOn(app, 'setMaxRefreshRate').mockImplementation(() => {});
		setiOSWindow(createFakeUIWindow());
		setAppMainEntry({ moduleName: 'app-root' });

		order = [];
		app.on('ready', () => order.push('ready'));
		app.on('windowOpen', () => order.push('windowOpen'));
		// Taking ownership of the root keeps the assertions on timing rather than on view creation.
		app.on('launch', (args: any) => {
			order.push('launch');
			args.root = null;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		setAppMainEntry(previousMainEntry);
		setiOSWindow(previousWindow);
		(UIApplication.sharedApplication as any).applicationState = previousApplicationState;
		delete (global as any).UIApplicationState;
		installApplicationEventBus();
	});

	it('resolves the first window content while the app finishes launching', () => {
		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());

		expect(order).toEqual(['ready', 'windowOpen', 'launch']);
	});

	it('resolves it while finishing launching even when the app launched into the background', () => {
		(UIApplication.sharedApplication as any).applicationState = (global as any).UIApplicationState.Background;

		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());

		expect(order).toContain('launch');
		expect(app.primaryWindow).toBeDefined();
	});

	it('holds the content back until the app first becomes active when asked to delay', () => {
		app.shouldDelayLaunchEvent = true;

		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());

		expect(order).toEqual(['ready', 'windowOpen']);

		(app as any).didBecomeActive(createLaunchNotification());

		expect(order).toEqual(['ready', 'windowOpen', 'launch']);
	});

	it('resolves the delayed content only once, however often the app becomes active', () => {
		app.shouldDelayLaunchEvent = true;

		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());
		(app as any).didBecomeActive(createLaunchNotification());
		(app as any).didBecomeActive(createLaunchNotification());

		expect(order.filter((entry) => entry === 'launch')).toHaveLength(1);
	});

	it('raises ready before the window opens whether or not the content is delayed', () => {
		app.shouldDelayLaunchEvent = true;

		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());

		expect(order[0]).toBe('ready');
		expect(order[1]).toBe('windowOpen');
	});
});

describe('scene launch timing', () => {
	let app: iOSApplication;
	let order: string[];
	let previousWindow: UIWindow;

	beforeEach(() => {
		previousWindow = getiOSWindow();
		installApplicationEventBus();
		app = new iOSApplication();
		vi.spyOn(app, 'supportsScenes').mockReturnValue(true);
		// Display-link plumbing, unrelated to launch timing and with no stand-in under test.
		vi.spyOn(app, 'setMaxRefreshRate').mockImplementation(() => {});

		order = [];
		app.on('ready', () => order.push('ready'));
		app.on('windowOpen', () => order.push('windowOpen'));
		app.on('launch', () => order.push('launch'));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		setiOSWindow(previousWindow);
		installApplicationEventBus();
	});

	it('raises ready and leaves every window to its scene, delay flag or not', () => {
		app.shouldDelayLaunchEvent = true;

		(app as any).didFinishLaunchingWithOptions(createLaunchNotification());

		expect(order).toEqual(['ready']);
		expect(app._getWindows()).toHaveLength(0);

		(app as any).didBecomeActive(createLaunchNotification());

		expect(order).toEqual(['ready']);
	});
});
