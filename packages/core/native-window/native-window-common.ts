import { CoreTypes } from '../core-types';
import { CSSUtils } from '../css/system-classes';
import { Device } from '../platform';
import { Trace } from '../trace';
import { Builder } from '../ui/builder';
import type { View } from '../ui/core/view';
import type { Frame } from '../ui/frame';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { StyleScope } from '../ui/styling/style-scope';
import { applyAccessibilityCssToRoot, readyInitAccessibilityCssHelper, readyInitFontScale } from '../accessibility/accessibility-common';
import { SDK_VERSION } from '../utils/constants';
import type { NativeWindowEventData, NativeWindowEventName, WindowLayoutDirectionChangedEventData, WindowOrientationChangedEventData, WindowSystemAppearanceChangedEventData } from './native-window-interfaces';
import type { AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityResultEventData, AndroidActivityBackPressedEventData, AndroidActivityNewIntentEventData, AndroidActivityRequestPermissionsEventData, SceneEventData } from '../application/application-interfaces';
import { NativeWindowEvents } from './native-window-interfaces';
import { getAutoSystemAppearanceChanged } from '../application/helpers-common';
import type { WindowRole } from './window-base';
import { WindowBase } from './window-base';

const ORIENTATION_CSS_CLASSES = CSSUtils.ORIENTATION_CSS_CLASSES;
const SYSTEM_APPEARANCE_CSS_CLASSES = CSSUtils.SYSTEM_APPEARANCE_CSS_CLASSES;
const LAYOUT_DIRECTION_CSS_CLASSES = CSSUtils.LAYOUT_DIRECTION_CSS_CLASSES;

/**
 * Cross-platform NativeWindow base class.
 *
 * Wraps a platform window surface (iOS UIWindowScene+UIWindow, Android Activity)
 * and manages per-window root view lifecycle, CSS classes, and events.
 *
 * Platform-specific subclasses implement the abstract methods.
 */
export abstract class NativeWindow extends WindowBase {
	protected _rootView: View;
	protected _orientation: 'portrait' | 'landscape' | 'unknown';
	protected _systemAppearance: 'dark' | 'light' | null;
	protected _layoutDirection: CoreTypes.LayoutDirectionType | null;

