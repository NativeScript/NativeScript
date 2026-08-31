import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoreTypes } from '../core-types';
import { Builder } from '../ui/builder';
import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { NativeWindow } from './native-window-common';
import { NativeWindowEvents } from './native-window-interfaces';
import { WindowBase } from './window-base';
import type { WindowRole } from './window-base';
import { LayoutBaseCommon } from '../ui/layouts/layout-base-common';

/**
 * Stand-in for a root view. A real `View` cannot be used here: `_setupAsRootView()`
 * reaches straight into UIView/android.view.View, which do not exist under vitest.
 */
function createFakeView() {
	return {
		cssClasses: new Set<string>(),
		style: {} as Record<string, unknown>,
		isLoaded: false,
		_styleScope: null,
		unloadedCount: 0,
		resetCount: 0,
		tearDownCount: 0,
		setupCount: 0,
		_setupAsRootView() {
			this.setupCount++;
		},
		_onCssStateChange() {},
		_onRootViewReset() {
			this.resetCount++;
		},
		_tearDownUI() {
			this.tearDownCount++;
		},
		callUnloaded() {
			this.unloadedCount++;
			this.isLoaded = false;
		},
		_getRootModalViews() {
			return [];
		},
		_nativeWindow: null as NativeWindow | null,
	};
}

/**
 * A real view, for anything exercising the view side of the window lookup.
 * `LayoutBaseCommon` is the lightest concrete `ViewCommon` that can be built under vitest.
 */
function createRealView(): LayoutBaseCommon {
	return new LayoutBaseCommon();
}

function asChild(view: LayoutBaseCommon): View {
	return view as unknown as View;
}

type FakeView = ReturnType<typeof createFakeView>;

function asView(view: FakeView): View {
	return view as unknown as View;
}

class TestWindow extends NativeWindow {
	orientationValue: 'portrait' | 'landscape' | 'unknown' = 'portrait';
	appearanceValue: 'light' | 'dark' | null = 'light';
	directionValue: CoreTypes.LayoutDirectionType | null = CoreTypes.LayoutDirection.ltr;

	nativeContent: View[] = [];
	releasedViews: View[] = [];
	closeCalls = 0;
	destroyHookRan = false;

	protected _onReleaseRootView(rootView: View): void {
		this.releasedViews.push(rootView);
	}

	protected _setNativeContent(view: View): void {
		this.nativeContent.push(view);
	}

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return this.orientationValue;
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		return this.appearanceValue;
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return this.directionValue;
	}

	close(): void {
		this.closeCalls++;
	}

	protected _onDestroy(): void {
		this.destroyHookRan = true;
		// Runs before the listeners are dropped, so this must still reach subscribers.
		this._notifyEvent(NativeWindowEvents.deactivate);
		super._onDestroy();
	}
}

class BareWindow extends WindowBase {
	closeCalls = 0;

	constructor(id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);
	}

	close(): void {
		this.closeCalls++;
	}
}

/** Records every event the window emits, in order. */
function recordEvents(window: WindowBase, events: string[] = []): string[] {
	for (const eventName of Object.values(NativeWindowEvents)) {
		window.on(eventName, (data) => events.push(data.eventName));
	}

	return events;
}

describe('WindowBase identity, role and state', () => {
	it('defaults to an application window that is attached and not primary', () => {
		const window = new TestWindow();

		expect(window.role).toBe('application');
		expect(window.state).toBe('attached');
		expect(window.isPrimary).toBe(false);
		expect(window.id).toMatch(/^window-\d+$/);
	});

	it('keeps the id, primary flag and role it was constructed with', () => {
		const window = new TestWindow('scene-42', true, 'carplay');

		expect(window.id).toBe('scene-42');
		expect(window.isPrimary).toBe(true);
		expect(window.role).toBe('carplay');
	});

	it('mints a distinct id for every window left without one', () => {
		const ids = [new TestWindow().id, new TestWindow().id, new TestWindow().id];

		expect(new Set(ids).size).toBe(ids.length);
	});

	it('_setIsPrimary promotes and demotes the window', () => {
		const window = new TestWindow();

		window._setIsPrimary(true);
		expect(window.isPrimary).toBe(true);

		window._setIsPrimary(false);
		expect(window.isPrimary).toBe(false);
	});

	it('exposes no native accessors on a bare window surface', () => {
		const window = new BareWindow();

		expect(window.ios).toBeUndefined();
		expect(window.android).toBeUndefined();
	});
});

