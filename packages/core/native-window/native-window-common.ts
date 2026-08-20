import { CoreTypes } from '../core-types';
import { CSSUtils } from '../css/system-classes';
import { Device } from '../platform';
import { Trace } from '../trace';
import { Builder } from '../ui/builder';
import type { View } from '../ui/core/view';
import type { Frame } from '../ui/frame';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { StyleScope } from '../ui/styling/style-scope';
import { readyInitAccessibilityCssHelper, readyInitFontScale } from '../accessibility/accessibility-common';
import { SDK_VERSION } from '../utils/constants';
import type { NativeWindowEventData } from './native-window-interfaces';
import type { AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityResultEventData, AndroidActivityBackPressedEventData, AndroidActivityNewIntentEventData, AndroidActivityRequestPermissionsEventData, SceneEventData } from '../application/application-interfaces';
import { NativeWindowEvents } from './native-window-interfaces';
import type { WindowRole } from './window-base';
import { WindowBase } from './window-base';

// prettier-ignore
const ORIENTATION_CSS_CLASSES = [
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.portrait}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.landscape}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.unknown}`,
];

// prettier-ignore
const SYSTEM_APPEARANCE_CSS_CLASSES = [
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.light}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.dark}`,
];

// prettier-ignore
const LAYOUT_DIRECTION_CSS_CLASSES = [
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.LayoutDirection.ltr}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.LayoutDirection.rtl}`,
];

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
	 * Platform-specific: apply the view to the native window surface.
	 */
	protected abstract _setNativeContent(view: View): void;

	/**
	 * Get the current orientation of this window.
	 */
	orientation(): 'portrait' | 'landscape' | 'unknown' {
		return (this._orientation ??= this._getOrientation());
	}

	/**
	 * Get the current system appearance of this window.
	 */
	systemAppearance(): 'light' | 'dark' | null {
		return (this._systemAppearance ??= this._getSystemAppearance());
	}

	/**
	 * Get the current layout direction of this window.
	 */
	layoutDirection(): CoreTypes.LayoutDirectionType | null {
		return (this._layoutDirection ??= this._getLayoutDirection());
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
	}

	private _setRootViewCSSClasses(rootView: View): void {
		const platform = Device.os.toLowerCase();
		const deviceType = Device.deviceType.toLowerCase();
		const orientationValue = this.orientation();
		const appearanceValue = this.systemAppearance();
		const directionValue = this.layoutDirection();

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

		if (orientationValue) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${orientationValue}`);
		}

		if (appearanceValue) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${appearanceValue}`);
		}

		if (directionValue) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${directionValue}`);
		}

		rootView.cssClasses.add(CSSUtils.ROOT_VIEW_CSS_CLASS);
		const rootViewCssClasses = CSSUtils.getSystemCssClasses();
		rootViewCssClasses.forEach((c) => rootView.cssClasses.add(c));

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
	}

	/**
	 * @internal – called by platform when system appearance changes for this window.
	 */
	_setSystemAppearance(value: 'dark' | 'light'): void {
		if (this._systemAppearance === value) {
			return;
		}
		this._systemAppearance = value;
		if (this._rootView) {
			const cssClass = `${CSSUtils.CLASS_PREFIX}${value}`;
			this._applyCssClass(this._rootView, SYSTEM_APPEARANCE_CSS_CLASSES, cssClass);
		}
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
	}

	// --- Internal helpers ---

	private _applyCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
		if (!rootView.cssClasses.has(newCssClass)) {
			cssClasses.forEach((cssClass) => {
				CSSUtils.removeSystemCssClass(cssClass);
				rootView.cssClasses.delete(cssClass);
			});
			CSSUtils.pushToSystemCssClasses(newCssClass);
			rootView.cssClasses.add(newCssClass);
			this._increaseStyleScopeVersion(rootView);
			rootView._onCssStateChange();
		}

		// Apply to modal views
		const rootModalViews = <Array<View>>rootView._getRootModalViews();
		rootModalViews.forEach((modalView) => {
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
		if (this._rootView) {
			if (this._rootView.isLoaded) {
				this._rootView.callUnloaded();
			}
			this._rootView._tearDownUI(true);
			this._rootView._onRootViewReset();
		}

		// These traits belong to the native surface, so a re-attached window has to read them again.
		this._orientation = null;
		this._systemAppearance = null;
		this._layoutDirection = null;

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
