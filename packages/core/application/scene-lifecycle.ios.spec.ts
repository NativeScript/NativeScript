import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Observable } from '../data/observable';
import { Application, iOSApplication } from './application.ios';
import type { NativeWindow } from '../native-window/native-window-common';
import type { WindowRole } from '../native-window/window-base';

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

/** Only the window's role reaches the aggregate. */
function createWindow(role: WindowRole = 'application'): NativeWindow {
	return { role } as unknown as NativeWindow;
}

describe('scene lifecycle aggregate', () => {
	let app: iOSApplication;
	let order: string[];

	beforeEach(() => {
		installApplicationEventBus();
		app = new iOSApplication();
		vi.spyOn(app, 'supportsScenes').mockReturnValue(true);

		order = [];
		for (const eventName of ['foreground', 'background', 'resume', 'suspend']) {
			app.on(eventName, () => order.push(eventName));
		}
	});

	afterEach(() => {
		vi.restoreAllMocks();
		installApplicationEventBus();
	});

	it('raises each app-level event once as a single window moves through the scene lifecycle', () => {
		const window = createWindow();

		app._setWindowInForeground(window, true);
		app._setWindowActive(window, true);

		expect(order).toEqual(['foreground', 'resume']);
		expect(app.inBackground).toBe(false);
		expect(app.suspended).toBe(false);

		app._setWindowActive(window, false);
		app._setWindowInForeground(window, false);

		expect(order).toEqual(['foreground', 'resume', 'suspend', 'background']);
		expect(app.inBackground).toBe(true);
		expect(app.suspended).toBe(true);
	});

	it('raises app-level state only on the first window in and the last window out', () => {
		const first = createWindow();
		const second = createWindow();

		app._setWindowInForeground(first, true);
		app._setWindowInForeground(second, true);
		app._setWindowActive(first, true);
		app._setWindowActive(second, true);

		expect(order).toEqual(['foreground', 'resume']);

		app._setWindowActive(first, false);
		app._setWindowInForeground(first, false);

		expect(order).toEqual(['foreground', 'resume']);
		expect(app.inBackground).toBe(false);
		expect(app.suspended).toBe(false);

		app._setWindowActive(second, false);
		app._setWindowInForeground(second, false);

		expect(order).toEqual(['foreground', 'resume', 'suspend', 'background']);
	});

	it('leaves app-level state to windows in the application role', () => {
		const carPlay = createWindow('carplay');

		app._setWindowInForeground(carPlay, true);
		app._setWindowActive(carPlay, true);
		app._setWindowActive(carPlay, false);
		app._setWindowInForeground(carPlay, false);

		expect(order).toEqual([]);
	});

	it('does not let a non-application window mask the last application window leaving', () => {
		const window = createWindow();
		const external = createWindow('externalDisplay');

		app._setWindowInForeground(window, true);
		app._setWindowInForeground(external, true);

		expect(order).toEqual(['foreground']);

		app._setWindowInForeground(window, false);

		expect(order).toEqual(['foreground', 'background']);
	});

	it('releases the aggregate when a window disconnects while foregrounded and active', () => {
		const window = createWindow();

		app._setWindowInForeground(window, true);
		app._setWindowActive(window, true);
		order.length = 0;

		// What sceneDidDisconnect does for a window that never resigned or backgrounded.
		app._setWindowActive(window, false);
		app._setWindowInForeground(window, false);

		expect(order).toEqual(['suspend', 'background']);

		const replacement = createWindow();
		app._setWindowInForeground(replacement, true);
		app._setWindowActive(replacement, true);

		expect(order).toEqual(['suspend', 'background', 'foreground', 'resume']);
	});

	it('ignores repeated callbacks for the same window', () => {
		const window = createWindow();

		app._setWindowInForeground(window, true);
		app._setWindowInForeground(window, true);
		app._setWindowActive(window, true);
		app._setWindowActive(window, true);

		expect(order).toEqual(['foreground', 'resume']);

		app._setWindowActive(window, false);
		app._setWindowActive(window, false);
		app._setWindowInForeground(window, false);
		app._setWindowInForeground(window, false);

		expect(order).toEqual(['foreground', 'resume', 'suspend', 'background']);
	});

	it('carries the scene and the shared application on the app-level event', () => {
		const window = createWindow();
		const scene = {} as UIScene;
		const payloads: any[] = [];
		app.on('foreground', (args: any) => payloads.push(args));

		app._setWindowInForeground(window, true, scene);

		expect(payloads).toHaveLength(1);
		expect(payloads[0].scene).toBe(scene);
		expect(payloads[0].ios).toBe(UIApplication.sharedApplication);
	});

	it('leaves the UIApplication notifications out of app-level state in scene mode', () => {
		(app as any).didBecomeActive({} as NSNotification);
		(app as any).didEnterBackground({} as NSNotification);

		expect(order).toEqual([]);
	});

	it('still drives app-level state from the UIApplication notifications without scenes', () => {
		vi.spyOn(app, 'supportsScenes').mockReturnValue(false);

		(app as any).didBecomeActive({} as NSNotification);

		expect(order).toEqual(['foreground', 'resume']);

		(app as any).didEnterBackground({} as NSNotification);

		expect(order).toEqual(['foreground', 'resume', 'background', 'suspend']);
	});
});

