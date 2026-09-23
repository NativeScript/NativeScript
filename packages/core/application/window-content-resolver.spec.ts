import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoreTypes } from '../core-types';
import { Observable } from '../data/observable';
import { Builder } from '../ui/builder';
import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { NativeWindow } from '../native-window/native-window-common';
import type { WindowContentRequest } from '../native-window/native-window-interfaces';
import { ApplicationCommon } from './application-common';
import { getAppMainEntry, setAppMainEntry } from './helpers-common';

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

function createFakeView(name: string) {
	return {
		name,
		cssClasses: new Set<string>(),
		isLoaded: false,
		_styleScope: null,
		_setupAsRootView() {},
		_onCssStateChange() {},
		_onRootViewReset() {},
		_tearDownUI() {},
		callUnloaded() {},
		_getRootModalViews() {
			return [];
		},
	} as unknown as View;
}

class TestApplication extends ApplicationCommon {
	getRootView(): View {
		return undefined;
	}

	getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return 'portrait';
	}

	getSystemAppearance(): 'dark' | 'light' | null {
		return 'light';
	}

	getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return CoreTypes.LayoutDirection.ltr;
	}
}

class TestWindow extends NativeWindow {
	protected _setNativeContent(view: View): void {
		// no native surface under test
	}

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return 'portrait';
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		return 'light';
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return CoreTypes.LayoutDirection.ltr;
	}

	close(): void {
		// no native surface under test
	}
}

