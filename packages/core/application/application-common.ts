// Require globals first so that snapshot takes __extends function.
// import '../globals';

import { Observable } from '../data/observable';
import { CoreTypes } from '../core-types';
import { CSSUtils } from '../css/system-classes';
import { Trace } from '../trace';
import * as bindableResources from '../ui/core/bindable/bindable-resources';
import { View } from '../ui/core/view';
import { NavigationEntry } from '../ui/frame/frame-interfaces';
import type {
	AndroidApplication as IAndroidApplication,
	iOSApplication as IiOSApplication,
} from './';
import { CssChangedEventData, LoadAppCSSEventData } from './application-interfaces';
import {
	OrientationChangedEventData,
	SystemAppearanceChangedEventData,
} from './application-interfaces';

const ORIENTATION_CSS_CLASSES = [
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.portrait}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.landscape}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.unknown}`,
];

const SYSTEM_APPEARANCE_CSS_CLASSES = [
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.light}`,
	`${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.dark}`,
];

export class ApplicationCommon extends Observable {
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

	constructor() {
		super();

		global.NativeScriptGlobals.appInstanceReady = true;
	}

	/**
	 * Ensure css-class is set on rootView
	 */
	applyCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
		if (!rootView.cssClasses.has(newCssClass)) {
			cssClasses.forEach((cssClass) => this.removeCssClass(rootView, cssClass));
			this.addCssClass(rootView, newCssClass);
			this.increaseStyleScopeApplicationCssSelectorVersion(rootView);
			rootView._onCssStateChange();
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
		const styleScope =
			rootView._styleScope ||
			((<any>rootView).currentPage && (<any>rootView).currentPage._styleScope);

		if (styleScope) {
			styleScope._increaseApplicationCssSelectorVersion();
		}
	}

	/**
	 * iOS Only
	 * Dynamically change the preferred frame rate
	 * For devices (iOS 15+) which support min/max/preferred frame rate you can specify ranges
	 * For devices (iOS < 15), you can specify the max frame rate
	 * see: https://developer.apple.com/documentation/quartzcore/optimizing_promotion_refresh_rates_for_iphone_13_pro_and_ipad_pro
	 * To use, ensure your Info.plist has:
	 *   <key>CADisableMinimumFrameDurationOnPhone</key>
	 *   <true/>
	 * @param options { min?: number; max?: number; preferred?: number }
	 */
	setMaxRefreshRate(options?: { min?: number; max?: number; preferred?: number }) {
		//
	}

	mainEntry: NavigationEntry;
	getMainEntry() {
		return this.mainEntry;
	}

	getRootView(): View {
		// ensureNativeApplication();
		// return iosApp.rootView;
		// return this.rootView;
		throw new Error('getRootView() Not implemented.');
	}

	resetRootView(entry?: NavigationEntry | string) {
		this.mainEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
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

	cssFile = './app.css';
	/**
	 * Sets css file name for the application.
	 */
	setCssFileName(cssFileName: string) {
		this.cssFile = cssFileName;
		this.notify(<CssChangedEventData>{
			eventName: 'cssChanged',
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
				eventName: 'loadAppCss',
				object: this, // app,
				cssFile: this.getCssFileName(),
			});
		} catch (e) {
			if (Trace.isEnabled()) {
				Trace.write(
					`The app CSS file ${this.getCssFileName()} couldn't be loaded!`,
					Trace.categories.Style,
					Trace.messageType.warn
				);
			}
		}
	}

	addCss(cssText: string, attributeScoped?: boolean): void {
		this.notify(<CssChangedEventData>{
			eventName: 'cssChanged',
			object: this, // <any>iosApp,
			cssText: cssText,
		});
		if (!attributeScoped) {
			const rootView = this.getRootView();
			if (rootView) {
				rootView._onCssStateChange();
			}
		}
	}

	on = global.NativeScriptGlobals.events.on.bind(global.NativeScriptGlobals.events);
	off = global.NativeScriptGlobals.events.off.bind(global.NativeScriptGlobals.events);
	notify = global.NativeScriptGlobals.events.notify.bind(
		global.NativeScriptGlobals.events
	);
	hasListeners = global.NativeScriptGlobals.events.hasListeners.bind(
		global.NativeScriptGlobals.events
	);

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

	get orientation(): 'portrait' | 'landscape' | 'unknown' {
		return (this._orientation ??= this.getOrientation());
	}

	orientationChanged(
		rootView: View,
		newOrientation: 'portrait' | 'landscape' | 'unknown'
	): void {
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

	private _systemAppearance: 'dark' | 'light';

	protected getSystemAppearance(): 'dark' | 'light' {
		// override in platform specific Application class
		throw new Error('getSystemAppearance() not implemented');
	}

	protected setSystemAppearance(value: 'dark' | 'light') {
		if (this._systemAppearance === value) {
			return;
		}
		this._systemAppearance = value;
		this.setRootViewsSystemAppearanceCssClass(this.getRootView());
		this.systemAppearanceChanged(this.getRootView(), value);
		this.notify(<SystemAppearanceChangedEventData>{
			eventName: this.systemAppearanceChangedEvent,
			android: this.android,
			ios: this.ios,
			newValue: value,
			object: this,
		});
	}

	setRootViewsSystemAppearanceCssClass(rootView: View): void {
		const systemAppearance = this.systemAppearance;
		const systemAppearanceCssClass = `${CSSUtils.CLASS_PREFIX}${systemAppearance}`;
		CSSUtils.pushToSystemCssClasses(systemAppearanceCssClass);
		rootView.cssClasses.add(systemAppearanceCssClass);
	}

	get systemAppearance(): 'dark' | 'light' {
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
		this.applyCssClass(
			rootView,
			SYSTEM_APPEARANCE_CSS_CLASSES,
			newSystemAppearanceCssClass
		);

		const rootModalViews = <Array<View>>rootView._getRootModalViews();
		rootModalViews.forEach((rootModalView) => {
			this.applyCssClass(
				rootModalView,
				SYSTEM_APPEARANCE_CSS_CLASSES,
				newSystemAppearanceCssClass
			);
		});
	}

	get android(): IAndroidApplication {
		return undefined;
	}

	get ios(): IiOSApplication {
		return undefined;
	}

	get inBackground() {
		return false;
	}

	get suspended() {
		return false;
	}

	setSuspended(suspended: boolean) {
		// TODO
	}

	get AndroidApplication() {
		return this.android;
	}

	get iOSApplication() {
		return this.ios;
	}

	public started = false;
}

// export const AndroidApplication: IAndroidApplication = undefined;
// export const iOSApplication: IiOSApplication = undefined;