describe('scene delegate app-level lifecycle', () => {
	const sceneDelegate = (global as any).SceneDelegate.prototype;
	let scene: UIWindowScene;
	let window: any;
	let calls: string[];

	beforeEach(() => {
		// The delegate always talks to the Application singleton, whose aggregates outlive a
		// single test.
		(Application.ios as any)._foregroundWindows.clear();
		(Application.ios as any)._activeWindows.clear();

		scene = {} as UIWindowScene;
		window = {
			role: 'application',
			rootView: undefined,
			_hasSessionIdentity: true,
			_closeRequested: false,
			_notifyEvent() {},
			notify() {},
			_detach() {},
		};

		calls = [];
		vi.spyOn(Application.ios, '_getWindowForScene').mockReturnValue(window);
		vi.spyOn(Application.ios, 'setInBackground').mockImplementation((value: boolean) => {
			calls.push(value ? 'background' : 'foreground');
		});
		vi.spyOn(Application.ios, 'setSuspended').mockImplementation((value: boolean) => {
			calls.push(value ? 'suspend' : 'resume');
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		(Application.ios as any)._foregroundWindows.clear();
		(Application.ios as any)._activeWindows.clear();
	});

	it('drives app-level state from the scene lifecycle callbacks', () => {
		sceneDelegate.sceneWillEnterForeground(scene);
		sceneDelegate.sceneDidBecomeActive(scene);

		expect(calls).toEqual(['foreground', 'resume']);

		sceneDelegate.sceneWillResignActive(scene);
		sceneDelegate.sceneDidEnterBackground(scene);

		expect(calls).toEqual(['foreground', 'resume', 'suspend', 'background']);
	});

	it('releases app-level state when a scene disconnects while foregrounded and active', () => {
		sceneDelegate.sceneWillEnterForeground(scene);
		sceneDelegate.sceneDidBecomeActive(scene);
		calls.length = 0;

		sceneDelegate.sceneDidDisconnect(scene);

		expect(calls).toEqual(['suspend', 'background']);
	});

	it('does not raise app-level state twice when a disconnect follows a clean background', () => {
		sceneDelegate.sceneWillEnterForeground(scene);
		sceneDelegate.sceneDidBecomeActive(scene);
		sceneDelegate.sceneWillResignActive(scene);
		sceneDelegate.sceneDidEnterBackground(scene);
		calls.length = 0;

		sceneDelegate.sceneDidDisconnect(scene);

		expect(calls).toEqual([]);
	});
});
