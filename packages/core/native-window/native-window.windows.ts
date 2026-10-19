import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { CoreTypes } from '../core-types';
import type { MediaQueryContext } from '../media-query-list';
import { layout } from '../utils/layout-helper';
import { getAutoSystemAppearanceChanged } from '../application/helpers-common';
import { getWindowBounds, getWindowLayoutDirection, getWindowOrientation, getWindowSystemAppearance, onPrimaryWindowContentChanged, releaseWindow, setWindowTitleBarAppearance } from '../application/window-helper.windows';
import { NativeWindow } from './native-window-common';
import { NativeWindowEvents } from './native-window-interfaces';
import type { WindowRole } from './window-base';

/**
 * Native window lifecycle callbacks, implemented by the application.
 */
export interface WindowsWindowLifecycle {
	activated(window: WindowsNativeWindow, active: boolean): void;
	visibilityChanged(window: WindowsNativeWindow, visible: boolean): void;
	resized(window: WindowsNativeWindow): void;
	closed(window: WindowsNativeWindow): void;
}

// Wait for a resize drag to settle.
const RESIZE_SETTLE_MS = 80;

/**
 * Windows implementation of NativeWindow.
 * Wraps a WinUI 3 Microsoft.UI.Xaml.Window.
 */
export class WindowsNativeWindow extends NativeWindow {
	private _window: Microsoft.UI.Xaml.Window;
	private _lifecycle: WindowsWindowLifecycle;
	private _contentView: View;
	private _shown = false;
	// Held so the delegates stay alive until close.
	private _activatedHandler: unknown;
	private _visibilityHandler: unknown;
	private _closedHandler: unknown;
	private _sizeChangedHandler: unknown;
	private _resizeTimer: ReturnType<typeof setTimeout> | null = null;
	private _lastWidth = NaN;
	private _lastHeight = NaN;