describe('WindowBase lifecycle', () => {
	it('walks attach -> detach -> re-attach -> close, emitting one event per transition', () => {
		const window = new TestWindow();
		const events = recordEvents(window);

		window._notifyEvent(NativeWindowEvents.attached);
		expect(window.state).toBe('attached');

		window._detach();
		expect(window.state).toBe('detached');

		window._setState('attached');
		window._notifyEvent(NativeWindowEvents.attached);
		expect(window.state).toBe('attached');

		window._notifyEvent(NativeWindowEvents.close);
		window._destroy();
		expect(window.state).toBe('closed');

		expect(events).toEqual(['attached', 'detached', 'attached', 'close', 'deactivate']);
	});

	it('records the surface as gone on detach and clears it on re-attach', () => {
		const window = new TestWindow();
		expect(window._surfaceGone).toBe(false);

		window._detach();
		expect(window._surfaceGone).toBe(true);

		window._setState('attached');
		expect(window._surfaceGone).toBe(false);
	});

	it('keeps listeners through a detach so a re-attached window still notifies them', () => {
		const window = new TestWindow();
		const events: string[] = [];
		window.on(NativeWindowEvents.attached, (data) => events.push(data.eventName));

		window._detach();
		window._setState('attached');
		window._notifyEvent(NativeWindowEvents.attached);

		expect(events).toEqual(['attached']);
	});

	it('drops listeners only after the teardown hook has run', () => {
		const window = new TestWindow();
		const events = recordEvents(window);

		window._destroy();

		expect(window.destroyHookRan).toBe(true);
		expect(events).toEqual(['deactivate']);
	});

	it('delivers close to listeners registered before it and nothing afterwards', () => {
		const window = new TestWindow();
		const events = recordEvents(window);

		window._notifyEvent(NativeWindowEvents.close);
		window._destroy();
		expect(events).toEqual(['close', 'deactivate']);
		events.length = 0;

		window._notifyEvent(NativeWindowEvents.close);
		window._notifyEvent(NativeWindowEvents.activate);
		window._destroy();

		expect(events).toEqual([]);
	});

	it('unloads and resets the root view when the window session ends', () => {
		const window = new TestWindow();
		const view = createFakeView();
		window.setContent(asView(view));
		view.isLoaded = true;

		window._destroy();

		expect(view.unloadedCount).toBe(1);
		expect(view.resetCount).toBe(1);
		expect(window.rootView).toBeNull();
	});

	it('tears the root view down on detach but keeps reporting it', () => {
		const window = new TestWindow();
		const view = createFakeView();
		window.setContent(asView(view));
		view.isLoaded = true;

		window._detach();

		expect(view.unloadedCount).toBe(1);
		expect(view.tearDownCount).toBe(1);
		expect(window.rootView).toBe(asView(view));
	});
});

describe('NativeWindow.setContent', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('accepts a View, applies the root view settings and installs it natively', () => {
		const window = new TestWindow();
		const view = createFakeView();
		const events: string[] = [];
		window.on(NativeWindowEvents.contentLoaded, (data) => events.push(data.eventName));

		window.setContent(asView(view));

		expect(window.rootView).toBe(asView(view));
		expect(view.setupCount).toBe(1);
		expect(window.nativeContent).toEqual([asView(view)]);
		expect(events).toEqual(['contentLoaded']);
	});

	it('gives the root view the window-scoped css classes', () => {
		const window = new TestWindow();
		window.orientationValue = 'landscape';
		window.appearanceValue = 'dark';
		window.directionValue = CoreTypes.LayoutDirection.rtl;
		const view = createFakeView();

		window.setContent(asView(view));

		expect(view.cssClasses).toContain('ns-root');
		expect(view.cssClasses).toContain('ns-landscape');
		expect(view.cssClasses).toContain('ns-dark');
		expect(view.cssClasses).toContain('ns-rtl');
	});

	it('builds the view from a NavigationEntry', () => {
		const window = new TestWindow();
		const built = createFakeView();
		const create = vi.spyOn(Builder, 'createViewFromEntry').mockReturnValue(asView(built));
		const entry: NavigationEntry = { moduleName: 'pages/second' };

		window.setContent(entry);

		expect(create).toHaveBeenCalledWith(entry);
		expect(window.rootView).toBe(asView(built));
		expect(window.nativeContent).toEqual([asView(built)]);
	});

	it('builds the view from a module name string', () => {
		const window = new TestWindow();
		const built = createFakeView();
		const create = vi.spyOn(Builder, 'createViewFromEntry').mockReturnValue(asView(built));

		window.setContent('pages/second');

		expect(create).toHaveBeenCalledWith({ moduleName: 'pages/second' });
		expect(window.rootView).toBe(asView(built));
	});

	it('resets the previous root view when the content is replaced', () => {
		const window = new TestWindow();
		const first = createFakeView();
		const second = createFakeView();
		const events: string[] = [];
		window.on(NativeWindowEvents.contentLoaded, (data) => events.push(data.eventName));

		window.setContent(asView(first));
		window.setContent(asView(second));

		expect(first.resetCount).toBe(1);
		expect(window.rootView).toBe(asView(second));
		expect(events).toEqual(['contentLoaded', 'contentLoaded']);
	});

	it('throws rather than silently leaving the window empty on unusable content', () => {
		const window = new TestWindow();

		expect(() => window.setContent(undefined as unknown as View)).toThrow(/Invalid content/);
	});
});

