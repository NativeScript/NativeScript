import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoreTypes } from '../core-types';
import { Observable } from '../data/observable';
import type { View } from '../ui/core/view';
import { NativeWindow } from '../native-window/native-window-common';
import { WindowBase } from '../native-window/window-base';
import type { WindowRole } from '../native-window/window-base';
import { ApplicationCommon } from './application-common';
import { NativeWindowEvents } from '../native-window/native-window-interfaces';
import { setActiveWindow } from './helpers-common';

/**
 * `vitest.setup.ts` installs a `NativeScriptGlobals` whose event methods are no-ops, and
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

	/** Marks the window as carrying content, the way a real attached window would. */
	withContent(): this {
		this._adoptRootView({
			isLoaded: false,
			cssClasses: new Set<string>(),
			callUnloaded() {},
			_tearDownUI() {},
			_onRootViewReset() {},
			_getRootModalViews: () => [],
		} as unknown as View);

		return this;
	}
}

/** A surface with no view tree at all - a CarPlay scene is the real-world case. */
class TemplateWindow extends WindowBase {
	constructor(id?: string, isPrimary = false, role: WindowRole = 'carplay') {
		super(id, isPrimary, role);
	}

	close(): void {
		// no native surface under test
	}
}

function asWindow(window: WindowBase): NativeWindow {
	return window as unknown as NativeWindow;
}

