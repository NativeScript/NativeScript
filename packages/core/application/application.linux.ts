import { ApplicationCommon } from './application-common';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { isAppInBackground, setAppMainEntry, setToggleApplicationEventListenersCallback, setApplicationPropertiesCallback, setA11yUpdatePropertiesCallback } from './helpers-common';
import type { View } from '../ui/core/view';
import { setRootView } from './helpers-common';
import { CoreTypes } from '../core-types';
import { ensureGtk, getPrimaryWindow, getWindowLayoutDirection, getWindowOrientation, getWindowSystemAppearance, setPrimaryWindow } from './window-helper.linux';
import { connect } from '../utils/gtk.linux';
import { resolveModuleName, ModuleNameResolver } from '../module-name-resolver';
import { _setResolver } from '../module-name-resolver/helpers';
import { Screen, Device } from '../platform';
import type { NativeWindow, NativeWindowEventData, WindowOpenOptions } from '../native-window';
import { NativeWindowEvents } from '../native-window/native-window-interfaces';
import { LinuxNativeWindow, type LinuxWindowLifecycle } from '../native-window/native-window.linux';

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 768;

export class LinuxApplication extends ApplicationCommon {
	private _rootView: View;
	private _mirroredWindow: NativeWindow | null = null;
	// App-level state only changes when a set empties or fills.
	private _activeWindows = new Set<NativeWindow>();
	private _visibleWindows = new Set<NativeWindow>();
	private _backgroundTimer: ReturnType<typeof setTimeout> | null = null;
	private _exitNotified = false;
	// the runtime's event loop runs while windows are open
	private _loopHeld = false;

	private readonly _windowLifecycle: LinuxWindowLifecycle = {
		activated: (window, active) => this._setWindowActive(window, active),
		visibilityChanged: (window, visible) => this._setWindowVisible(window, visible),
		resized: (window) => this._onWindowResized(window),
		closed: (window) => this._onWindowClosed(window),
	};

	getRootView(): View {
		return this._rootView;
	}

	get linux() {
		return this;
	}

	run(entry?: string | NavigationEntry): void {
		if (this.started) {
			// Vite HMR dev boot: the placeholder already started the lifecycle, and the app's own
			// run() can come from a separate HTTP-ESM core realm the placeholder's patch can't
			// reach. Replace the placeholder root on the primary Application instead of throwing.
			const g = globalThis as any;
			if (g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__ || g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__) {
				if (entry) {
					const resolvedEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
					setTimeout(() => {
						try {
							const primaryApp = g.Application && typeof g.Application.resetRootView === 'function' ? g.Application : this;
							primaryApp.resetRootView(resolvedEntry);
						} catch (e) {
							if (__DEV__) console.warn('[app-linux] deferred resetRootView failed:', e);
						}
						delete g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
						delete g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
					}, 0);
				}
				return;
			}
			throw new Error('Application is already started.');
		}

		ensureGtk();
		this.setupLifecycleEvents();

		this.started = true;
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		// `ready` must precede the first window's content (and the legacy `launch`).
		this.notifyReady();

		const primaryWindow = this._createWindow(this._newGtkWindow(), true);
		this._resolveWindowContent(primaryWindow, { window: primaryWindow, isPrimary: true });
	}

	/**
	 * Opens a new top-level window.
	 * @param options `data` is handed to the window content resolver.
	 */
	openWindow(options?: WindowOpenOptions): void {
		const nativeWindow = this._createWindow(this._newGtkWindow(), false);
		this._resolveWindowContent(nativeWindow, { window: nativeWindow, isPrimary: false, data: options?.data });
	}

	resetRootView(entry?: NavigationEntry | string): void {
		super.resetRootView(entry);

		const primaryWindow = this.primaryWindow;
		if (primaryWindow) {
			primaryWindow.setContent(this.createRootView());
		}
	}

	/** No GtkApplication: windows run on the runtime's GLib loop. */
	getNativeApplication(): any {
		return null;
	}

