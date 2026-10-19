import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { View } from '../ui/core/view';
import { layout } from '../utils/layout-helper';

import { WindowsNativeWindow, type WindowsWindowLifecycle } from './native-window.windows';
import { NativeWindowEvents } from './native-window-interfaces';

// Real Microsoft.UI.Xaml enum values.
const WindowActivationState = { CodeActivated: 0, Deactivated: 1, PointerActivated: 2 };
const ElementTheme = { Default: 0, Light: 1, Dark: 2 };
const FlowDirection = { LeftToRight: 0, RightToLeft: 1 };

// Fake Window: events hold the assigned delegate; throws once closed.
function createXamlWindow(size = { Width: 1200, Height: 800 }) {
	const state = {
		closed: false,
		activateCalls: 0,
		closeCalls: 0,
		size,
		content: null as unknown,
		handlers: {} as Record<string, ((sender: unknown, args?: unknown) => void) | null>,
	};

	const guard = () => {
		if (state.closed) {
			throw new Error('RO_E_CLOSED');
		}
	};

	const window: Record<string, unknown> = {
		state,
		get Bounds() {
			guard();
			return state.size;
		},
		get Content() {
			guard();
			return state.content;
		},
		set Content(value: unknown) {
			guard();
			state.content = value;
		},
		Title: '',
		Activate() {
			guard();
			state.activateCalls++;
		},
		Close() {
			guard();
			state.closeCalls++;
		},
	};

	for (const name of ['Activated', 'VisibilityChanged', 'SizeChanged', 'Closed']) {
		Object.defineProperty(window, name, {
			get: () => state.handlers[name] ?? null,
			set: (value) => {
				guard();
				state.handlers[name] = value;
			},
		});
	}

	return window as typeof window & { state: typeof state };
}

type FakeXamlWindow = ReturnType<typeof createXamlWindow>;

function raise(window: FakeXamlWindow, event: string, args?: unknown): void {
	window.state.handlers[event]?.(window, args);
}

function asXamlWindow(window: FakeXamlWindow): Microsoft.UI.Xaml.Window {
	return window as unknown as Microsoft.UI.Xaml.Window;
}

function createFakeView(native: Record<string, unknown> = { ActualTheme: ElementTheme.Light, FlowDirection: FlowDirection.LeftToRight }) {
	return {
		cssClasses: new Set<string>(),
		style: {} as Record<string, unknown>,
		isLoaded: false,
		loadedCount: 0,
		unloadedCount: 0,
		_styleScope: null,
		nativeViewProtected: native,
		_setupAsRootView() {},
		_onCssStateChange() {},
		_onRootViewReset() {},
		_tearDownUI() {},
		callLoaded() {
			this.loadedCount++;
			this.isLoaded = true;
		},
		callUnloaded() {
			this.unloadedCount++;
			this.isLoaded = false;
		},
		_getRootModalViews() {
			return [];
		},
		_nativeWindow: null,
	};
}

function asView(view: ReturnType<typeof createFakeView>): View {
	return view as unknown as View;
}

function createLifecycle() {
	return {
		activated: vi.fn(),
		visibilityChanged: vi.fn(),
		resized: vi.fn(),
		closed: vi.fn(),
	} satisfies WindowsWindowLifecycle;
}