describe('ApplicationCommon window registry', () => {
	let app: TestApplication;
	let events: string[];

	beforeEach(() => {
		installApplicationEventBus();
		app = new TestApplication();
		events = [];
		setActiveWindow(undefined);
	});

	afterEach(() => {
		installApplicationEventBus();
		setActiveWindow(undefined);
	});

	/**
	 * Retires a window the way a platform does: the disconnect callback records that the
	 * surface is gone, and only then is the window unregistered.
	 */
	function retire(window: WindowBase): void {
		window._surfaceGone = true;
		app._unregisterWindow(asWindow(window));
	}

	function record(...eventNames: string[]): Array<{ eventName: string; window: WindowBase }> {
		const recorded: Array<{ eventName: string; window: WindowBase }> = [];
		for (const eventName of eventNames) {
			app.on(eventName, (args: any) => {
				events.push(eventName);
				recorded.push({ eventName, window: args.window });
			});
		}

		return recorded;
	}

	it('raises windowOpen with the registered window once per registration', () => {
		const recorded = record('windowOpen');
		const first = new TestWindow('a', true);
		const second = new TestWindow('b');

		app._registerWindow(first);
		app._registerWindow(second);

		expect(recorded.map((entry) => entry.window)).toEqual([first, second]);
		expect(app.getWindows()).toEqual([first, second]);
	});

	it('reports the window flagged primary', () => {
		const first = new TestWindow('a');
		const primary = new TestWindow('b', true);
		app._registerWindow(first);
		app._registerWindow(primary);

		expect(app.primaryWindow).toBe(primary);
	});

	it('finds a window by id and returns undefined for an unknown one', () => {
		const window = new TestWindow('scene-7', true);
		app._registerWindow(window);

		expect(app.getWindowById('scene-7')).toBe(window);
		expect(app.getWindowById('scene-8')).toBeUndefined();
	});

	describe('role filtering', () => {
		let application: TestWindow;
		let embedded: TestWindow;
		let carPlay: TemplateWindow;

		beforeEach(() => {
			application = new TestWindow('app', true, 'application');
			embedded = new TestWindow('embedded', false, 'embedded');
			carPlay = new TemplateWindow('carplay');

			app._registerWindow(application);
			app._registerWindow(embedded);
			app._registerWindow(asWindow(carPlay));
		});

		it('returns only the view-carrying roles by default', () => {
			expect(app.getWindows()).toEqual([application, embedded]);
		});

		it("includes every surface for 'all'", () => {
			expect(app.getWindows('all')).toEqual([application, embedded, carPlay]);
		});

		it('returns the requested roles when asked explicitly', () => {
			expect(app.getWindows('carplay')).toEqual([carPlay]);
			expect(app.getWindows(['application', 'carplay'])).toEqual([application, carPlay]);
		});

		it('exposes every surface through the internal accessor', () => {
			expect(app._getWindows()).toEqual([application, embedded, carPlay]);
		});
	});

	describe('returned arrays are copies', () => {
		let first: TestWindow;
		let second: TestWindow;

		beforeEach(() => {
			first = new TestWindow('a', true);
			second = new TestWindow('b');
			app._registerWindow(first);
			app._registerWindow(second);
		});

		it('mutating the result of getWindows() leaves the registry untouched', () => {
			const windows = app.getWindows();
			windows.pop();
			windows.push(new TestWindow('intruder'));

			expect(app.getWindows()).toEqual([first, second]);
		});

		it("mutating the result of getWindows('all') leaves the registry untouched", () => {
			app.getWindows('all').length = 0;

			expect(app.getWindows('all')).toEqual([first, second]);
		});

		it('mutating the result of _getWindows() leaves the registry untouched', () => {
			app._getWindows().length = 0;

			expect(app._getWindows()).toEqual([first, second]);
		});
	});

	describe('unregistering', () => {
		it('raises windowClose, drops the window and ends its session', () => {
			const window = new TestWindow('a', true);
			app._registerWindow(window);
			const recorded = record('windowClose');

			retire(window);

			expect(recorded.map((entry) => entry.window)).toEqual([window]);
			expect(app.getWindows()).toEqual([]);
			expect(window.state).toBe('closed');
		});

		it('promotes the first attached view-carrying window and announces it', () => {
			const primary = new TestWindow('primary', true).withContent();
			const detached = new TestWindow('detached').withContent();
			const carPlay = new TemplateWindow('carplay');
			const successor = new TestWindow('successor').withContent();

			app._registerWindow(primary);
			app._registerWindow(detached);
			app._registerWindow(asWindow(carPlay));
			app._registerWindow(successor);
			detached._detach();

			const recorded = record('windowClose', 'primaryWindowChanged');
			retire(primary);

			expect(events).toEqual(['windowClose', 'primaryWindowChanged']);
			expect(recorded[1].window).toBe(successor);
			expect(primary.isPrimary).toBe(false);
			expect(successor.isPrimary).toBe(true);
			expect(app.primaryWindow).toBe(successor);
		});

		it('leaves the app without a primary window when nothing can take over', () => {
			const primary = new TestWindow('primary', true).withContent();
			const detached = new TestWindow('detached').withContent();
			app._registerWindow(primary);
			app._registerWindow(detached);
			detached._detach();

			record('windowClose', 'primaryWindowChanged');
			retire(primary);

			expect(events).toEqual(['windowClose']);
			expect(primary.isPrimary).toBe(false);
			expect(app.primaryWindow).toBeUndefined();
		});

		it('does not promote anything when a non-primary window goes away', () => {
			const primary = new TestWindow('primary', true).withContent();
			const secondary = new TestWindow('secondary').withContent();
			app._registerWindow(primary);
			app._registerWindow(secondary);

			record('windowClose', 'primaryWindowChanged');
			retire(secondary);

			expect(events).toEqual(['windowClose']);
			expect(app.primaryWindow).toBe(primary);
		});
	});

	describe('activeWindow', () => {
		let primary: TestWindow;
		let secondary: TestWindow;

		beforeEach(() => {
			primary = new TestWindow('primary', true).withContent();
			secondary = new TestWindow('secondary').withContent();
			app._registerWindow(primary);
			app._registerWindow(secondary);
		});

		it('falls back to the primary window before anything activates', () => {
			expect(app.activeWindow).toBe(primary);
		});

		it('follows the window that activated most recently', () => {
			secondary._notifyEvent(NativeWindowEvents.activate);
			expect(app.activeWindow).toBe(secondary);

			primary._notifyEvent(NativeWindowEvents.activate);
			expect(app.activeWindow).toBe(primary);
		});

		it('falls back to the primary window once the active one closes', () => {
			secondary._notifyEvent(NativeWindowEvents.activate);

			retire(secondary);

			expect(app.activeWindow).toBe(primary);
		});

		it('falls back to the primary window while the active one is detached', () => {
			secondary._notifyEvent(NativeWindowEvents.activate);
			secondary._detach();

			expect(app.activeWindow).toBe(primary);
		});
	});

	describe('discarded window sessions', () => {
		let attached: TestWindow;
		let detached: TestWindow;

		beforeEach(() => {
			attached = new TestWindow('scene-live', true).withContent();
			detached = new TestWindow('scene-gone').withContent();

			app._registerWindow(attached);
			app._registerWindow(detached);

			detached._detach();
		});

		it('retires a window whose surface is already gone', () => {
			record('windowClose');

			// The window drops its listeners in `_destroy`, so a listener only sees `close`
			// if it is raised before the window is unregistered.
			let closed = false;
			detached.on(NativeWindowEvents.close, () => {
				closed = true;
			});

			app._retireDiscardedWindows(['scene-gone']);

			expect(app.getWindowById('scene-gone')).toBeUndefined();
			expect(closed).toBe(true);
			expect(events).toEqual(['windowClose']);
		});

		/**
		 * iOS reports sessions discarded in an earlier run on the next launch, and such an
		 * id can name the session driving the app now. Retiring on the id alone would unload
		 * the live root view and every frame under it, and nothing reloads a root view whose
		 * window has left the registry - navigation then queues forever behind `Frame.isLoaded`.
		 */
		it('leaves an attached window alone when a discarded id names it', () => {
			const rootView = attached.rootView as any;
			let unloaded = false;

			rootView.isLoaded = true;
			rootView.callUnloaded = () => {
				unloaded = true;
			};

			app._retireDiscardedWindows(['scene-live']);

			expect(app.getWindowById('scene-live')).toBe(attached);
			expect(attached.state).toBe('attached');
			expect(unloaded).toBe(false);
			expect(events).toEqual([]);
		});

		it('ignores ids that match no window', () => {
			record('windowClose');

			app._retireDiscardedWindows(['scene-never-seen']);

			expect(app.getWindows()).toEqual([attached, detached]);
			expect(events).toEqual([]);
		});

		it('retires every detached window named in one discard', () => {
			const alsoDetached = new TestWindow('scene-gone-too').withContent();
			app._registerWindow(alsoDetached);
			alsoDetached._detach();

			app._retireDiscardedWindows(['scene-gone', 'scene-live', 'scene-gone-too']);

			expect(app.getWindowById('scene-gone')).toBeUndefined();
			expect(app.getWindowById('scene-gone-too')).toBeUndefined();
			expect(app.getWindowById('scene-live')).toBe(attached);
		});
	});
});
