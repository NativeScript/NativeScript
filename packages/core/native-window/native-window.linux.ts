import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { CoreTypes } from '../core-types';
import type { MediaQueryContext } from '../media-query-list';
import { getWindowLayoutDirection, getWindowOrientation, getWindowSize, getWindowSystemAppearance } from '../application/window-helper.linux';
import { connect } from '../utils/gtk.linux';
import { NativeWindow } from './native-window-common';
import { NativeWindowEvents } from './native-window-interfaces';
import type { WindowRole } from './window-base';

/**
 * Native window lifecycle callbacks, implemented by the application.
 */
export interface LinuxWindowLifecycle {
	activated(window: LinuxNativeWindow, active: boolean): void;
	visibilityChanged(window: LinuxNativeWindow, visible: boolean): void;
	resized(window: LinuxNativeWindow): void;
	closed(window: LinuxNativeWindow): void;
}

// Wait for a resize drag to settle.
const RESIZE_SETTLE_MS = 80;

/**
 * Linux implementation of NativeWindow, wrapping a GtkWindow.
 */
export class LinuxNativeWindow extends NativeWindow {
	private _window: any;
	private _lifecycle: LinuxWindowLifecycle;
	private _contentView: View;
	private _shown = false;
	private _disconnect: (() => void)[] = [];
	private _resizeTimer: ReturnType<typeof setTimeout> | null = null;
	private _lastWidth = NaN;
	private _lastHeight = NaN;

	constructor(window: any, id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);
		this._window = window;
	}

	get linux() {
		const window = this._window;
		return window ? { window } : undefined;
	}

	/**
	 * @internal – subscribe to the native window's lifecycle.
	 */
	_attachNativeEvents(lifecycle: LinuxWindowLifecycle): void {
		const window = this._window;
		if (!window || this._lifecycle) {
			return;
		}
		this._lifecycle = lifecycle;

		this._disconnect.push(
			connect(
				window,
				'notify::is-active',
				() => {
					const active = !!gtk_window_is_active(window);
					this._notifyEvent(active ? NativeWindowEvents.activate : NativeWindowEvents.deactivate);
					this._lifecycle?.activated(this, active);
				},
				{ args: 1 },
			),
			connect(window, 'map', () => this._setVisible(true)),
			connect(window, 'unmap', () => this._setVisible(false)),
			connect(window, 'notify::default-width', () => this._onSizeChanged(), { args: 1 }),
			connect(window, 'notify::default-height', () => this._onSizeChanged(), { args: 1 }),
			connect(window, 'notify::maximized', () => this._onSizeChanged(), { args: 1 }),
			connect(window, 'notify::fullscreened', () => this._onSizeChanged(), { args: 1 }),
			connect(
				window,
				'close-request',
				() => {
					const lifecycle = this._lifecycle;
					this._surfaceGone = true;
					this._detachNativeEvents();
					lifecycle?.closed(this);
					// let GTK destroy the window
					return false;
				},
				{ returnsBool: true },
			),
		);
	}

	private _setVisible(visible: boolean): void {
		this._notifyEvent(visible ? NativeWindowEvents.foreground : NativeWindowEvents.background);
		this._lifecycle?.visibilityChanged(this, visible);
	}

	private _detachNativeEvents(): void {
		if (this._resizeTimer) {
			clearTimeout(this._resizeTimer);
			this._resizeTimer = null;
		}
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		this._lifecycle = null;
	}

	private _onSizeChanged(): void {
		if (this._resizeTimer) {
			clearTimeout(this._resizeTimer);
		}
		this._resizeTimer = setTimeout(() => {
			this._resizeTimer = null;
			const size = getWindowSize(this._window);
			if (!size || (Math.abs(size.width - this._lastWidth) < 1 && Math.abs(size.height - this._lastHeight) < 1)) {
				return;
			}
			this._lastWidth = size.width;
			this._lastHeight = size.height;
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
			const size = !this._surfaceGone && getWindowSize(this._window);
			if (!size) {
				return undefined;
			}
			width = this._lastWidth = size.width;
			height = this._lastHeight = size.height;
		}
		return {
			width,
			height,
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

		const rootView = this._rootView;
		if (rootView && !rootView.isLoaded) {
			rootView.callLoaded();
		}

		// stay hidden until there is content to show
		if (!this._shown && this._window) {
			this._shown = true;
			gtk_window_present(this._window);
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
		gtk_window_set_child(window, view.nativeViewProtected);
	}

	protected _onReleaseRootView(rootView: View): void {
		if (this._contentView === rootView) {
			this._contentView = null;
			if (this._window && !this._surfaceGone) {
				gtk_window_set_child(this._window, null);
			}
		}
	}

	close(): void {
		if (this._window && !this._surfaceGone) {
			gtk_window_close(this._window);
		}
	}

	// A destroyed window can't be queried, so report the last values.

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return this._surfaceGone ? (this._orientation ?? 'unknown') : getWindowOrientation(this._window);
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		return this._surfaceGone ? (this._systemAppearance ?? null) : getWindowSystemAppearance(this._window);
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return this._surfaceGone ? (this._layoutDirection ?? null) : getWindowLayoutDirection(this._window);
	}

	protected _onDestroy(): void {
		this._detachNativeEvents();
		super._onDestroy();
		this._contentView = null;
		this._window = null;
	}
}