	protected getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return getWindowOrientation(getPrimaryWindow());
	}

	protected getSystemAppearance(): 'dark' | 'light' | null {
		return getWindowSystemAppearance(getPrimaryWindow());
	}

	protected getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return getWindowLayoutDirection(getPrimaryWindow());
	}

	private _newGtkWindow(): any {
		const window: any = gtk_window_new();
		gtk_window_set_default_size(window, DEFAULT_WIDTH, DEFAULT_HEIGHT);
		gtk_window_set_title(window, g_get_application_name() || 'NativeScript');
		if (!this._loopHeld) {
			this._loopHeld = true;
			nativescript.ref();
		}
		return window;
	}

	// --- NativeWindow registry ---

	private _createWindow(window: any, isPrimary: boolean): LinuxNativeWindow {
		const nativeWindow = new LinuxNativeWindow(window, undefined, isPrimary);
		nativeWindow._attachNativeEvents(this._windowLifecycle);
		this._registerWindow(nativeWindow);
		nativeWindow._notifyEvent(NativeWindowEvents.attached);

		return nativeWindow;
	}

	protected _onWindowRegistered(nativeWindow: NativeWindow): void {
		if (nativeWindow.isPrimary) {
			this.mirrorPrimaryWindow(nativeWindow);
		}
	}

	protected _onPrimaryWindowPromoted(nativeWindow: NativeWindow): void {
		this.mirrorPrimaryWindow(nativeWindow);
	}

	// Screen metrics and the app root view follow the primary window.
	private mirrorPrimaryWindow(nativeWindow: NativeWindow): void {
		if (this._mirroredWindow === nativeWindow) {
			return;
		}

		this._mirroredWindow?.off(NativeWindowEvents.contentLoaded, this.onPrimaryWindowContentLoaded, this);
		this._mirroredWindow = nativeWindow;
		setPrimaryWindow(nativeWindow.linux?.window ?? null);
		nativeWindow.on(NativeWindowEvents.contentLoaded, this.onPrimaryWindowContentLoaded, this);

		if (nativeWindow.rootView && nativeWindow.rootView !== this._rootView) {
			this.adoptRootView(nativeWindow.rootView);
		}
	}

	private onPrimaryWindowContentLoaded(data: NativeWindowEventData): void {
		this.adoptRootView(data.window.rootView);
	}

	private adoptRootView(rootView: View): void {
		if (!rootView) {
			return;
		}

		this._rootView = rootView;
		setRootView(rootView);
		this.initRootView(rootView, this._mirroredWindow);
	}

	private _onWindowClosed(nativeWindow: LinuxNativeWindow): void {
		this._setWindowActive(nativeWindow, false);
		this._setWindowVisible(nativeWindow, false);

		nativeWindow._notifyEvent(NativeWindowEvents.close);
		this._unregisterWindow(nativeWindow);

		// No window was promoted to primary.
		if (this._mirroredWindow === nativeWindow) {
			this._mirroredWindow = null;
			this._rootView = null;
			setRootView(undefined);
		}

		if (this._getWindows().length === 0) {
			// No window can take activation now, so background before exit.
			this.settleBackground();
			this.notifyExit();
			if (this._loopHeld) {
				this._loopHeld = false;
				nativescript.unref();
			}
		}
	}

	private notifyExit(): void {
		if (this._exitNotified) {
			return;
		}
		this._exitNotified = true;
		this.notify({ eventName: this.exitEvent, object: this });
	}

	// --- Aggregate application state ---

	private _setWindowActive(nativeWindow: NativeWindow, active: boolean): void {
		if (active) {
			this._activeWindows.add(nativeWindow);
		} else {
			this._activeWindows.delete(nativeWindow);
		}

		if (this._activeWindows.size > 0) {
			if (this._backgroundTimer) {
				clearTimeout(this._backgroundTimer);
				this._backgroundTimer = null;
			}
			if (isAppInBackground()) {
				this.setInBackground(false);
			}
			return;
		}

		// Focus moving between our windows briefly leaves none active.
		if (!this._backgroundTimer && !isAppInBackground()) {
			this._backgroundTimer = setTimeout(() => this.settleBackground(), 0);
		}
	}

	private settleBackground(): void {
		if (this._backgroundTimer) {
			clearTimeout(this._backgroundTimer);
			this._backgroundTimer = null;
		}
		if (this._activeWindows.size === 0 && !isAppInBackground()) {
			this.setInBackground(true);
		}
	}

	private _setWindowVisible(nativeWindow: NativeWindow, visible: boolean): void {
		const wasVisible = this._visibleWindows.size > 0;
		if (visible) {
			this._visibleWindows.add(nativeWindow);
		} else {
			this._visibleWindows.delete(nativeWindow);
		}

		const isVisible = this._visibleWindows.size > 0;
		if (wasVisible === isVisible) {
			return;
		}

		if (!isVisible) {
			this.setSuspended(true);
		} else if (this.suspended) {
			this.setSuspended(false);
		}
	}

	private setupLifecycleEvents(): void {
		const settings: any = gtk_settings_get_default();
		if (settings) {
			const changed = () => {
				// reading the appearance raises a change when it moved
				for (const nativeWindow of this._getWindows()) {
					nativeWindow.systemAppearance();
				}
			};
			connect(settings, 'notify::gtk-application-prefer-dark-theme', changed, { args: 1 });
			connect(settings, 'notify::gtk-theme-name', changed, { args: 1 });
		}
	}

	// Desktop windows resize continuously, so @media re-evaluates on every resize.
	private _onWindowResized(nativeWindow: LinuxNativeWindow): void {
		// Read before orientationChanged resets the module resolver. Primary window only.
		const displayed = nativeWindow.isPrimary ? this._currentPageVariant() : null;

		if (!nativeWindow._updateOrientation()) {
			const newOrientation = nativeWindow.orientation();
			const rootView = nativeWindow.rootView;
			if (rootView) {
				this.orientationChanged(rootView, newOrientation);
			}

			if (nativeWindow.isPrimary) {
				// matchMedia listeners key off the application orientationChangedEvent.
				this.notify({
					eventName: this.orientationChangedEvent,
					object: this,
					linux: this.linux,
					newValue: newOrientation,
				} as never);
			}
		}

		// File-name screen qualifiers (main-page.minWH360.xml, .land/.port, etc.) are resolved at
		// navigation time. On desktop the window resizes continuously, so re-resolve the current
		// page's variant against the new metrics and hot-swap it when it crosses a qualifier
		// threshold. (Mobile never resizes continuously, so this is desktop specific.)
		this._swapQualifiedPageIfChanged(displayed);
	}

	// Resolves the current page's on-screen variant using the (pre-orientation-reset) global resolver.
	private _currentPageVariant(): { frame: any; moduleName: string; xml: string; js: string } | null {
		// Find the current frame from the root view.
		// Descends through nested frames to the deepest active one.
		let frame: any = this.getRootView();
		let guard = 0;
		while (frame && guard++ < 10) {
			const child = frame.currentPage?.content;
			if (child && typeof child.replacePage === 'function') {
				frame = child;
			} else {
				break;
			}
		}
		if (!frame || typeof frame.replacePage !== 'function') {
			return null;
		}
		const moduleName: string = frame?._currentEntry?.entry?.moduleName;
		if (!moduleName) {
			return null;
		}
		try {
			return { frame, moduleName, xml: resolveModuleName(moduleName, 'xml'), js: resolveModuleName(moduleName, '') };
		} catch (_e) {
			return null;
		}
	}

	private _swapQualifiedPageIfChanged(displayed: { frame: any; moduleName: string; xml: string; js: string } | null): void {
		if (!displayed) {
			return;
		}
		const { frame, moduleName } = displayed;
		// Resolve against the CURRENT (resized) metrics via a throwaway resolver. Independent of the
		// global resolver's state (which the orientation handler may or may not have reset).
		const ctx = {
			width: Screen.mainScreen.widthDIPs,
			height: Screen.mainScreen.heightDIPs,
			os: Device.os,
			deviceType: Device.deviceType,
		};
		let candidateXml: string, candidateJs: string;
		try {
			const probe = new ModuleNameResolver(ctx);
			candidateXml = probe.resolveModuleName(moduleName, 'xml');
			candidateJs = probe.resolveModuleName(moduleName, '');
		} catch (_e) {
			return;
		}
		if (candidateXml === displayed.xml && candidateJs === displayed.js) {
			return; // no qualifier boundary crossed. Keep the current page
		}

		// Variant changed: point the global resolver at the new metrics so Builder resolves the new
		// variant, flush the page cache (keyed by base module name) so the freshly-built
		// variant isn't overridden by a stale cached page, then swap.
		try {
			_setResolver(new ModuleNameResolver(ctx));
		} catch (_e) {
			return;
		}
		try {
			frame._flushPageCache?.();
		} catch (_e) {}
		try {
			frame.replacePage({ moduleName });
		} catch (_e) {}
	}
}

export const Application: LinuxApplication = new LinuxApplication();

function updateAccessibilityProperties(view: any): void {
	if (!view || !view.nativeViewProtected) {
		return;
	}
}

setA11yUpdatePropertiesCallback(updateAccessibilityProperties);

const applicationEvents: string[] = [Application.orientationChangedEvent, Application.systemAppearanceChangedEvent];
function toggleApplicationEventListeners(toAdd: boolean, callback: (args: any) => void) {
	for (const eventName of applicationEvents) {
		if (toAdd) {
			Application.on(eventName, callback);
		} else {
			Application.off(eventName, callback);
		}
	}
}
setToggleApplicationEventListenersCallback(toggleApplicationEventListeners);

setApplicationPropertiesCallback(() => {
	return {
		orientation: Application.orientation(),
		systemAppearance: Application.systemAppearance(),
	};
});

export * from './application-common';
export * from './application-interfaces';
