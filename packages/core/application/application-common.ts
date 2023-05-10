// Require globals first so that snapshot takes __extends function.
import '../globals';

// Types
import type * as IApplication from '.';
import { AndroidApplication, iOSApplication } from '.';
import { CssChangedEventData, DiscardedErrorEventData, LoadAppCSSEventData, UnhandledErrorEventData } from './application-interfaces';
import { View } from '../ui/core/view';

// Requires
import * as bindableResources from '../ui/core/bindable/bindable-resources';
import { CSSUtils } from '../css/system-classes';
import { CoreTypes } from '../core-types';
import { Trace } from '../trace';

export * from './application-interfaces';

export function hasLaunched(): boolean {
	return global.NativeScriptGlobals && global.NativeScriptGlobals.launched;
}

export const launchEvent = 'launch';
export const suspendEvent = 'suspend';
export const displayedEvent = 'displayed';
export const backgroundEvent = 'background';
export const foregroundEvent = 'foreground';
export const resumeEvent = 'resume';
export const exitEvent = 'exit';
export const lowMemoryEvent = 'lowMemory';
export const uncaughtErrorEvent = 'uncaughtError';
export const discardedErrorEvent = 'discardedError';
export const orientationChangedEvent = 'orientationChanged';
export const systemAppearanceChangedEvent = 'systemAppearanceChanged';
export const fontScaleChangedEvent = 'fontScaleChanged';

const ORIENTATION_CSS_CLASSES = [`${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.portrait}`, `${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.landscape}`, `${CSSUtils.CLASS_PREFIX}${CoreTypes.DeviceOrientation.unknown}`];

const SYSTEM_APPEARANCE_CSS_CLASSES = [`${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.light}`, `${CSSUtils.CLASS_PREFIX}${CoreTypes.SystemAppearance.dark}`];

let cssFile = './app.css';

/**
 * Get application level static resources.
 */
export function getResources() {
	return bindableResources.get();
}

/**
 * Set application level static resources.
 */
export function setResources(res: any) {
	bindableResources.set(res);
}

export const android: AndroidApplication = undefined;
export const ios: iOSApplication = undefined;

export const on = global.NativeScriptGlobals.events.on.bind(global.NativeScriptGlobals.events) as typeof IApplication.on;
export const off = global.NativeScriptGlobals.events.off.bind(global.NativeScriptGlobals.events) as typeof IApplication.off;
export const notify = global.NativeScriptGlobals.events.notify.bind(global.NativeScriptGlobals.events) as typeof IApplication.notify;
export const hasListeners = global.NativeScriptGlobals.events.hasListeners.bind(global.NativeScriptGlobals.events) as typeof IApplication.hasListeners;

let app: iOSApplication | AndroidApplication;
export function setApplication(instance: iOSApplication | AndroidApplication): void {
	app = instance;
	// signal when the application instance is ready globally
	global.NativeScriptGlobals.appInstanceReady = true;
}

export function livesync(rootView: View, context?: ModuleContext) {
	notify({ eventName: 'livesync', object: app });
	const liveSyncCore = global.__onLiveSyncCore;
	let reapplyAppStyles = false;

	// ModuleContext is available only for Hot Module Replacement
	if (context && context.path) {
		const styleExtensions = ['css', 'scss'];
		const appStylesFullFileName = getCssFileName();
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
 * Sets css file name for the application.
 */
export function setCssFileName(cssFileName: string) {
	cssFile = cssFileName;
	notify(<CssChangedEventData>{
		eventName: 'cssChanged',
		object: app,
		cssFile: cssFileName,
	});
}

/**
 * Gets css file name for the application.
 */
export function getCssFileName(): string {
	return cssFile;
}

/**
 * Loads immediately the app.css.
 * By default the app.css file is loaded shortly after "loaded".
 * For the Android snapshot the CSS can be parsed during the snapshot generation,
 * as the CSS does not depend on runtime APIs, and loadAppCss will be called explicitly.
 */
export function loadAppCss(): void {
	try {
		notify(<LoadAppCSSEventData>{
			eventName: 'loadAppCss',
			object: app,
			cssFile: getCssFileName(),
		});
	} catch (e) {
		if (Trace.isEnabled()) {
			Trace.write(`The app CSS file ${getCssFileName()} couldn't be loaded!`, Trace.categories.Style, Trace.messageType.warn);
		}
	}
}

function addCssClass(rootView: View, cssClass: string) {
	CSSUtils.pushToSystemCssClasses(cssClass);
	rootView.cssClasses.add(cssClass);
}

function removeCssClass(rootView: View, cssClass: string) {
	CSSUtils.removeSystemCssClass(cssClass);
	rootView.cssClasses.delete(cssClass);
}

function increaseStyleScopeApplicationCssSelectorVersion(rootView: View) {
	const styleScope = rootView._styleScope || ((<any>rootView).currentPage && (<any>rootView).currentPage._styleScope);

	if (styleScope) {
		styleScope._increaseApplicationCssSelectorVersion();
	}
}

/**
 * Ensure css-class is set on rootView
 */
export function applyCssClass(rootView: View, cssClasses: string[], newCssClass: string): void {
	if (!rootView.cssClasses.has(newCssClass)) {
		cssClasses.forEach((cssClass) => removeCssClass(rootView, cssClass));
		addCssClass(rootView, newCssClass);
		increaseStyleScopeApplicationCssSelectorVersion(rootView);
		rootView._onCssStateChange();
	}
}

export function orientationChanged(rootView: View, newOrientation: 'portrait' | 'landscape' | 'unknown'): void {
	if (!rootView) {
		return;
	}

	const newOrientationCssClass = `${CSSUtils.CLASS_PREFIX}${newOrientation}`;
	applyCssClass(rootView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => {
		applyCssClass(rootModalView, ORIENTATION_CSS_CLASSES, newOrientationCssClass);
	});
}

/**
 * Boolean to enable/disable systemAppearanceChanged
 */
export let autoSystemAppearanceChanged = true;

/**
 * enable/disable systemAppearanceChanged
 */
export function setAutoSystemAppearanceChanged(value: boolean): void {
	autoSystemAppearanceChanged = value;
}

/**
 * Updates root view classes including those of modals
 * @param rootView the root view
 * @param newSystemAppearance the new appearance change
 */
export function systemAppearanceChanged(rootView: View, newSystemAppearance: 'dark' | 'light'): void {
	if (!rootView || !autoSystemAppearanceChanged) {
		return;
	}

	const newSystemAppearanceCssClass = `${CSSUtils.CLASS_PREFIX}${newSystemAppearance}`;
	applyCssClass(rootView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => {
		applyCssClass(rootModalView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);
	});
}

export let inBackground = false;
export function setInBackground(value: boolean): void {
	inBackground = value;
}

export let suspended = false;
export function setSuspended(value: boolean): void {
	suspended = value;
}

global.__onUncaughtError = function (error: NativeScriptError) {
	notify(<UnhandledErrorEventData>{
		eventName: uncaughtErrorEvent,
		object: app,
		android: error,
		ios: error,
		error: error,
	});
};

global.__onDiscardedError = function (error: NativeScriptError) {
	notify(<DiscardedErrorEventData>{
		eventName: discardedErrorEvent,
		object: app,
		error: error,
	});
};
