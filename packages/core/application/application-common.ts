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
import type { ApplicationEventData, CssChangedEventData, DiscardedErrorEventData, FontScaleChangedEventData, InitRootViewEventData, LaunchEventData, LoadAppCSSEventData, NativeScriptError, OrientationChangedEventData, SystemAppearanceChangedEventData, LayoutDirectionChangedEventData, UnhandledErrorEventData } from './application-interfaces';
import { getAppMainEntry, isAppInBackground, setAppInBackground, setAppMainEntry } from './helpers-common';
import { getNativeScriptGlobals } from '../globals/global-utils';
import { SDK_VERSION } from '../utils/constants';

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

// SDK Version CSS classes
let sdkVersionClasses: string[] = [];

export function initializeSdkVersionClass(rootView: View): void {
	const majorVersion = Math.floor(SDK_VERSION);
	sdkVersionClasses = [];

	let platformPrefix = '';
	if (__APPLE__) {
		platformPrefix = __VISIONOS__ ? 'ns-visionos' : 'ns-ios';
	} else if (__ANDROID__) {
		platformPrefix = 'ns-android';
	}

	if (platformPrefix) {
		// Add exact version class (e.g., .ns-ios-26 or .ns-android-36)
		// this acts like 'gte' for that major version range
		// e.g., if user wants iOS 27, they can add .ns-ios-27 specifiers
		sdkVersionClasses.push(`${platformPrefix}-${majorVersion}`);
	}

	// Apply the SDK version classes to root views
	applySdkVersionClass(rootView);
}

function applySdkVersionClass(rootView: View): void {
	if (!sdkVersionClasses.length) {
		return;
	}

	if (!rootView) {
		return;
	}

	// Batch apply all SDK version classes to root view for better performance
	const classesToAdd = sdkVersionClasses.filter((className) => !rootView.cssClasses.has(className));
	classesToAdd.forEach((className) => rootView.cssClasses.add(className));

	// Apply to modal views only if there are any
	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	if (rootModalViews.length > 0) {
		rootModalViews.forEach((rootModalView) => {
			const modalClassesToAdd = sdkVersionClasses.filter((className) => !rootModalView.cssClasses.has(className));
			modalClassesToAdd.forEach((className) => rootModalView.cssClasses.add(className));
		});
	}
}

const globalEvents = getNativeScriptGlobals().events;

// Scene lifecycle event names
export const SceneEvents = {
	sceneWillConnect: 'sceneWillConnect',
	sceneDidActivate: 'sceneDidActivate',
	sceneWillResignActive: 'sceneWillResignActive',
	sceneWillEnterForeground: 'sceneWillEnterForeground',
	sceneDidEnterBackground: 'sceneDidEnterBackground',
	sceneDidDisconnect: 'sceneDidDisconnect',
	sceneContentSetup: 'sceneContentSetup',
};

export type SceneEventName = (typeof SceneEvents)[keyof typeof SceneEvents];

// helper interface to correctly type Application event handlers
interface ApplicationEvents {
	off(eventNames: string, callback?: any, thisArg?: any): void;
	notify<T = ApplicationEventData>(eventData: T): void;
	hasListeners(eventName: string): boolean;

	once(eventNames: string, callback: (args: ApplicationEventData) => void, thisArg?: any): void;
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
}

export class ApplicationCommon {
	readonly launchEvent = 'launch';
	readonly suspendEvent = 'suspend';
	readonly displayedEvent = 'displayed';
	readonly backgroundEvent = 'background';
	readonly foregroundEvent = 'foreground';
	readonly resumeEvent = 'resume';
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
	off: ApplicationEvents['off'] = globalEvents.off.bind(globalEvents);
	once: ApplicationEvents['once'] = globalEvents.once.bind(globalEvents);
	notify: ApplicationEvents['notify'] = globalEvents.notify.bind(globalEvents);
	hasListeners: ApplicationEvents['hasListeners'] = globalEvents.hasListeners.bind(globalEvents);

	private _orientation: 'portrait' | 'landscape' | 'unknown';
	private _systemAppearance: 'dark' | 'light' | null;
	private _layoutDirection: CoreTypes.LayoutDirectionType | null;
	private _inBackground: boolean = false;
	private _suspended: boolean = false;
	private _cssFile = './app.css';

