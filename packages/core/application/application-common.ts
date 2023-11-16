import { initAccessibilityCssHelper } from '../accessibility/accessibility-css-helper';
import { initAccessibilityFontScale } from '../accessibility/font-scale';
import { CoreTypes } from '../core-types';
import { CSSUtils } from '../css/system-classes';
import { Device } from '../platform';
import { profile } from '../profiling';
import { Trace } from '../trace';
import { Builder } from '../ui/builder';
import * as bindableResources from '../ui/core/bindable/bindable-resources';
import type { View } from '../ui/core/view';
import type { Frame } from '../ui/frame';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { StyleScope } from '../ui/styling/style-scope';
import type { AndroidApplication as IAndroidApplication, iOSApplication as IiOSApplication } from './';
import type { ApplicationEventData, CssChangedEventData, DiscardedErrorEventData, FontScaleChangedEventData, InitRootViewEventData, LaunchEventData, LoadAppCSSEventData, NativeScriptError, OrientationChangedEventData, SystemAppearanceChangedEventData, UnhandledErrorEventData } from './application-interfaces';

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

const globalEvents = global.NativeScriptGlobals.events;

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
	 * This event is raised when application css is changed.
	 */
	on(event: 'cssChanged', callback: (args: CssChangedEventData) => void, thisArg?: any): void;

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
	once: ApplicationEvents['once'] = globalEvents.on.bind(globalEvents);
	notify: ApplicationEvents['notify'] = globalEvents.notify.bind(globalEvents);
	hasListeners: ApplicationEvents['hasListeners'] = globalEvents.hasListeners.bind(globalEvents);

	/**
	 * @internal - should not be constructed by the user.
	 */
	constructor() {
		global.NativeScriptGlobals.appInstanceReady = true;

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
	 */
	applyCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
		if (!rootView.cssClasses.has(newCssClass)) {
			cssClasses.forEach((cssClass) => this.removeCssClass(rootView, cssClass));
			this.addCssClass(rootView, newCssClass);
			this.increaseStyleScopeApplicationCssSelectorVersion(rootView);
			rootView._onCssStateChange();

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

	private increaseStyleScopeApplicationCssSelectorVersion(rootView: View) {
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

		rootView.cssClasses.add(CSSUtils.ROOT_VIEW_CSS_CLASS);
		const rootViewCssClasses = CSSUtils.getSystemCssClasses();
		rootViewCssClasses.forEach((c) => rootView.cssClasses.add(c));

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

	protected mainEntry: NavigationEntry;

	/**
	 * @returns The main entry of the application
	 */
	getMainEntry() {
		return this.mainEntry;
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
				if (!this.mainEntry) {
					throw new Error('Main entry is missing. App cannot be started. Verify app bootstrap.');
				}

				rootView = Builder.createViewFromEntry(this.mainEntry);
			}
		}

		return rootView;
	}

	getRootView(): View {
		throw new Error('getRootView() Not implemented.');
	}

	resetRootView(entry?: NavigationEntry | string) {
		this.mainEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
		// rest of implementation is platform specific
	}

	initRootView(rootView: View) {
		this.setRootViewCSSClasses(rootView);
		initAccessibilityCssHelper();
		initAccessibilityFontScale();
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

	private cssFile = './app.css';
	/**
	 * Sets css file name for the application.
	 */
	setCssFileName(cssFileName: string) {
		this.cssFile = cssFileName;
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
		return this.cssFile;
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

	private _orientation: 'portrait' | 'landscape' | 'unknown';

	protected getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		// override in platform specific Application class
		throw new Error('getOrientation() not implemented');
	}

	protected setOrientation(value: 'portrait' | 'landscape' | 'unknown') {
		if (this._orientation === value) {
			return;
		}
		this._orientation = value;
		this.orientationChanged(this.getRootView(), value);
		this.notify(<OrientationChangedEventData>{
			eventName: this.orientationChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
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
		this.applyCssClass(rootView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);

		const rootModalViews = <Array<View>>rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(rootModalView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);
		});
	}

	getNativeApplication(): any {
		// override in platform specific Application class
		throw new Error('getNativeApplication() not implemented');
	}

	hasLaunched(): boolean {
		return global.NativeScriptGlobals && global.NativeScriptGlobals.launched;
	}

	private _systemAppearance: 'dark' | 'light' | null;

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

	systemAppearance(): 'dark' | 'light' | null {
		// return cached value, or get it from the platform specific override
		return (this._systemAppearance ??= this.getSystemAppearance());
	}

	/**
	 * Boolean to enable/disable systemAppearanceChanged
	 */
	autoSystemAppearanceChanged = true;

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
		this.applyCssClass(rootView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);

		const rootModalViews = rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(rootModalView as View, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);
		});
	}

	private _inBackground: boolean = false;

	get inBackground() {
		return this._inBackground;
	}

	setInBackground(value: boolean, additonalData?: any) {
		this._inBackground = value;

		this.notify(<ApplicationEventData>{
			eventName: value ? this.backgroundEvent : this.foregroundEvent,
			object: this,
			ios: this.ios,

			...additonalData,
		});
	}

	private _suspended: boolean = false;

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

	public started = false;

	get android(): IAndroidApplication {
		return undefined;
	}

	get ios(): IiOSApplication {
		return undefined;
	}

	get AndroidApplication() {
		return this.android;
	}

	get iOSApplication() {
		return this.ios;
	}
}
