import { CoreTypes } from '../core-types';
import { CSSUtils } from '../css/system-classes';
import { Device, Screen } from '../platform';
import { profile } from '../profiling';
import { Trace } from '../trace';
import { clearResolverCache, prepareAppForModuleResolver, _setResolver } from '../module-name-resolver/helpers';
import { Builder } from '../ui/builder';
import * as bindableResources from '../ui/core/bindable/bindable-resources';
import type { View } from '../ui/core/view';
import type { Frame } from '../ui/frame';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { StyleScope } from '../ui/styling/style-scope';
import type { AndroidApplication as AndroidApplicationType, iOSApplication as iOSApplicationType } from '.';
import type { ApplicationEventData, CssChangedEventData, DiscardedErrorEventData, FontScaleChangedEventData, InitRootViewEventData, LaunchEventData, LoadAppCSSEventData, NativeScriptError, OrientationChangedEventData, SystemAppearanceChangedEventData, LayoutDirectionChangedEventData, UnhandledErrorEventData, SceneOpenURLContextsEventData, SceneContinueUserActivityEventData, ScenePerformActionForShortcutItemEventData } from './application-interfaces';
import { applyAccessibilityCssToRoot, readyInitAccessibilityCssHelper, readyInitFontScale } from '../accessibility/accessibility-common';
import { getActiveWindow, getAppMainEntry, getAutoSystemAppearanceChanged, isAppInBackground, setActiveWindow, setAppInBackground, setAppMainEntry, setAutoSystemAppearanceChanged } from './helpers-common';
import { getNativeScriptGlobals } from '../globals/global-utils';
import { SDK_VERSION } from '../utils/constants';
import type { NativeWindow, NativeWindowEventData, PrimaryWindowChangedEventData, WindowBase, WindowCloseEventData, WindowContentRequest, WindowContentResolver, WindowLayoutDirectionChangedEventData, WindowOpenEventData, WindowOpenOptions, WindowOrientationChangedEventData, WindowRole, WindowSystemAppearanceChangedEventData } from '../native-window';
import { NativeWindowEvents, WindowEvents } from '../native-window/native-window-interfaces';

const ORIENTATION_CSS_CLASSES = CSSUtils.ORIENTATION_CSS_CLASSES;
const SYSTEM_APPEARANCE_CSS_CLASSES = CSSUtils.SYSTEM_APPEARANCE_CSS_CLASSES;
const LAYOUT_DIRECTION_CSS_CLASSES = CSSUtils.LAYOUT_DIRECTION_CSS_CLASSES;

const globalEvents = getNativeScriptGlobals().events;

// Scene lifecycle event names
/**
 * @deprecated Use `NativeWindowEvents` from `@nativescript/core/native-window` instead.
 */
export const SceneEvents = {
	/** @deprecated Use `NativeWindowEvents.sceneWillConnect` instead. */
	sceneWillConnect: 'sceneWillConnect',
	/** @deprecated Use `NativeWindowEvents.sceneDidActivate` instead. */
	sceneDidActivate: 'sceneDidActivate',
	/** @deprecated Use `NativeWindowEvents.sceneWillResignActive` instead. */
	sceneWillResignActive: 'sceneWillResignActive',
	/** @deprecated Use `NativeWindowEvents.sceneWillEnterForeground` instead. */
	sceneWillEnterForeground: 'sceneWillEnterForeground',
	/** @deprecated Use `NativeWindowEvents.sceneDidEnterBackground` instead. */
	sceneDidEnterBackground: 'sceneDidEnterBackground',
	/** @deprecated Use `NativeWindowEvents.sceneDidDisconnect` instead. */
	sceneDidDisconnect: 'sceneDidDisconnect',
	/** @deprecated Use the Application 'windowOpen' event and NativeWindow.setContent() instead. */
	sceneContentSetup: 'sceneContentSetup',
};

export type SceneEventName = (typeof SceneEvents)[keyof typeof SceneEvents];

// helper interface to correctly type Application event handlers
interface ApplicationEvents {
	off(eventNames: string, callback?: any, thisArg?: any): void;
	notify<T = ApplicationEventData>(eventData: T): void;
	hasListeners(eventName: string): boolean;

	on(eventNames: string, callback: (args: ApplicationEventData) => void, thisArg?: any): void;
	/**
	 * This event is raised when application css is changed.
	 */
	on(event: 'cssChanged', callback: (args: CssChangedEventData) => void, thisArg?: any): void;