	protected mainEntry: NavigationEntry;

	public started = false;
	/**
	 * Boolean to enable/disable systemAppearanceChanged
	 */
	public autoSystemAppearanceChanged = true;

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

	public increaseStyleScopeApplicationCssSelectorVersion(rootView: View) {
		const styleScope: StyleScope = rootView._styleScope ?? (rootView as Frame)?.currentPage?._styleScope;

		if (styleScope) {
			styleScope._increaseApplicationCssSelectorVersion();
		}
	}

	private setRootViewCSSClasses(rootView: View): void {
		const platform = Device.os.toLowerCase();
		const deviceType = Device.deviceType.toLowerCase();
		const orientation = this.orientation();
		const systemAppearance = this.systemAppearance();
		const layoutDirection = this.layoutDirection();

		if (platform) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${platform}`);
		}

		if (deviceType) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${deviceType}`);
		}

		if (orientation) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${orientation}`);
		}

		if (systemAppearance) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${systemAppearance}`);
		}

		if (layoutDirection) {
			CSSUtils.pushToSystemCssClasses(`${CSSUtils.CLASS_PREFIX}${layoutDirection}`);
		}

		rootView.cssClasses.add(CSSUtils.ROOT_VIEW_CSS_CLASS);
		const rootViewCssClasses = CSSUtils.getSystemCssClasses();
		rootViewCssClasses.forEach((c) => rootView.cssClasses.add(c));
		initializeSdkVersionClass(rootView);
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

	@profile
	protected notifyLaunch(additionalLanchEventData?: any): View | null {
		const launchArgs: LaunchEventData = {
			eventName: this.launchEvent,
			object: this,
			ios: this.ios,
			android: this.android,
			...additionalLanchEventData,
		};
		this.notify(launchArgs);
		this.loadAppCss();

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

	initRootView(rootView: View) {
		this.setRootViewCSSClasses(rootView);
		// ensure css is "loaded" on the rootview so that user rootview can access css variables right away
		rootView._onCssStateChange(true);
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

	protected setOrientation(value: 'portrait' | 'landscape' | 'unknown', degrees?: number) {
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
			degrees,
			object: this,
		});
	}

	orientation(): 'portrait' | 'landscape' | 'unknown' {
		return (this._orientation ??= this.getOrientation());
	}

	orientationChanged(rootView: View, newOrientation: 'portrait' | 'landscape' | 'unknown'): void {
		if (!rootView) {
			return;
		}

		const newOrientationCssClass = `${CSSUtils.CLASS_PREFIX}${newOrientation}`;
		this.applyCssClass(rootView, ORIENTATION_CSS_CLASSES, newOrientationCssClass, true);

		const rootModalViews = <Array<View>>rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(rootModalView, ORIENTATION_CSS_CLASSES, newOrientationCssClass, true);

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
		const args = <SystemAppearanceChangedEventData>{
			eventName: this.systemAppearanceChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
			cancel: false,
			object: this,
		};
		this.notify(args);
		if (args.cancel === false) {
			this.systemAppearanceChanged(this.getRootView(), value);
		}
	}

	systemAppearance(): 'dark' | 'light' | null {
		// return cached value, or get it from the platform specific override
		return (this._systemAppearance ??= this.getSystemAppearance());
	}

	/**
	 * enable/disable systemAppearanceChanged
	 */
	setAutoSystemAppearanceChanged(value: boolean): void {
		this.autoSystemAppearanceChanged = value;
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
		this.applyCssClass(rootView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass, true);

		const rootModalViews = rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(rootModalView as View, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass, true);

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

	layoutDirection(): CoreTypes.LayoutDirectionType | null {
		// return cached value, or get it from the platform specific override
		return (this._layoutDirection ??= this.getLayoutDirection());
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
		this.applyCssClass(rootView, LAYOUT_DIRECTION_CSS_CLASSES, newLayoutDirectionCssClass, true);

		const rootModalViews = rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(rootModalView as View, LAYOUT_DIRECTION_CSS_CLASSES, newLayoutDirectionCssClass, true);

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