describe('NativeWindow._adoptRootView', () => {
	it('records the view and announces it without re-running the platform setup', () => {
		const window = new TestWindow();
		const view = createFakeView();
		const events: string[] = [];
		window.on(NativeWindowEvents.contentLoaded, (data) => events.push(data.eventName));

		window._adoptRootView(asView(view));

		expect(window.rootView).toBe(asView(view));
		expect(events).toEqual(['contentLoaded']);
		// The platform pipeline already did both; redoing them would double-initialize the view.
		expect(window.nativeContent).toEqual([]);
		expect(view.setupCount).toBe(0);
	});

	it('is a no-op when handed the view it already holds', () => {
		const window = new TestWindow();
		const view = createFakeView();
		window._adoptRootView(asView(view));
		const events: string[] = [];
		window.on(NativeWindowEvents.contentLoaded, (data) => events.push(data.eventName));

		window._adoptRootView(asView(view));

		expect(events).toEqual([]);
	});

	it('ignores a missing view', () => {
		const window = new TestWindow();
		const events: string[] = [];
		window.on(NativeWindowEvents.contentLoaded, (data) => events.push(data.eventName));

		window._adoptRootView(undefined as unknown as View);

		expect(window.rootView).toBeUndefined();
		expect(events).toEqual([]);
	});
});

describe('NativeWindow trait readings', () => {
	let window: TestWindow;

	beforeEach(() => {
		window = new TestWindow();
	});

	it('reports a change the platform has not announced yet and raises the event for it', () => {
		expect(window.orientation()).toBe('portrait');
		const changes: string[] = [];
		window.on(NativeWindowEvents.orientationChanged, (data) => changes.push(data.newValue));

		window.orientationValue = 'landscape';

		expect(window.orientation()).toBe('landscape');
		expect(changes).toEqual(['landscape']);
	});

	it('freezes the last reading once the native surface is gone', () => {
		window.appearanceValue = 'dark';
		window.directionValue = CoreTypes.LayoutDirection.rtl;
		expect(window.systemAppearance()).toBe('dark');
		expect(window.layoutDirection()).toBe(CoreTypes.LayoutDirection.rtl);

		window._detach();
		window.appearanceValue = 'light';
		window.directionValue = CoreTypes.LayoutDirection.ltr;
		window.orientationValue = 'landscape';

		expect(window.systemAppearance()).toBe('dark');
		expect(window.layoutDirection()).toBe(CoreTypes.LayoutDirection.rtl);
		expect(window.orientation()).toBe('portrait');
	});
});