describe('WindowsNativeWindow', () => {
	beforeEach(() => {
		vi.stubGlobal('NSWinRT', { asDelegate: (fn: Function) => fn });
		vi.stubGlobal('Microsoft', {
			UI: {
				Xaml: {
					WindowActivationState,
					ElementTheme,
					FlowDirection,
					ApplicationTheme: { Light: 0, Dark: 1 },
					Application: { Current: { RequestedTheme: 0 } },
				},
				Windowing: {},
			},
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('exposes the wrapped Window through `windows`', () => {
		const xamlWindow = createXamlWindow();
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));

		expect(window.windows?.window).toBe(xamlWindow);
	});

	it('raises activate and deactivate from the Window activation state', () => {
		const xamlWindow = createXamlWindow();
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
		const lifecycle = createLifecycle();
		window._attachNativeEvents(lifecycle);

		const events: string[] = [];
		window.on(NativeWindowEvents.activate, () => events.push('activate'));
		window.on(NativeWindowEvents.deactivate, () => events.push('deactivate'));

		raise(xamlWindow, 'Activated', { WindowActivationState: WindowActivationState.PointerActivated });
		raise(xamlWindow, 'Activated', { WindowActivationState: WindowActivationState.Deactivated });
		raise(xamlWindow, 'Activated', { WindowActivationState: WindowActivationState.CodeActivated });

		expect(events).toEqual(['activate', 'deactivate', 'activate']);
		expect(lifecycle.activated.mock.calls.map((call) => call[1])).toEqual([true, false, true]);
	});

	it('raises foreground and background from the Window visibility', () => {
		const xamlWindow = createXamlWindow();
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
		const lifecycle = createLifecycle();
		window._attachNativeEvents(lifecycle);

		const events: string[] = [];
		window.on(NativeWindowEvents.foreground, () => events.push('foreground'));
		window.on(NativeWindowEvents.background, () => events.push('background'));

		raise(xamlWindow, 'VisibilityChanged', { Visible: false });
		raise(xamlWindow, 'VisibilityChanged', { Visible: true });

		expect(events).toEqual(['background', 'foreground']);
		expect(lifecycle.visibilityChanged.mock.calls.map((call) => call[1])).toEqual([false, true]);
	});

	it('reports the close without touching the closed Window', () => {
		const xamlWindow = createXamlWindow();
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
		const lifecycle = createLifecycle();
		window._attachNativeEvents(lifecycle);

		xamlWindow.state.closed = true;

		expect(() => raise(xamlWindow, 'Closed')).not.toThrow();
		expect(window._surfaceGone).toBe(true);
		expect(lifecycle.closed).toHaveBeenCalledWith(window);
	});

	it('stops forwarding native events once closed', () => {
		const xamlWindow = createXamlWindow();
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
		const lifecycle = createLifecycle();
		window._attachNativeEvents(lifecycle);

		const activated = xamlWindow.state.handlers.Activated;
		raise(xamlWindow, 'Closed');
		activated?.(xamlWindow, { WindowActivationState: WindowActivationState.PointerActivated });

		expect(lifecycle.activated).not.toHaveBeenCalled();
	});

	it('keeps reporting the last traits after the Window closed', () => {
		const xamlWindow = createXamlWindow({ Width: 600, Height: 900 });
		const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
		window._attachNativeEvents(createLifecycle());
		window.setContent(asView(createFakeView({ ActualTheme: ElementTheme.Dark, FlowDirection: FlowDirection.RightToLeft })));

		expect(window.orientation()).toBe('portrait');
		expect(window.systemAppearance()).toBe('dark');
		expect(window.layoutDirection()).toBe('rtl');

		xamlWindow.state.closed = true;
		raise(xamlWindow, 'Closed');

		expect(window.orientation()).toBe('portrait');
		expect(window.systemAppearance()).toBe('dark');
		expect(window.layoutDirection()).toBe('rtl');
	});

	describe('setContent', () => {
		it('installs the root view as the Window content and loads it', () => {
			const xamlWindow = createXamlWindow();
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			const view = createFakeView();

			window.setContent(asView(view));

			expect(xamlWindow.state.content).toBe(view.nativeViewProtected);
			expect(view.loadedCount).toBe(1);
		});

		it('raises contentLoaded before the view loads', () => {
			const window = new WindowsNativeWindow(asXamlWindow(createXamlWindow()));
			const view = createFakeView();
			let loadedAtContentLoaded: boolean;
			window.on(NativeWindowEvents.contentLoaded, () => (loadedAtContentLoaded = view.isLoaded));

			window.setContent(asView(view));

			expect(loadedAtContentLoaded).toBe(false);
		});

		it('activates the Window with its first content only', () => {
			const xamlWindow = createXamlWindow();
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));

			expect(xamlWindow.state.activateCalls).toBe(0);

			window.setContent(asView(createFakeView()));
			window.setContent(asView(createFakeView()));

			expect(xamlWindow.state.activateCalls).toBe(1);
		});

		it('unloads the content it replaces', () => {
			const xamlWindow = createXamlWindow();
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			const first = createFakeView();
			const second = createFakeView();

			window.setContent(asView(first));
			window.setContent(asView(second));

			expect(first.unloadedCount).toBe(1);
			expect(xamlWindow.state.content).toBe(second.nativeViewProtected);
		});

		it('moves a view out of the window it was in', () => {
			const firstXamlWindow = createXamlWindow();
			const secondXamlWindow = createXamlWindow();
			const first = new WindowsNativeWindow(asXamlWindow(firstXamlWindow));
			const second = new WindowsNativeWindow(asXamlWindow(secondXamlWindow));
			const view = createFakeView();

			first.setContent(asView(view));
			second.setContent(asView(view));

			expect(firstXamlWindow.state.content).toBeNull();
			expect(secondXamlWindow.state.content).toBe(view.nativeViewProtected);
			expect(first.rootView).toBeNull();
			// Moved, not torn down.
			expect(view.unloadedCount).toBe(0);
			expect(view.loadedCount).toBe(1);
		});
	});

	describe('close', () => {
		it('closes a secondary Window', () => {
			const xamlWindow = createXamlWindow();
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));

			window.close();

			expect(xamlWindow.state.closeCalls).toBe(1);
		});

		it('refuses to close the primary Window', () => {
			const xamlWindow = createXamlWindow();
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow), undefined, true);
			const log = vi.spyOn(console, 'log').mockImplementation(() => {});

			window.close();

			expect(xamlWindow.state.closeCalls).toBe(0);
			log.mockRestore();
		});
	});

	describe('media query context', () => {
		beforeEach(() => {
			vi.spyOn(layout, 'toDevicePixels').mockImplementation((value: number) => value * 2);
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('measures the window in application device pixels', () => {
			const window = new WindowsNativeWindow(asXamlWindow(createXamlWindow({ Width: 500, Height: 900 })));
			window._attachNativeEvents(createLifecycle());
			window.setContent(asView(createFakeView({ ActualTheme: ElementTheme.Dark, FlowDirection: FlowDirection.LeftToRight })));

			expect(window._getMediaQueryContext()).toEqual({ width: 1000, height: 1800, orientation: 'portrait', systemAppearance: 'dark' });
		});

		it('reads the settled size rather than the native Window on every match', () => {
			vi.useFakeTimers();
			const xamlWindow = createXamlWindow({ Width: 500, Height: 900 });
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			window._attachNativeEvents(createLifecycle());

			xamlWindow.state.size = { Width: 1200, Height: 800 };
			expect(window._getMediaQueryContext().orientation).toBe('portrait');

			raise(xamlWindow, 'SizeChanged');
			vi.runAllTimers();

			expect(window._getMediaQueryContext()).toMatchObject({ width: 2400, height: 1600, orientation: 'landscape' });
		});

		it('keeps measuring the last size once the Window closed', () => {
			const xamlWindow = createXamlWindow({ Width: 500, Height: 900 });
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			window._attachNativeEvents(createLifecycle());

			xamlWindow.state.closed = true;
			raise(xamlWindow, 'Closed');

			expect(window._getMediaQueryContext()).toMatchObject({ width: 1000, height: 1800 });
		});
	});

	describe('resize', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('reports a resize once the size settles', () => {
			const xamlWindow = createXamlWindow({ Width: 1200, Height: 800 });
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			const lifecycle = createLifecycle();
			window._attachNativeEvents(lifecycle);

			xamlWindow.state.size = { Width: 1000, Height: 800 };
			raise(xamlWindow, 'SizeChanged');
			xamlWindow.state.size = { Width: 900, Height: 800 };
			raise(xamlWindow, 'SizeChanged');

			expect(lifecycle.resized).not.toHaveBeenCalled();

			vi.runAllTimers();

			expect(lifecycle.resized).toHaveBeenCalledTimes(1);
		});

		it('ignores a SizeChanged that leaves the size as it was', () => {
			const xamlWindow = createXamlWindow({ Width: 1200, Height: 800 });
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			const lifecycle = createLifecycle();
			window._attachNativeEvents(lifecycle);

			raise(xamlWindow, 'SizeChanged');
			vi.runAllTimers();

			expect(lifecycle.resized).not.toHaveBeenCalled();
		});

		it('flips the orientation when the aspect ratio does', () => {
			const xamlWindow = createXamlWindow({ Width: 1200, Height: 800 });
			const window = new WindowsNativeWindow(asXamlWindow(xamlWindow));
			const changes: string[] = [];
			window.on(NativeWindowEvents.orientationChanged, (args) => changes.push(args.newValue));

			expect(window.orientation()).toBe('landscape');
			expect(window._updateOrientation()).toBe(false);

			xamlWindow.state.size = { Width: 600, Height: 800 };

			expect(window._updateOrientation()).toBe(true);
			expect(changes).toEqual(['portrait']);
		});
	});
});