	constructor(window: Microsoft.UI.Xaml.Window, id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);
		this._window = window;
	}

	get windows() {
		const window = this._window;
		if (!window) {
			return undefined;
		}
		return { window };
	}

	/**
	 * @internal – subscribe to the native window's lifecycle.
	 */
	_attachNativeEvents(lifecycle: WindowsWindowLifecycle): void {
		const window = this._window;
		if (!window || this._lifecycle) {
			return;
		}
		this._lifecycle = lifecycle;

		const bounds = getWindowBounds(window);
		this._lastWidth = bounds?.Width ?? NaN;
		this._lastHeight = bounds?.Height ?? NaN;

		this._activatedHandler = NSWinRT.asDelegate((_sender: unknown, args: Microsoft.UI.Xaml.WindowActivatedEventArgs) => {
			const active = args?.WindowActivationState !== Microsoft.UI.Xaml.WindowActivationState.Deactivated;
			this._notifyEvent(active ? NativeWindowEvents.activate : NativeWindowEvents.deactivate);
			this._lifecycle?.activated(this, active);
		});
		window.Activated = this._activatedHandler as never;

		this._visibilityHandler = NSWinRT.asDelegate((_sender: unknown, args: Microsoft.UI.Xaml.WindowVisibilityChangedEventArgs) => {
			const visible = !!args?.Visible;
			this._notifyEvent(visible ? NativeWindowEvents.foreground : NativeWindowEvents.background);
			this._lifecycle?.visibilityChanged(this, visible);
		});
		window.VisibilityChanged = this._visibilityHandler as never;

		this._sizeChangedHandler = NSWinRT.asDelegate(() => this._onSizeChanged());
		window.SizeChanged = this._sizeChangedHandler as never;

		this._closedHandler = NSWinRT.asDelegate(() => {
			const lifecycle = this._lifecycle;
			this._surfaceGone = true;
			this._detachNativeEvents();
			lifecycle?.closed(this);
		});
		window.Closed = this._closedHandler as never;
	}

	private _detachNativeEvents(): void {
		if (this._resizeTimer) {
			clearTimeout(this._resizeTimer);
			this._resizeTimer = null;
		}

		const window = this._window;
		if (window && !this._surfaceGone) {
			window.Activated = null;
			window.VisibilityChanged = null;
			window.SizeChanged = null;
			window.Closed = null;
		}

		this._activatedHandler = null;
		this._visibilityHandler = null;
		this._sizeChangedHandler = null;
		this._closedHandler = null;
		this._lifecycle = null;
	}

	private _onSizeChanged(): void {
		if (this._resizeTimer) {
			clearTimeout(this._resizeTimer);
		}
		this._resizeTimer = setTimeout(() => {
			this._resizeTimer = null;
			const bounds = getWindowBounds(this._window);
			const width = bounds?.Width ?? NaN;
			const height = bounds?.Height ?? NaN;
			if (!(width > 0) || !(height > 0)) {
				return;
			}
			if (Math.abs(width - this._lastWidth) < 1 && Math.abs(height - this._lastHeight) < 1) {
				return;
			}
			this._lastWidth = width;
			this._lastHeight = height;
			this._lifecycle?.resized(this);
		}, RESIZE_SETTLE_MS);
	}

	/**
	 * @internal – uses the settled size to avoid a native read per view.
	 */
	_getMediaQueryContext(): MediaQueryContext | undefined {
		let width = this._lastWidth;
		let height = this._lastHeight;
		if (!(width > 0) || !(height > 0)) {
			if (this._surfaceGone) {
				return undefined;
			}
			const bounds = getWindowBounds(this._window);
			if (!bounds) {
				return undefined;
			}
			width = this._lastWidth = bounds.Width;
			height = this._lastHeight = bounds.Height;
		}

		return {
			// Same density as query lengths, so the comparison is in DIPs.
			width: layout.toDevicePixels(width),
			height: layout.toDevicePixels(height),
			orientation: width === height ? 'unknown' : width > height ? 'landscape' : 'portrait',
			systemAppearance: this._systemAppearance ?? this._getSystemAppearance(),
		};
	}

	/**
	 * @internal – re-read the orientation after a resize.
	 * @returns whether the orientation changed.
	 */
	_updateOrientation(): boolean {
		const previous = this._orientation;
		this._setOrientation(this._getOrientation());

		return previous !== this._orientation;
	}

	setContent(content: View | NavigationEntry | string): void {
		super.setContent(content);

		// After contentLoaded so initRootView runs first; moved views stay loaded.
		const rootView = this._rootView;
		if (rootView && !rootView.isLoaded) {
			rootView.callLoaded();
		}

		// Stay hidden until there is content to show.
		if (!this._shown && this._window) {
			this._shown = true;
			this._window.Activate();
		}
	}

	protected _setNativeContent(view: View): void {
		const window = this._window;
		if (!window) {
			throw new Error('NativeWindow: Window is no longer available.');
		}

		const previous = this._contentView;
		if (previous && previous !== view && previous.isLoaded) {
			previous.callUnloaded();
		}

		this._contentView = view;
		window.Content = view.nativeViewProtected;

		if (this.isPrimary) {
			onPrimaryWindowContentChanged();
		}

		const appearance = this.systemAppearance();
		if (appearance) {
			setWindowTitleBarAppearance(window, appearance);
		}
	}

	protected _onReleaseRootView(rootView: View): void {
		if (this._contentView === rootView) {
			this._contentView = null;
			if (this._window && !this._surfaceGone) {
				this._window.Content = null;
			}
		}
	}

	_setSystemAppearance(value: 'dark' | 'light'): void {
		super._setSystemAppearance(value);

		if (this._window && getAutoSystemAppearanceChanged()) {
			setWindowTitleBarAppearance(this._window, value);
		}
	}

	/**
	 * Close this window.
	 */
	close(): void {
		if (this.isPrimary) {
			console.log('NativeWindow: Cannot close the primary window.');
			return;
		}

		this._window?.Close();
	}

	// --- Platform getters ---

	// A closed Window throws on access, so report the last values.

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		if (this._surfaceGone) {
			return this._orientation ?? 'unknown';
		}
		return getWindowOrientation(this._window);
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		if (this._surfaceGone) {
			return this._systemAppearance ?? null;
		}
		return getWindowSystemAppearance(this._window);
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		if (this._surfaceGone) {
			return this._layoutDirection ?? null;
		}
		return getWindowLayoutDirection(this._window);
	}

	protected _onDestroy(): void {
		this._detachNativeEvents();
		super._onDestroy();
		this._contentView = null;
		if (this._window) {
			releaseWindow(this._window);
		}
		this._window = null;
	}
}