describe('window content resolution', () => {
	let app: TestApplication;
	let window: TestWindow;
	let request: WindowContentRequest;
	let mainEntryView: View;
	let previousMainEntry: any;
	let createViewFromEntry: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		previousMainEntry = getAppMainEntry();
		installApplicationEventBus();
		app = new TestApplication();
		window = new TestWindow('window-1', true);
		request = { window, isPrimary: true };
		mainEntryView = createFakeView('main-entry');

		setAppMainEntry({ moduleName: 'app-root' });
		createViewFromEntry = vi.spyOn(Builder, 'createViewFromEntry').mockImplementation(() => mainEntryView);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		setAppMainEntry(previousMainEntry);
		installApplicationEventBus();
	});

	describe('the resolver chain', () => {
		it('uses the View a resolver returns', () => {
			const view = createFakeView('resolved');
			app.setWindowContentResolver(() => view);

			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBe(view);
			expect(window.rootView).toBe(view);
		});

		it('hands the resolver the request it was given', () => {
			const resolver = vi.fn(() => createFakeView('resolved'));
			app.setWindowContentResolver(resolver);

			app._resolveWindowContent(window, request);

			expect(resolver).toHaveBeenCalledTimes(1);
			expect(resolver).toHaveBeenCalledWith(request);
		});

		it('builds the NavigationEntry a resolver returns', () => {
			const entry: NavigationEntry = { moduleName: 'pages/detail' };
			const built = createFakeView('built');
			createViewFromEntry.mockReturnValue(built);
			app.setWindowContentResolver(() => entry);

			const resolved = app._resolveWindowContent(window, request);

			expect(createViewFromEntry).toHaveBeenCalledWith(entry);
			expect(resolved).toBe(built);
		});

		it('builds the module name a resolver returns', () => {
			const built = createFakeView('built');
			createViewFromEntry.mockReturnValue(built);
			app.setWindowContentResolver(() => 'pages/detail');

			const resolved = app._resolveWindowContent(window, request);

			expect(createViewFromEntry).toHaveBeenCalledWith({ moduleName: 'pages/detail' });
			expect(resolved).toBe(built);
		});

		it('sets no content when a resolver returns null, leaving it to supply one later', () => {
			const launched = vi.fn();
			app.on('launch', launched);
			app.setWindowContentResolver(() => null);

			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBeNull();
			expect(window.rootView).toBeUndefined();
			expect(launched).not.toHaveBeenCalled();
			expect(createViewFromEntry).not.toHaveBeenCalled();
		});

		it('falls through to the main entry when a resolver returns undefined', () => {
			const resolver = vi.fn(() => undefined);
			app.setWindowContentResolver(resolver);

			const resolved = app._resolveWindowContent(window, request);

			expect(resolver).toHaveBeenCalledTimes(1);
			expect(createViewFromEntry).toHaveBeenCalledWith({ moduleName: 'app-root' });
			expect(resolved).toBe(mainEntryView);
			expect(window.rootView).toBe(mainEntryView);
		});

		it('falls back to the main entry when no resolver is set', () => {
			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBe(mainEntryView);
			expect(window.rootView).toBe(mainEntryView);
		});

		it('leaves the window empty instead of throwing when there is no main entry', () => {
			setAppMainEntry(undefined);

			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBeNull();
			expect(window.rootView).toBeUndefined();
		});

		it('returns the built view without installing it when asked not to install', () => {
			const view = createFakeView('resolved');
			app.setWindowContentResolver(() => view);

			const resolved = app._resolveWindowContent(window, request, { install: false });

			expect(resolved).toBe(view);
			expect(window.rootView).toBeUndefined();
		});

		it('drops a previously set resolver when it is cleared', () => {
			app.setWindowContentResolver(() => createFakeView('resolved'));
			app.setWindowContentResolver(null);

			expect(app.getWindowContentResolver()).toBeNull();
			expect(app._resolveWindowContent(window, request)).toBe(mainEntryView);
		});
	});

	describe('the legacy launch bridge', () => {
		it('uses the View a launch handler puts on args.root', () => {
			const view = createFakeView('launch-root');
			app.on('launch', (args: any) => {
				args.root = view;
			});

			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBe(view);
			expect(createViewFromEntry).not.toHaveBeenCalled();
		});

		it('sets no content when a launch handler puts null on args.root', () => {
			app.on('launch', (args: any) => {
				args.root = null;
			});

			const resolved = app._resolveWindowContent(window, request);

			expect(resolved).toBeNull();
			expect(window.rootView).toBeUndefined();
			expect(createViewFromEntry).not.toHaveBeenCalled();
		});

		it('falls through to the main entry when a launch handler leaves args.root alone', () => {
			const launched = vi.fn();
			app.on('launch', launched);

			const resolved = app._resolveWindowContent(window, request);

			expect(launched).toHaveBeenCalledTimes(1);
			expect(resolved).toBe(mainEntryView);
		});

		it('merges the platform launch data into the launch args', () => {
			const received: any[] = [];
			app.on('launch', (args: any) => received.push(args));

			app._resolveWindowContent(window, request, { launchData: { android: 'intent' } });

			expect(received[0].android).toBe('intent');
			expect(received[0].eventName).toBe('launch');
		});

		it('fires for the first window only', () => {
			const launched = vi.fn();
			app.on('launch', launched);
			const second = new TestWindow('window-2');

			app._resolveWindowContent(window, request);
			app._resolveWindowContent(second, { window: second, isPrimary: false });

			expect(launched).toHaveBeenCalledTimes(1);
		});

		it('never fires once a resolver has answered the first window', () => {
			const launched = vi.fn();
			app.on('launch', launched);
			app.setWindowContentResolver(() => createFakeView('resolved'));

			app._resolveWindowContent(window, request);
			app.setWindowContentResolver(null);
			const second = new TestWindow('window-2');
			app._resolveWindowContent(second, { window: second, isPrimary: false });

			expect(launched).not.toHaveBeenCalled();
			expect(second.rootView).toBe(mainEntryView);
		});
	});

	describe('the ready event', () => {
		it('is raised once, before any window opens', () => {
			const order: string[] = [];
			app.on('ready', () => order.push('ready'));
			app.on('windowOpen', () => order.push('windowOpen'));
			app.on('launch', () => order.push('launch'));

			app.notifyReady();
			app._registerWindow(window);
			app._resolveWindowContent(window, request);

			expect(order).toEqual(['ready', 'windowOpen', 'launch']);
		});

		it('is not raised a second time', () => {
			const ready = vi.fn();
			app.on('ready', ready);

			app.notifyReady();
			app.notifyReady();

			expect(ready).toHaveBeenCalledTimes(1);
		});

		it('precedes windowOpen for every window, however many open', () => {
			const order: string[] = [];
			app.on('ready', () => order.push('ready'));
			app.on('windowOpen', () => order.push('windowOpen'));

			app.notifyReady();
			app._registerWindow(window);
			app._registerWindow(new TestWindow('window-2'));

			expect(order).toEqual(['ready', 'windowOpen', 'windowOpen']);
		});
	});

	describe('app css loading', () => {
		let loadAppCss: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			loadAppCss = vi.spyOn(app, 'loadAppCss').mockImplementation(() => {});
		});

		it('loads once when a resolver supplies the content', () => {
			app.setWindowContentResolver(() => createFakeView('resolved'));

			app._resolveWindowContent(window, request);

			expect(loadAppCss).toHaveBeenCalledTimes(1);
		});

		it('loads once when a resolver takes ownership by returning null', () => {
			app.setWindowContentResolver(() => null);

			app._resolveWindowContent(window, request);

			expect(loadAppCss).toHaveBeenCalledTimes(1);
		});

		it('loads once on the legacy launch path', () => {
			app.on('launch', (args: any) => {
				args.root = createFakeView('launch-root');
			});

			app._resolveWindowContent(window, request);

			expect(loadAppCss).toHaveBeenCalledTimes(1);
		});

		it('loads once on the main entry path', () => {
			app._resolveWindowContent(window, request);

			expect(loadAppCss).toHaveBeenCalledTimes(1);
		});

		it('loads only once across several windows', () => {
			app.setWindowContentResolver(() => createFakeView('resolved'));
			const second = new TestWindow('window-2');

			app._resolveWindowContent(window, request);
			app._resolveWindowContent(second, { window: second, isPrimary: false });

			expect(loadAppCss).toHaveBeenCalledTimes(1);
		});

		it('loads after the launch handlers, which may still change the css file', () => {
			let cssFileAtLoad: string;
			loadAppCss.mockImplementation(() => {
				cssFileAtLoad = app.getCssFileName();
			});
			app.on('launch', () => {
				app.setCssFileName('./themed.css');
			});

			app._resolveWindowContent(window, request);

			expect(cssFileAtLoad).toBe('./themed.css');
		});
	});
});