	/**
	 * Event raised then livesync operation is performed.
	 */
	on(event: 'livesync', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised on application launchEvent.
	 */
	on(event: 'launch', callback: (args: LaunchEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised once the JS context is initialized.
	 */
	on(event: 'ready', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised after the application has performed most of its startup actions.
	 * Its intent is to be suitable for measuring app startup times.
	 * @experimental
	 */
	on(event: 'displayed', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the Application is suspended.
	 */
	on(event: 'suspend', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the Application is resumed after it has been suspended.
	 */
	on(event: 'resume', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the Application is about to exit.
	 *
	 * On Android it is raised when the last window closes; the process may stay alive.
	 * On iOS it is raised when the process itself terminates.
	 */
	on(event: 'exit', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when there is low memory on the target device.
	 */
	on(event: 'lowMemory', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when an uncaught error occurs while the application is running.
	 */
	on(event: 'uncaughtError', callback: (args: UnhandledErrorEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when an discarded error occurs while the application is running.
	 */
	on(event: 'discardedError', callback: (args: DiscardedErrorEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the orientation of the application changes.
	 */
	on(event: 'orientationChanged', callback: (args: OrientationChangedEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the operating system appearance changes
	 * between light and dark theme (for Android);
	 * between light and dark mode (for iOS) and vice versa.
	 */
	on(event: 'systemAppearanceChanged', callback: (args: SystemAppearanceChangedEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when the operating system layout direction changes
	 * between ltr and rtl.
	 */
	on(event: 'layoutDirectionChanged', callback: (args: LayoutDirectionChangedEventData) => void, thisArg?: any): void;

	on(event: 'fontScaleChanged', callback: (args: FontScaleChangedEventData) => void, thisArg?: any): void;

	on(event: 'windowOpen', callback: (args: WindowOpenEventData) => void, thisArg?: any): void;
	on(event: 'windowClose', callback: (args: WindowCloseEventData) => void, thisArg?: any): void;
	on(event: 'primaryWindowChanged', callback: (args: PrimaryWindowChangedEventData) => void, thisArg?: any): void;

	on(event: 'sceneOpenURLContexts', callback: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	on(event: 'sceneContinueUserActivity', callback: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	on(event: 'scenePerformActionForShortcutItem', callback: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;
}

export class ApplicationCommon {
	/**
	 * @deprecated Use the 'ready' event for application initialization and Application.setWindowContentResolver() to provide window UI. 'launch' continues to fire before the first window's content is created, and its 'root' property is still honored, for backwards compatibility. It never fires for additional windows. In a scene-based app it fires with the first window's content, so a background launch that connects no scene does not raise it.
	 */
	readonly launchEvent = 'launch';
	/**
	 * Raised once per JS context, as soon as the context is initialized. It is never deferred,
	 * so it also fires on a background launch where no window is created.
	 *
	 * Guaranteed ordering: `ready` -> `windowOpen` -> raw connect/create events -> content
	 * resolution (the legacy `launch` bridge runs here, for the first window only) ->
	 * `contentLoaded` -> `activate`/`displayed`.
	 */
	readonly readyEvent = 'ready';
	/**
	 * Reflects whole-app state: with multiple windows it is raised once the app itself is
	 * no longer in the foreground, not when an individual window backgrounds. Listen on a
	 * NativeWindow for per-window state.
	 */
	readonly suspendEvent = 'suspend';
	readonly displayedEvent = 'displayed';
	readonly backgroundEvent = 'background';
	readonly foregroundEvent = 'foreground';
	readonly resumeEvent = 'resume';
	/**
	 * On Android, raised when the last window closes; the process may stay alive.
	 * On iOS, raised when the process itself terminates.
	 */
	readonly exitEvent = 'exit';
	readonly lowMemoryEvent = 'lowMemory';
	readonly uncaughtErrorEvent = 'uncaughtError';
	readonly discardedErrorEvent = 'discardedError';
	readonly orientationChangedEvent = 'orientationChanged';
	readonly systemAppearanceChangedEvent = 'systemAppearanceChanged';
	readonly layoutDirectionChangedEvent = 'layoutDirectionChanged';
	readonly fontScaleChangedEvent = 'fontScaleChanged';
	readonly livesyncEvent = 'livesync';
	readonly loadAppCssEvent = 'loadAppCss';
	readonly cssChangedEvent = 'cssChanged';
	readonly initRootViewEvent = 'initRootView';
	readonly windowOpenEvent = WindowEvents.windowOpen;
	readonly windowCloseEvent = WindowEvents.windowClose;
	readonly primaryWindowChangedEvent = WindowEvents.primaryWindowChanged;

	// Expose statically for backwards compat on AndroidApplication.on etc.
	/**
	 * @deprecated Use `Application.android.on()` instead.
	 */
	static on: ApplicationEvents['on'] = globalEvents.on.bind(globalEvents);
	/**
	 * @deprecated Use `Application.android.once()` instead.
	 */
	static once: ApplicationEvents['on'] = globalEvents.once.bind(globalEvents);
	/**
	 * @deprecated Use `Application.android.off()` instead.
	 */
	static off: ApplicationEvents['off'] = globalEvents.off.bind(globalEvents);
	/**
	 * @deprecated Use `Application.android.notify()` instead.
	 */
	static notify: ApplicationEvents['notify'] = globalEvents.notify.bind(globalEvents);
	/**
	 * @deprecated Use `Application.android.hasListeners()` instead.
	 */
	static hasListeners: ApplicationEvents['hasListeners'] = globalEvents.hasListeners.bind(globalEvents);

	// Application events go through the global events.
	on: ApplicationEvents['on'] = globalEvents.on.bind(globalEvents);
	once: ApplicationEvents['on'] = globalEvents.once.bind(globalEvents);
	off: ApplicationEvents['off'] = globalEvents.off.bind(globalEvents);
	notify: ApplicationEvents['notify'] = globalEvents.notify.bind(globalEvents);
	hasListeners: ApplicationEvents['hasListeners'] = globalEvents.hasListeners.bind(globalEvents);

	private _orientation: 'portrait' | 'landscape' | 'unknown';
	private _systemAppearance: 'dark' | 'light' | null;
	private _layoutDirection: CoreTypes.LayoutDirectionType | null;
	private _inBackground: boolean = false;
	private _suspended: boolean = false;
	private _cssFile = './app.css';
	private _readyNotified = false;
	private _appCssLoaded = false;
	private _launchBridgeConsumed = false;
	private _windowContentResolver: WindowContentResolver | null = null;

	protected mainEntry: NavigationEntry;

	public started = false;
	/**
	 * Boolean to enable/disable systemAppearanceChanged
	 */
	public get autoSystemAppearanceChanged(): boolean {
		return getAutoSystemAppearanceChanged();
	}

	public set autoSystemAppearanceChanged(value: boolean) {
		setAutoSystemAppearanceChanged(value);
	}

	/**
	 * @internal - should not be constructed by the user.
	 */
	constructor() {
		getNativeScriptGlobals().appInstanceReady = true;

		global.__onUncaughtError = (error: NativeScriptError) => {
			this.notify({
				eventName: this.uncaughtErrorEvent,
				object: this,
				android: error,
				ios: error,
				error: error,
			} as DiscardedErrorEventData);
		};

		global.__onDiscardedError = (error: NativeScriptError) => {
			this.notify({
				eventName: this.discardedErrorEvent,
				object: this,
				error: error,
			} as DiscardedErrorEventData);
		};

		global.__onLiveSync = (context?: ModuleContext) => {
			if (this.suspended) {
				return;
			}

			const rootView = this.getRootView();
			this.livesync(rootView, context);
		};
	}

	/**
	 * @internal
	 */
	livesync(rootView: View, context?: ModuleContext) {
		this.notify({ eventName: this.livesyncEvent, object: this });
		const liveSyncCore = global.__onLiveSyncCore;
		let reapplyAppStyles = false;

		// ModuleContext is available only for Hot Module Replacement
		if (context && context.path) {
			const styleExtensions = ['css', 'scss'];
			const appStylesFullFileName = this.getCssFileName();
			const appStylesFileName = appStylesFullFileName.substring(0, appStylesFullFileName.lastIndexOf('.') + 1);
			reapplyAppStyles = styleExtensions.some((ext) => context.path === appStylesFileName.concat(ext));
		}

		// Handle application styles
		if (rootView && reapplyAppStyles) {
			rootView._onCssStateChange();
		} else if (liveSyncCore) {
			liveSyncCore(context);
		}
	}

	/**
	 * Applies the the `newCssClass` to the `rootView` and removes all other css classes from `cssClasses`
	 * previously applied to the `rootView`.
	 * @param rootView
	 * @param cssClasses
	 * @param newCssClass
	 * @param skipCssUpdate
	 */
	applyCssClass(rootView: View, cssClasses: string[], newCssClass: string, skipCssUpdate: boolean = false): void {
		if (!rootView.cssClasses.has(newCssClass)) {
			cssClasses.forEach((cssClass) => this.removeCssClass(rootView, cssClass));
			this.addCssClass(rootView, newCssClass);
			this.increaseStyleScopeApplicationCssSelectorVersion(rootView);

			if (!skipCssUpdate) {
				rootView._onCssStateChange();
			}

			if (Trace.isEnabled()) {
				const rootCssClasses = Array.from(rootView.cssClasses);
				Trace.write(`Applying root css class: ${newCssClass}. rootView css classes: ${rootCssClasses.join(' ')}`, Trace.categories.Style);
			}
		}
	}

	private addCssClass(rootView: View, cssClass: string) {
		CSSUtils.pushToSystemCssClasses(cssClass);
		rootView.cssClasses.add(cssClass);
	}

	private removeCssClass(rootView: View, cssClass: string) {
		CSSUtils.removeSystemCssClass(cssClass);
		rootView.cssClasses.delete(cssClass);
	}

	/**
	 * Same as {@link applyCssClass}, minus the system class list: window-scoped classes
	 * must not leak into it, because it seeds every window's root view.
	 */
	private applyWindowScopedCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
		if (rootView.cssClasses.has(newCssClass)) {
			return;
		}

		cssClasses.forEach((cssClass) => rootView.cssClasses.delete(cssClass));
		rootView.cssClasses.add(newCssClass);
		this.increaseStyleScopeApplicationCssSelectorVersion(rootView);
	}

	/**
	 * The modal registry is process-wide, so only the modals presented over this root
	 * view may follow its window-scoped classes.
	 */
	private getOwnedModalViews(rootView: View): View[] {
		return (<Array<View>>rootView._getRootModalViews()).filter((modalView) => modalView._getRootModalHost() === rootView);
	}

	private increaseStyleScopeApplicationCssSelectorVersion(rootView: View) {
		const styleScope: StyleScope = rootView._styleScope ?? (rootView as Frame)?.currentPage?._styleScope;

		if (styleScope) {
			styleScope._increaseApplicationCssSelectorVersion();
		}
	}

	private setRootViewCSSClasses(rootView: View, window?: NativeWindow): void {
		const platform = Device.os.toLowerCase();
		const deviceType = Device.deviceType.toLowerCase();
		const orientation = window ? window.orientation() : this.orientation();
		const systemAppearance = window ? window.systemAppearance() : this.systemAppearance();
		const layoutDirection = window ? window.layoutDirection() : this.layoutDirection();

		if (platform) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${platform}`);

			// SDK Version CSS classes
			// Add exact version class (e.g., .ns-ios-26 or .ns-android-36)
			// this acts like 'gte' for that major version range
			// e.g., if user wants iOS 27, they can add .ns-ios-27 specifiers
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${platform}-${Math.floor(SDK_VERSION)}`);
		}

		if (deviceType) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${deviceType}`);
		}

		rootView.cssClasses.add(CSSUtils.ROOT_VIEW_CSS_CLASS);
		const rootViewCssClasses = CSSUtils.getSystemCssClasses();
		rootViewCssClasses.forEach((c) => rootView.cssClasses.add(c));

		// Two windows can disagree on these, so they never reach the process-wide
		// system class list — see CSSUtils.WINDOW_SCOPED_CSS_CLASSES.
		if (orientation) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${orientation}`);
		}

		if (systemAppearance) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${systemAppearance}`);
		}

		if (layoutDirection) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${layoutDirection}`);
		}

		this.increaseStyleScopeApplicationCssSelectorVersion(rootView);
		rootView._onCssStateChange();

		if (Trace.isEnabled()) {
			const rootCssClasses = Array.from(rootView.cssClasses);
			Trace.write(`Setting root css classes: ${rootCssClasses.join(' ')}`, Trace.categories.Style);
		}
	}

	/**
	 * iOS Only
	 * Dynamically change the preferred frame rate
	 * For devices (iOS 15+) which support min/max/preferred frame rate you can specify ranges
	 * For devices (iOS < 15), you can specify the max frame rate
	 * see: https://developer.apple.com/documentation/quartzcore/optimizing_promotion_refresh_rates_for_iphone_13_pro_and_ipad_pro
	 * To use, ensure your Info.plist has:
	 * ```xml
	 *   <key>CADisableMinimumFrameDurationOnPhone</key>
	 *   <true/>
	 * ```
	 * @param options { min?: number; max?: number; preferred?: number }
	 */
	setMaxRefreshRate(options?: { min?: number; max?: number; preferred?: number }) {
		// implement in platform specific files (iOS only for now)
	}

	/**
	 * @returns The main entry of the application
	 */
	getMainEntry() {
		return getAppMainEntry();
	}

	/**
	 * Sets the callback that supplies the UI for windows that need content.
	 * Pass `null` to remove a previously set resolver.
	 */
	setWindowContentResolver(resolver: WindowContentResolver | null): void {
		this._windowContentResolver = resolver ?? null;
	}

	/**
	 * @returns The callback currently supplying window content, if any.
	 */
	getWindowContentResolver(): WindowContentResolver | null {
		return this._windowContentResolver;
	}

	// --- NativeWindow registry ---

	protected _windows: NativeWindow[] = [];

	/**
	 * Get the primary NativeWindow.
	 */
	get primaryWindow(): NativeWindow | undefined {
		return this._windows.find((nw) => nw.isPrimary);
	}

	/**
	 * Get the NativeWindow the user is currently interacting with - the one that activated most
	 * recently and is still attached. Falls back to the primary window while no window holds
	 * activation, which is the case before the first window activates and on a platform that
	 * never raises `activate`.
	 */
	get activeWindow(): NativeWindow | undefined {
		const active = getActiveWindow();
		if (active && active.state === 'attached' && this._windows.indexOf(active) !== -1) {
			return active;
		}

		return this.primaryWindow;
	}

	/**
	 * Get the active windows, filtered by role.
	 *
	 * Defaults to the view-carrying app windows (`application` and `embedded`).
	 * Pass `'all'` to include every registered surface, including ones that carry no view tree.
	 */
	getWindows(role: 'all'): WindowBase[];
	getWindows(role?: WindowRole | WindowRole[]): NativeWindow[];
	getWindows(role?: WindowRole | WindowRole[] | 'all'): WindowBase[];
	getWindows(role?: WindowRole | WindowRole[] | 'all'): WindowBase[] {
		if (role === 'all') {
			return [...this._windows];
		}
		const roles: WindowRole[] = role ? (Array.isArray(role) ? role : [role]) : ['application', 'embedded'];
		return this._windows.filter((nw) => roles.indexOf(nw.role) !== -1);
	}

	/**
	 * Get a registered NativeWindow by its id.
	 */
	getWindowById(id: string): NativeWindow | undefined {
		return this._windows.find((nw) => nw.id === id);
	}

	/**
	 * Opens a new window.
	 *
	 * @param options Options for the new window, including data to hand to it.
	 */
	openWindow(options?: WindowOpenOptions): void {
		throw new Error('openWindow() is not supported on this platform.');
	}

	/**
	 * @internal - Get all registered NativeWindows, whatever their role.
	 */
	_getWindows(): NativeWindow[] {
		return [...this._windows];
	}

	/**
	 * @internal - Register a NativeWindow created by the platform lifecycle.
	 */
	_registerWindow(nativeWindow: NativeWindow): void {
		this._windows.push(nativeWindow);

		// A closing window drops its own listeners, so this is never explicitly removed.
		nativeWindow.on(NativeWindowEvents.activate, this.onWindowActivated, this);

		if (nativeWindow.isPrimary) {
			this.trackPrimaryWindowTraits(nativeWindow);
		}

		this._onWindowRegistered(nativeWindow);

		this.notify({
			eventName: this.windowOpenEvent,
			object: this,
			window: nativeWindow,
		});
	}

	/**
	 * @internal - retire the windows behind discarded window-session ids.
	 *
	 * A session id can only stand in for a window whose native surface is already gone.
	 * iOS reports sessions discarded while the app was not running on the next launch,
	 * and such an id can name the session driving the app now, so an id match alone is
	 * no evidence that the window is finished with. Retiring an attached window tears
	 * down the UI in use - its root view unloads and nothing ever reloads it - so only
	 * detached windows are retired. Ids matching no window are ignored: they routinely
	 * belong to windows this JS context has never seen.
	 */
	_retireDiscardedWindows(ids: string[]): void {
		for (const id of ids) {
			const nativeWindow = id ? this.getWindowById(id) : undefined;

			if (!nativeWindow) {
				continue;
			}

			if (nativeWindow.state === 'attached') {
				Trace.write(`Ignoring a discarded session for window '${id}': its surface is still attached.`, Trace.categories.NativeLifecycle, Trace.messageType.warn);

				continue;
			}

			nativeWindow._notifyEvent(NativeWindowEvents.close);
			this._unregisterWindow(nativeWindow);
		}
	}

	/**
	 * @internal - Unregister a NativeWindow when its native surface is gone for good.
	 */
	_unregisterWindow(nativeWindow: NativeWindow): void {
		const idx = this._windows.indexOf(nativeWindow);
		if (idx >= 0) {
			this._windows.splice(idx, 1);
		}

		if (getActiveWindow() === nativeWindow) {
			setActiveWindow(undefined);
		}

		this.notify({
			eventName: this.windowCloseEvent,
			object: this,
			window: nativeWindow,
		});

		// If primary was removed, promote the next window that can actually host content
		if (nativeWindow.isPrimary) {
			nativeWindow._setIsPrimary(false);

			const promoted = this.getWindows().find((nw) => nw.state === 'attached');
			this.trackPrimaryWindowTraits(promoted);

			if (promoted) {
				promoted._setIsPrimary(true);
				this._onPrimaryWindowPromoted(promoted);
				this.notify({
					eventName: this.primaryWindowChangedEvent,
					object: this,
					window: promoted,
				});
			}
		}

		nativeWindow._destroy();
	}

	/**
	 * Hook for platform-specific bookkeeping right after a window joins the registry,
	 * before `windowOpen` is raised.
	 */
	protected _onWindowRegistered(nativeWindow: NativeWindow): void {
		// noop
	}

	/**
	 * Hook for platform-specific bookkeeping right after a window takes over the primary
	 * role, before `primaryWindowChanged` is raised.
	 */
	protected _onPrimaryWindowPromoted(nativeWindow: NativeWindow): void {
		// noop
	}

	// --- Primary window traits ---

	private _traitsWindow: NativeWindow | null = null;

	/**
	 * Points the application-level orientation, appearance and layout direction at the
	 * primary window, which owns those values now that each window has its own.
	 */
	private trackPrimaryWindowTraits(nativeWindow: NativeWindow | undefined): void {
		const target = nativeWindow ?? null;
		if (this._traitsWindow === target) {
			return;
		}

		const previous = this._traitsWindow;
		if (previous) {
			previous.off(NativeWindowEvents.orientationChanged, this.onWindowOrientationChanged, this);
			previous.off(NativeWindowEvents.systemAppearanceChanged, this.onWindowSystemAppearanceChanged, this);
			previous.off(NativeWindowEvents.layoutDirectionChanged, this.onWindowLayoutDirectionChanged, this);
		}

		this._traitsWindow = target;

		if (!target) {
			return;
		}

		target.on(NativeWindowEvents.orientationChanged, this.onWindowOrientationChanged, this);
		target.on(NativeWindowEvents.systemAppearanceChanged, this.onWindowSystemAppearanceChanged, this);
		target.on(NativeWindowEvents.layoutDirectionChanged, this.onWindowLayoutDirectionChanged, this);

		this.syncTraitsFromWindow(target);
	}

	/**
	 * Adopts the window's values. The very first window seeds them quietly — there is no
	 * previous application state for it to differ from — while a later promotion raises
	 * the change events, because app code observed the outgoing window's values.
	 */
	private syncTraitsFromWindow(nativeWindow: NativeWindow): void {
		const orientation = nativeWindow.orientation();
		if (orientation) {
			if (this._orientation === undefined) {
				this._orientation = orientation;
			} else {
				this.setOrientation(orientation);
			}
		}

		const systemAppearance = nativeWindow.systemAppearance();
		if (systemAppearance) {
			if (this._systemAppearance === undefined) {
				this._systemAppearance = systemAppearance;
			} else {
				this.setSystemAppearance(systemAppearance);
			}
		}

		const layoutDirection = nativeWindow.layoutDirection();
		if (layoutDirection) {
			if (this._layoutDirection === undefined) {
				this._layoutDirection = layoutDirection;
			} else {
				this.setLayoutDirection(layoutDirection);
			}
		}
	}

	private onWindowActivated(data: NativeWindowEventData): void {
		setActiveWindow(data.window);
	}

	private onWindowOrientationChanged(data: WindowOrientationChangedEventData): void {
		this.setOrientation(data.newValue);
	}

	private onWindowSystemAppearanceChanged(data: WindowSystemAppearanceChangedEventData): void {
		this.setSystemAppearance(data.newValue);
	}

	private onWindowLayoutDirectionChanged(data: WindowLayoutDirectionChangedEventData): void {
		this.setLayoutDirection(data.newValue);
	}

	/**
	 * @internal - raises `ready` at most once per JS context.
	 */
	notifyReady(): void {
		if (this._readyNotified) {
			return;
		}
		this._readyNotified = true;
		getNativeScriptGlobals().setLaunched();

		this.notify(<ApplicationEventData>{
			eventName: this.readyEvent,
			object: this,
			ios: this.ios,
			android: this.android,
		});
	}

	/**
	 * @internal - produces the content for a window that has none.
	 *
	 * Resolution order: the window content resolver, then the legacy `launch` event
	 * (offered to the first window that asks for content and to no other), then the
	 * application main entry. A resolver or a `launch` handler returning `null` takes
	 * ownership of the content, so nothing else is tried. A missing main entry leaves
	 * the window empty instead of throwing, because content can still arrive later
	 * through `run()`/`resetRootView()`.
	 *
	 * @param options.install `false` returns the resolved view instead of applying it,
	 * for platform pipelines that install the root view on the native surface themselves.
	 * @param options.launchData platform payload merged into the legacy `launch` event args.
	 * @returns The resolved view, or `null` when no content was produced.
	 */
	_resolveWindowContent(window: NativeWindow, request: WindowContentRequest, options?: { install?: boolean; launchData?: any }): View | null {
		const content = this.resolveWindowContent(request, options?.launchData);

		if (content == null) {
			return null;
		}

		if (options?.install === false) {
			return this.buildContentView(content);
		}

		window.setContent(content);

		return window.rootView;
	}

	private resolveWindowContent(request: WindowContentRequest, launchData?: any): View | NavigationEntry | string | null | undefined {
		const launchBridgeAvailable = !this._launchBridgeConsumed;
		this._launchBridgeConsumed = true;

		const resolver = this._windowContentResolver;
		if (resolver) {
			const resolved = resolver(request);

			// `null` means the resolver supplies the content itself; only `undefined` falls through.
			if (resolved !== undefined) {
				this._ensureAppCssLoaded();

				return resolved;
			}
		}

		if (launchBridgeAvailable) {
			const root = this.notifyLaunch(launchData);

			if (root === null) {
				return null;
			}

			if (root) {
				return root;
			}
		}

		this._ensureAppCssLoaded();

		const mainEntry = getAppMainEntry();

		return mainEntry ? Builder.createViewFromEntry(mainEntry) : undefined;
	}

	private buildContentView(content: View | NavigationEntry | string): View {
		if (typeof content === 'string') {
			return Builder.createViewFromEntry({ moduleName: content });
		}

		const entry = content as NavigationEntry;

		return entry.moduleName || entry.create ? Builder.createViewFromEntry(entry) : (content as View);
	}

	/**
	 * Loads the app CSS once per JS context. On the legacy `launch` path this has to run
	 * after the handlers, which are allowed to call `setCssFileName()`.
	 */
	private _ensureAppCssLoaded(): void {
		if (this._appCssLoaded) {
			return;
		}
		this._appCssLoaded = true;

		this.loadAppCss();
	}

	@profile
	protected notifyLaunch(additionalLanchEventData?: any): View | null {
		this._launchBridgeConsumed = true;

		const launchArgs: LaunchEventData = {
			eventName: this.launchEvent,
			object: this,
			ios: this.ios,
			android: this.android,
			...additionalLanchEventData,
		};
		this.notify(launchArgs);
		this._ensureAppCssLoaded();

		return launchArgs.root;
	}

	@profile
	createRootView(view?: View, fireLaunchEvent = false, additionalLanchEventData?: any) {
		let rootView = view;

		if (!rootView) {
			if (fireLaunchEvent) {
				rootView = this.notifyLaunch(additionalLanchEventData);

				// useful for integrations that would like to set rootView asynchronously after app launch
				if (rootView === null) {
					return null;
				}
			}

			if (!rootView) {
				// try to navigate to the mainEntry (if specified)
				if (!getAppMainEntry()) {
					throw new Error('Main entry is missing. App cannot be started. Verify app bootstrap.');
				}

				rootView = Builder.createViewFromEntry(getAppMainEntry());
			}
		}

		return rootView;
	}

	getRootView(): View {
		throw new Error('getRootView() Not implemented.');
	}

	resetRootView(entry?: NavigationEntry | string) {
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		// rest of implementation is platform specific
	}

	/**
	 * @param window the window the root view belongs to. Supplies the window-scoped CSS
	 * classes; without it they come from the primary window.
	 */
	initRootView(rootView: View, window?: NativeWindow) {
		this.setRootViewCSSClasses(rootView, window);
		readyInitAccessibilityCssHelper();
		readyInitFontScale();
		applyAccessibilityCssToRoot(rootView);
		this.notify(<InitRootViewEventData>{ eventName: this.initRootViewEvent, rootView });
	}

	/**
	 * Get application level static resources.
	 */
	getResources() {
		return bindableResources.get();
	}

	/**
	 * Set application level static resources.
	 */
	setResources(res: any) {
		bindableResources.set(res);
	}

	/**
	 * Sets css file name for the application.
	 */
	setCssFileName(cssFileName: string) {
		this._cssFile = cssFileName;
		this.notify(<CssChangedEventData>{
			eventName: this.cssChangedEvent,
			object: this,
			cssFile: cssFileName,
		});
	}

	/**
	 * Gets css file name for the application.
	 */
	getCssFileName(): string {
		return this._cssFile;
	}

	/**
	 * Loads immediately the app.css.
	 * By default the app.css file is loaded shortly after "loaded".
	 * For the Android snapshot the CSS can be parsed during the snapshot generation,
	 * as the CSS does not depend on runtime APIs, and loadAppCss will be called explicitly.
	 */
	loadAppCss(): void {
		try {
			this.notify(<LoadAppCSSEventData>{
				eventName: this.loadAppCssEvent,
				object: this,
				ios: this.ios,
				android: this.android,
				cssFile: this.getCssFileName(),
			});
		} catch (e) {
			if (Trace.isEnabled()) {
				Trace.write(`The app CSS file ${this.getCssFileName()} couldn't be loaded!`, Trace.categories.Style, Trace.messageType.warn);
			}
		}
	}

	addCss(cssText: string, attributeScoped?: boolean): void {
		this.notify(<CssChangedEventData>{
			eventName: this.cssChangedEvent,
			object: this,
			cssText: cssText,
		});
		if (!attributeScoped) {
			const rootView = this.getRootView();
			if (rootView) {
				rootView._onCssStateChange();
			}
		}
	}

	run(entry?: string | NavigationEntry) {
		throw new Error('run() Not implemented.');
	}

	protected getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		// override in platform specific Application class
		throw new Error('getOrientation() not implemented');
	}

	protected setOrientation(value: 'portrait' | 'landscape' | 'unknown') {
		if (this._orientation === value) {
			return;
		}

		this._orientation = value;

		// Update metrics early enough regardless of the existence of root view
		// Also, CSS will use the correct size values during update trigger
		Screen.mainScreen._updateMetrics();

		this.orientationChanged(this.getRootView(), value);
		this.notify(<OrientationChangedEventData>{
			eventName: this.orientationChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
			object: this,
		});
	}

	/**
	 * @deprecated Use Application.primaryWindow?.orientation() - or the NativeWindow of the relevant view - instead. Continues to reflect the primary window.
	 */
	orientation(): 'portrait' | 'landscape' | 'unknown' {
		return this.primaryWindow?.orientation() ?? (this._orientation ??= this.getOrientation());
	}

	orientationChanged(rootView: View, newOrientation: 'portrait' | 'landscape' | 'unknown'): void {
		if (!rootView) {
			return;
		}

		const newOrientationCssClass = `${CSSUtils.CLASS_PREFIX}${newOrientation}`;
		this.applyWindowScopedCssClass(rootView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);

		this.getOwnedModalViews(rootView).forEach((rootModalView) => {
			this.applyWindowScopedCssClass(rootModalView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);

			// Trigger state change for root modal view classes and media queries
			rootModalView._onCssStateChange();
		});

		// Trigger state change for root view classes and media queries
		rootView._onCssStateChange();
	}

	getNativeApplication(): any {
		// override in platform specific Application class
		throw new Error('getNativeApplication() not implemented');
	}

	hasLaunched(): boolean {
		return getNativeScriptGlobals().launched;
	}

	protected getSystemAppearance(): 'dark' | 'light' | null {
		// override in platform specific Application class
		throw new Error('getSystemAppearance() not implemented');
	}

	protected setSystemAppearance(value: 'dark' | 'light') {
		if (this._systemAppearance === value) {
			return;
		}
		this._systemAppearance = value;
		this.systemAppearanceChanged(this.getRootView(), value);
		this.notify(<SystemAppearanceChangedEventData>{
			eventName: this.systemAppearanceChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
			object: this,
		});
	}

	/**
	 * @deprecated Use Application.primaryWindow?.systemAppearance() - or the NativeWindow of the relevant view - instead. Continues to reflect the primary window.
	 */
	systemAppearance(): 'dark' | 'light' | null {
		return this.primaryWindow?.systemAppearance() ?? (this._systemAppearance ??= this.getSystemAppearance());
	}

	/**
	 * enable/disable systemAppearanceChanged
	 */
	setAutoSystemAppearanceChanged(value: boolean): void {
		setAutoSystemAppearanceChanged(value);
	}

	/**
	 * Updates root view classes including those of modals
	 * @param rootView the root view
	 * @param newSystemAppearance the new appearance change
	 */
	systemAppearanceChanged(rootView: View, newSystemAppearance: 'dark' | 'light'): void {
		if (!rootView || !this.autoSystemAppearanceChanged) {
			return;
		}

		const newSystemAppearanceCssClass = `${CSSUtils.CLASS_PREFIX}${newSystemAppearance}`;
		this.applyWindowScopedCssClass(rootView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);

		this.getOwnedModalViews(rootView).forEach((rootModalView) => {
			this.applyWindowScopedCssClass(rootModalView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);

			// Trigger state change for root modal view classes and media queries
			rootModalView._onCssStateChange();
		});

		// Trigger state change for root view classes and media queries
		rootView._onCssStateChange();
	}

	protected getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		// override in platform specific Application class
		throw new Error('getLayoutDirection() not implemented');
	}

	protected setLayoutDirection(value: CoreTypes.LayoutDirectionType) {
		if (this._layoutDirection === value) {
			return;
		}
		this._layoutDirection = value;
		this.layoutDirectionChanged(this.getRootView(), value);
		this.notify(<LayoutDirectionChangedEventData>{
			eventName: this.layoutDirectionChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
			object: this,
		});
	}

	/**
	 * @deprecated Use Application.primaryWindow?.layoutDirection() - or the NativeWindow of the relevant view - instead. Continues to reflect the primary window.
	 */
	layoutDirection(): CoreTypes.LayoutDirectionType | null {
		return this.primaryWindow?.layoutDirection() ?? (this._layoutDirection ??= this.getLayoutDirection());
	}

	/**
	 * Updates root view classes including those of modals
	 * @param rootView the root view
	 * @param newLayoutDirection the new layout direction change
	 */
	layoutDirectionChanged(rootView: View, newLayoutDirection: CoreTypes.LayoutDirectionType): void {
		if (!rootView) {
			return;
		}

		const newLayoutDirectionCssClass = `${CSSUtils.CLASS_PREFIX}${newLayoutDirection}`;
		this.applyWindowScopedCssClass(rootView, LAYOUT_DIRECTION_CSS_CLASSES, newLayoutDirectionCssClass);

		this.getOwnedModalViews(rootView).forEach((rootModalView) => {
			this.applyWindowScopedCssClass(rootModalView, LAYOUT_DIRECTION_CSS_CLASSES, newLayoutDirectionCssClass);

			// Trigger state change for root modal view classes and media queries
			rootModalView._onCssStateChange();
		});

		// Trigger state change for root view classes and media queries
		rootView._onCssStateChange();
	}

	get inBackground() {
		return isAppInBackground();
	}

	setInBackground(value: boolean, additonalData?: any) {
		setAppInBackground(value);

		this.notify(<ApplicationEventData>{
			eventName: value ? this.backgroundEvent : this.foregroundEvent,
			object: this,
			ios: this.ios,

			...additonalData,
		});
	}

	get suspended() {
		return this._suspended;
	}

	setSuspended(value: boolean, additonalData?: any) {
		this._suspended = value;

		this.notify(<ApplicationEventData>{
			eventName: value ? this.suspendEvent : this.resumeEvent,
			object: this,
			ios: this.ios,
			android: this.android,

			...additonalData,
		});
	}

	get android(): AndroidApplicationType {
		return undefined;
	}

	get ios(): iOSApplicationType {
		return undefined;
	}

	get AndroidApplication() {
		return this.android;
	}

	get iOSApplication() {
		return this.ios;
	}
}

prepareAppForModuleResolver(() => {
	ApplicationCommon.on('livesync', (args) => clearResolverCache());
	ApplicationCommon.on('orientationChanged', (args) => {
		_setResolver(undefined);
	});
});