	constructor(id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);
	}

	get rootView(): View {
		return this._rootView;
	}

	/**
	 * Set the content of this window.
	 * Accepts a View, a NavigationEntry, or a module name string.
	 */
	setContent(content: View | NavigationEntry | string): void {
		let view: View;

		if (typeof content === 'string') {
			view = Builder.createViewFromEntry({ moduleName: content });
		} else if (content && typeof content === 'object') {
			if ((content as NavigationEntry).moduleName || (content as NavigationEntry).create) {
				view = Builder.createViewFromEntry(content as NavigationEntry);
			} else {
				view = content as View;
			}
		}

		if (!view) {
			throw new Error('NativeWindow.setContent: Invalid content provided.');
		}

		const previousRootView = this._rootView;
		if (previousRootView) {
			previousRootView._onRootViewReset();
		}

		this._rootView = view;
		this._applyRootViewSettings(view);
		this._setNativeContent(view);

		this._notifyEvent(NativeWindowEvents.contentLoaded);
	}

	/**
	 * @internal – take ownership of a root view the platform pipeline built and attached itself.
	 *
	 * The pipeline already ran `_setupAsRootView` and `Application.initRootView` on this view and
	 * installed it on the native surface, so neither `_applyRootViewSettings` nor `_setNativeContent`
	 * may run here — both would redo that work.
	 */
	_adoptRootView(view: View): void {
		if (!view || this._rootView === view) {
			return;
		}

		this._rootView = view;

		this._notifyEvent(NativeWindowEvents.contentLoaded);
	}

	/**
	 * Platform-specific: apply the view to the native window surface.
	 */
	protected abstract _setNativeContent(view: View): void;

	/**
	 * Get the current orientation of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window
	 * reports the last value it saw.
	 *
	 * A read that catches a change the platform has not reported yet goes through
	 * {@link _setOrientation}, so the change is never swallowed by the reading.
	 */
	orientation(): 'portrait' | 'landscape' | 'unknown' {
		if (this.state === 'attached') {
			const value = this._getOrientation();
			if (this._orientation === undefined) {
				this._orientation = value;
			} else if (this._orientation !== value) {
				this._setOrientation(value);
			}
		}

		return this._orientation;
	}

	/**
	 * Get the current system appearance of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window
	 * reports the last value it saw.
	 *
	 * A read that catches a change the platform has not reported yet goes through
	 * {@link _setSystemAppearance}, so the change is never swallowed by the reading.
	 */
	systemAppearance(): 'light' | 'dark' | null {
		if (this.state === 'attached') {
			const value = this._getSystemAppearance();
			if (this._systemAppearance === undefined) {
				this._systemAppearance = value;
			} else if (this._systemAppearance !== value && value !== null) {
				this._setSystemAppearance(value);
			}
		}

		return this._systemAppearance;
	}

	/**
	 * Get the current layout direction of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window
	 * reports the last value it saw.
	 *
	 * A read that catches a change the platform has not reported yet goes through
	 * {@link _setLayoutDirection}, so the change is never swallowed by the reading.
	 */
	layoutDirection(): CoreTypes.LayoutDirectionType | null {
		if (this.state === 'attached') {
			const value = this._getLayoutDirection();
			if (this._layoutDirection === undefined) {
				this._layoutDirection = value;
			} else if (this._layoutDirection !== value && value !== null) {
				this._setLayoutDirection(value);
			}
		}

		return this._layoutDirection;
	}

	// --- Typed event overloads ---

	// The whole set is repeated here: TypeScript only accepts an override whose overloads
	// cover every overload of the base signature.
	on(event: 'contentLoaded', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'activate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'deactivate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'background', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'foreground', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'close', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'attached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'detached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'displayed', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	on(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	on(event: 'layoutDirectionChanged', callback: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	on(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	on(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	on(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	on(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillConnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidActivate', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillResignActive', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillEnterForeground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidEnterBackground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidDisconnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(eventName: string, callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(eventName: string, callback: (data: any) => void, thisArg?: any): void {
		super.on(eventName, callback, thisArg);
	}

	// Platform-specific abstract getters
	protected abstract _getOrientation(): 'portrait' | 'landscape' | 'unknown';
	protected abstract _getSystemAppearance(): 'light' | 'dark' | null;
	protected abstract _getLayoutDirection(): CoreTypes.LayoutDirectionType | null;

	// --- Root view CSS class management ---

	/**
	 * Applies platform, orientation, appearance, and layout direction CSS classes
	 * to the root view.
	 */
	protected _applyRootViewSettings(rootView: View): void {
		rootView._setupAsRootView({});
		this._setRootViewCSSClasses(rootView);
		readyInitAccessibilityCssHelper();
		readyInitFontScale();
		applyAccessibilityCssToRoot(rootView);
	}

	private _setRootViewCSSClasses(rootView: View): void {
		const platform = Device.os.toLowerCase();
		const deviceType = Device.deviceType.toLowerCase();

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
		const orientationValue = this.orientation();
		const appearanceValue = this.systemAppearance();
		const directionValue = this.layoutDirection();

		if (orientationValue) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${orientationValue}`);
		}

		if (appearanceValue) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${appearanceValue}`);
		}

		if (directionValue) {
			rootView.cssClasses.add(`${CSSUtils.CLASS_PREFIX}${directionValue}`);
		}

		this._increaseStyleScopeVersion(rootView);
		rootView._onCssStateChange();

		if (Trace.isEnabled()) {
			const rootCssClasses = Array.from(rootView.cssClasses);
			Trace.write(`NativeWindow [${this.id}] Setting root css classes: ${rootCssClasses.join(' ')}`, Trace.categories.Style);
		}
	}

	// --- Orientation / Appearance / Direction change handling ---

	/**
	 * @internal – called by platform when orientation changes for this window.
	 */
	_setOrientation(value: 'portrait' | 'landscape' | 'unknown'): void {
		if (this._orientation === value) {
			return;
		}
		this._orientation = value;
		if (this._rootView) {
			const cssClass = `${CSSUtils.CLASS_PREFIX}${value}`;
			this._applyCssClass(this._rootView, ORIENTATION_CSS_CLASSES, cssClass);
		}
		this._notifyValueChanged(NativeWindowEvents.orientationChanged, value);
	}

	/**
	 * @internal – called by platform when system appearance changes for this window.
	 */
	_setSystemAppearance(value: 'dark' | 'light'): void {
		if (this._systemAppearance === value) {
			return;
		}
		this._systemAppearance = value;
		// `Application.autoSystemAppearanceChanged` opts out of the CSS classes only —
		// the event still fires so apps driving their own theming can react to it.
		if (this._rootView && getAutoSystemAppearanceChanged()) {
			const cssClass = `${CSSUtils.CLASS_PREFIX}${value}`;
			this._applyCssClass(this._rootView, SYSTEM_APPEARANCE_CSS_CLASSES, cssClass);
		}
		this._notifyValueChanged(NativeWindowEvents.systemAppearanceChanged, value);
	}

	/**
	 * @internal – called by platform when layout direction changes for this window.
	 */
	_setLayoutDirection(value: CoreTypes.LayoutDirectionType): void {
		if (this._layoutDirection === value) {
			return;
		}
		this._layoutDirection = value;
		if (this._rootView) {
			const cssClass = `${CSSUtils.CLASS_PREFIX}${value}`;
			this._applyCssClass(this._rootView, LAYOUT_DIRECTION_CSS_CLASSES, cssClass);
		}
		this._notifyValueChanged(NativeWindowEvents.layoutDirectionChanged, value);
	}

	// --- Internal helpers ---

	private _notifyValueChanged(eventName: NativeWindowEventName, newValue: unknown): void {
		this.notify({
			eventName,
			object: this,
			window: this,
			newValue,
		});
	}

	private _applyCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
		if (!rootView.cssClasses.has(newCssClass)) {
			cssClasses.forEach((cssClass) => rootView.cssClasses.delete(cssClass));
			rootView.cssClasses.add(newCssClass);
			this._increaseStyleScopeVersion(rootView);
			rootView._onCssStateChange();
		}

		// The modal registry is process-wide, so only the modals presented over this
		// window's root view may follow it.
		const rootModalViews = <Array<View>>rootView._getRootModalViews();
		rootModalViews.forEach((modalView) => {
			if (modalView._getRootModalHost() !== rootView) {
				return;
			}

			if (!modalView.cssClasses.has(newCssClass)) {
				cssClasses.forEach((cssClass) => modalView.cssClasses.delete(cssClass));
				modalView.cssClasses.add(newCssClass);
				modalView._onCssStateChange();
			}
		});
	}

	private _increaseStyleScopeVersion(rootView: View): void {
		const styleScope: StyleScope = rootView._styleScope ?? (rootView as unknown as Frame)?.currentPage?._styleScope;
		if (styleScope) {
			styleScope._increaseApplicationCssSelectorVersion();
		}
	}

	/**
	 * @internal – the native surface went away but the window session lives on.
	 *
	 * The window stays registered and keeps its listeners, so app code that subscribed
	 * to it keeps working once a surface re-attaches.
	 */
	_detach(): void {
		// Take a final reading while the surface can still answer and the root view is
		// still up: from here on these are what the window reports.
		this.orientation();
		this.systemAppearance();
		this.layoutDirection();

		if (this._rootView) {
			if (this._rootView.isLoaded) {
				this._rootView.callUnloaded();
			}
			this._rootView._tearDownUI(true);
			this._rootView._onRootViewReset();
		}

		this._setState('detached');
		this._notifyEvent(NativeWindowEvents.detached);
	}

	protected _onDestroy(): void {
		super._onDestroy();
		if (this._rootView) {
			if (this._rootView.isLoaded) {
				this._rootView.callUnloaded();
			}
			this._rootView._onRootViewReset();
			this._rootView = null;
		}
	}
}
