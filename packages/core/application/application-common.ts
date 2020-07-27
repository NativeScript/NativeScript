// Require globals first so that snapshot takes __extends function.
const nsGlobals = require('../globals');
if (!(<any>global).hasInitGlobal) {
	nsGlobals.initGlobal();
}

// Types
import { AndroidApplication, iOSApplication } from '.';
import { CssChangedEventData, DiscardedErrorEventData, LoadAppCSSEventData, UnhandledErrorEventData } from './application-interfaces';
import { EventData } from '../data/observable';
import { View } from '../ui/core/view';

// Requires
import { Observable } from '../data/observable';
import * as bindableResources from '../ui/core/bindable/bindable-resources';
import { CSSUtils } from '../css/system-classes';
import { Enums } from '../ui/enums';

export * from './application-interfaces';

export function hasLaunched(): boolean {
	return (<any>global).NativeScriptGlobals && (<any>global).NativeScriptGlobals.launched;
}

export const launchEvent = 'launch';
export const suspendEvent = 'suspend';
export const displayedEvent = 'displayed';
export const resumeEvent = 'resume';
export const exitEvent = 'exit';
export const lowMemoryEvent = 'lowMemory';
export const uncaughtErrorEvent = 'uncaughtError';
export const discardedErrorEvent = 'discardedError';
export const orientationChangedEvent = 'orientationChanged';
export const systemAppearanceChangedEvent = 'systemAppearanceChanged';

const ORIENTATION_CSS_CLASSES = [`${CSSUtils.CLASS_PREFIX}${Enums.DeviceOrientation.portrait}`, `${CSSUtils.CLASS_PREFIX}${Enums.DeviceOrientation.landscape}`, `${CSSUtils.CLASS_PREFIX}${Enums.DeviceOrientation.unknown}`];

const SYSTEM_APPEARANCE_CSS_CLASSES = [`${CSSUtils.CLASS_PREFIX}${Enums.SystemAppearance.light}`, `${CSSUtils.CLASS_PREFIX}${Enums.SystemAppearance.dark}`];

let cssFile: string = './app.css';

export function getResources() {
	return bindableResources.get();
}

export function setResources(res: any) {
	bindableResources.set(res);
}

export let android: AndroidApplication = undefined;
export let ios: iOSApplication = undefined;

export const on = (<any>global).NativeScriptGlobals.events.on.bind((<any>global).NativeScriptGlobals.events);
export const off = (<any>global).NativeScriptGlobals.events.off.bind((<any>global).NativeScriptGlobals.events);
export const notify = (<any>global).NativeScriptGlobals.events.notify.bind((<any>global).NativeScriptGlobals.events);
export const hasListeners = (<any>global).NativeScriptGlobals.events.hasListeners.bind((<any>global).NativeScriptGlobals.events);

let app: iOSApplication | AndroidApplication;
export function setApplication(instance: iOSApplication | AndroidApplication): void {
	app = instance;
	// signal when the application instance is ready globally
	(<any>global).NativeScriptGlobals.appInstanceReady = true;
}

export function livesync(rootView: View, context?: ModuleContext) {
	(<any>global).NativeScriptGlobals.events.notify(<EventData>{ eventName: 'livesync', object: app });
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

export function setCssFileName(cssFileName: string) {
	cssFile = cssFileName;
	(<any>global).NativeScriptGlobals.events.notify(<CssChangedEventData>{
		eventName: 'cssChanged',
		object: app,
		cssFile: cssFileName,
	});
}

export function getCssFileName(): string {
	return cssFile;
}

export function loadAppCss(): void {
	try {
		(<any>global).NativeScriptGlobals.events.notify(<LoadAppCSSEventData>{
			eventName: 'loadAppCss',
			object: app,
			cssFile: getCssFileName(),
		});
	} catch (e) {
		throw new Error(`The app CSS file ${getCssFileName()} couldn't be loaded!`);
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

function applyCssClass(rootView: View, cssClasses: string[], newCssClass: string) {
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

export function systemAppearanceChanged(rootView: View, newSystemAppearance: 'dark' | 'light'): void {
	if (!rootView) {
		return;
	}

	const newSystemAppearanceCssClass = `${CSSUtils.CLASS_PREFIX}${newSystemAppearance}`;
	applyCssClass(rootView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => {
		applyCssClass(rootModalView, SYSTEM_APPEARANCE_CSS_CLASSES, newSystemAppearanceCssClass);
	});
}

global.__onUncaughtError = function (error: NativeScriptError) {
	(<any>global).NativeScriptGlobals.events.notify(<UnhandledErrorEventData>{
		eventName: uncaughtErrorEvent,
		object: app,
		android: error,
		ios: error,
		error: error,
	});
};

global.__onDiscardedError = function (error: NativeScriptError) {
	(<any>global).NativeScriptGlobals.events.notify(<DiscardedErrorEventData>{
		eventName: discardedErrorEvent,
		object: app,
		error: error,
	});
};