describe('NativeWindow root view hand-off', () => {
	it('takes the view over from the window that held it, leaving that window empty', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const view = createFakeView();

		windowA.setContent(asView(view));
		windowB.setContent(asView(view));

		expect(windowA.rootView).toBeNull();
		expect(windowB.rootView).toBe(asView(view));
		expect(view._nativeWindow).toBe(windowB);
	});

	it('leaves the moved view loaded and intact - it is being moved, not destroyed', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const view = createFakeView();

		windowA.setContent(asView(view));
		view.isLoaded = true;

		windowB.setContent(asView(view));

		expect(view.isLoaded).toBe(true);
		expect(view.unloadedCount).toBe(0);
		expect(view.tearDownCount).toBe(0);
		expect(view.resetCount).toBe(0);
	});

	it('runs the platform release hook on the departing window only', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const view = createFakeView();

		windowA.setContent(asView(view));
		windowB.setContent(asView(view));

		expect(windowA.releasedViews).toEqual([asView(view)]);
		expect(windowB.releasedViews).toEqual([]);
	});

	it('releases on adoption too', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const view = createFakeView();

		windowA._adoptRootView(asView(view));
		windowB._adoptRootView(asView(view));

		expect(windowA.rootView).toBeNull();
		expect(windowA.releasedViews).toEqual([asView(view)]);
		expect(windowB.rootView).toBe(asView(view));
	});

	it('does not release a window from its own root view when the same view is set again', () => {
		const window = new TestWindow();
		const view = createFakeView();

		window.setContent(asView(view));
		window.setContent(asView(view));

		expect(window.releasedViews).toEqual([]);
		expect(window.rootView).toBe(asView(view));
		expect(view._nativeWindow).toBe(window);
	});

	it('drops the back-reference of the root view it replaces', () => {
		const window = new TestWindow();
		const first = createFakeView();
		const second = createFakeView();

		window.setContent(asView(first));
		window.setContent(asView(second));

		expect(first._nativeWindow).toBeNull();
		expect(second._nativeWindow).toBe(window);
	});

	it('_releaseRootView does nothing on a window with no root view', () => {
		const window = new TestWindow();

		window._releaseRootView();

		expect(window.rootView).toBeUndefined();
		expect(window.releasedViews).toEqual([]);
	});
});

describe('View.getNativeWindow', () => {
	it('is undefined for a view that belongs to no tree', () => {
		expect(createRealView().getNativeWindow()).toBeUndefined();
	});

	it('resolves the window from any depth of the tree', () => {
		const window = new TestWindow();
		const root = createRealView();
		const child = createRealView();
		const grandChild = createRealView();
		root.addChild(asChild(child));
		child.addChild(asChild(grandChild));

		window._adoptRootView(asChild(root));

		expect(root.getNativeWindow()).toBe(window);
		expect(child.getNativeWindow()).toBe(window);
		expect(grandChild.getNativeWindow()).toBe(window);
	});

	it('resolves through a modal and through a modal nested in it', () => {
		const window = new TestWindow();
		const root = createRealView();
		window._adoptRootView(asChild(root));

		const modal = createRealView();
		modal._modalParent = root;
		const modalChild = createRealView();
		modal.addChild(asChild(modalChild));

		const nestedModal = createRealView();
		nestedModal._modalParent = modal;

		expect(modal.getNativeWindow()).toBe(window);
		expect(modalChild.getNativeWindow()).toBe(window);
		expect(nestedModal.getNativeWindow()).toBe(window);
	});

	it('follows a view re-parented into another window tree', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const rootA = createRealView();
		const rootB = createRealView();
		const moved = createRealView();
		rootA.addChild(asChild(moved));
		windowA._adoptRootView(asChild(rootA));
		windowB._adoptRootView(asChild(rootB));

		expect(moved.getNativeWindow()).toBe(windowA);

		rootA.removeChild(asChild(moved));
		rootB.addChild(asChild(moved));

		expect(moved.getNativeWindow()).toBe(windowB);
	});

	it('still resolves while the window is detached - the session is alive', () => {
		const window = new TestWindow();
		const root = createRealView();
		const child = createRealView();
		root.addChild(asChild(child));
		window._adoptRootView(asChild(root));

		window._detach();

		expect(window.state).toBe('detached');
		expect(child.getNativeWindow()).toBe(window);
	});

	it('is undefined once the window is closed', () => {
		const window = new TestWindow();
		const root = createRealView();
		const child = createRealView();
		root.addChild(asChild(child));
		window._adoptRootView(asChild(root));

		window._destroy();

		expect(child.getNativeWindow()).toBeUndefined();
		expect(root.getNativeWindow()).toBeUndefined();
	});

	it('reports the new owner after another window takes the root view over', () => {
		const windowA = new TestWindow();
		const windowB = new TestWindow();
		const root = createRealView();
		const child = createRealView();
		root.addChild(asChild(child));

		windowA._adoptRootView(asChild(root));
		windowB._adoptRootView(asChild(root));

		expect(windowA.rootView).toBeNull();
		expect(child.getNativeWindow()).toBe(windowB);
	});
});
