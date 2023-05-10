// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./global-types.d.ts" />
// Init globals first (use import to ensure it's always at the top)
import './globals';

export { iOSApplication, AndroidApplication } from './application';
export type {
	ApplicationEventData,
	LaunchEventData,
	OrientationChangedEventData,
	UnhandledErrorEventData,
	DiscardedErrorEventData,
	CssChangedEventData,
	LoadAppCSSEventData,
	AndroidActivityEventData,
	AndroidActivityBundleEventData,
	AndroidActivityRequestPermissionsEventData,
	AndroidActivityResultEventData,
	AndroidActivityNewIntentEventData,
	AndroidActivityBackPressedEventData,
	SystemAppearanceChangedEventData,
} from './application';

// export * as Application from './application';
export * from './application';

// import { fontScaleChangedEvent, launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent, suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent, systemAppearanceChanged, systemAppearanceChangedEvent, getMainEntry, getRootView, _resetRootView, getResources, setResources, setCssFileName, getCssFileName, loadAppCss, addCss, on, off, notify, hasListeners, run, orientation, getNativeApplication, hasLaunched, android as appAndroid, ios as iosApp, systemAppearance, setAutoSystemAppearanceChanged, ensureNativeApplication, setMaxRefreshRate } from './application';
// import { inBackground, suspended, foregroundEvent, backgroundEvent } from './application/application-common';

// export const Application = {
// 	launchEvent,
// 	displayedEvent,
// 	uncaughtErrorEvent,
// 	discardedErrorEvent,
// 	suspendEvent,
// 	resumeEvent,
// 	exitEvent,
// 	foregroundEvent,
// 	backgroundEvent,
// 	lowMemoryEvent,
// 	orientationChangedEvent,
// 	systemAppearanceChangedEvent,
// 	systemAppearanceChanged,
// 	fontScaleChangedEvent,
// 	setMaxRefreshRate,

// 	getMainEntry,
// 	getRootView,
// 	resetRootView: _resetRootView,
// 	getResources,
// 	setResources,
// 	setCssFileName,
// 	getCssFileName,
// 	loadAppCss,
// 	addCss,
// 	on,
// 	off,
// 	notify,
// 	hasListeners,
// 	run,
// 	orientation,
// 	getNativeApplication,
// 	hasLaunched,
// 	systemAppearance,
// 	setAutoSystemAppearanceChanged,
// 	get android() {
// 		ensureNativeApplication();
// 		return appAndroid;
// 	},
// 	get ios() {
// 		ensureNativeApplication();
// 		return iosApp;
// 	},
// 	get suspended() {
// 		return suspended;
// 	},
// 	get inBackground() {
// 		return inBackground;
// 	},
// };

export * as ApplicationSettings from './application-settings';
// // Export all methods from "application-settings" as ApplicationSettings
// import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from './application-settings';
// export const ApplicationSettings = {
// 	clear,
// 	flush,
// 	hasKey,
// 	remove,
// 	setString,
// 	getString,
// 	getAllKeys,
// 	getBoolean,
// 	setBoolean,
// 	getNumber,
// 	setNumber,
// };

import * as Accessibility from './accessibility';
export namespace AccessibilityEvents {
	export const accessibilityBlurEvent = Accessibility.accessibilityBlurEvent;
	export const accessibilityFocusEvent = Accessibility.accessibilityFocusEvent;
	export const accessibilityFocusChangedEvent =
		Accessibility.accessibilityFocusChangedEvent;
	export const accessibilityPerformEscapeEvent =
		Accessibility.accessibilityPerformEscapeEvent;
}
// export const AccessibilityEvents = {
// 	accessibilityBlurEvent,
// 	accessibilityFocusEvent,
// 	accessibilityFocusChangedEvent,
// 	accessibilityPerformEscapeEvent,
// };
export {
	AccessibilityLiveRegion,
	AccessibilityRole,
	AccessibilityState,
	AccessibilityTrait,
	FontScaleCategory,
} from './accessibility';

export { Color } from './color';

export * as Connectivity from './connectivity';
// import { connectionType, getConnectionType, startMonitoring, stopMonitoring } from './connectivity';
// export const Connectivity = {
// 	connectionType,
// 	getConnectionType,
// 	startMonitoring,
// 	stopMonitoring,
// };

export * from './core-types';

export { CSSUtils } from './css/system-classes';

export { ObservableArray, ChangeType } from './data/observable-array';
export type { ChangedData } from './data/observable-array';
export {
	Observable,
	WrappedValue,
	fromObject,
	fromObjectRecursive,
} from './data/observable';
export type { PropertyChangeData, EventData } from './data/observable';
export { VirtualArray } from './data/virtual-array';
export type { ItemsLoading } from './data/virtual-array';
export {
	File,
	FileSystemEntity,
	Folder,
	knownFolders,
	path,
	getFileAccess,
	AndroidDirectory,
} from './file-system';

// Export all interfaces from "http" module
export type {
	HttpRequestOptions,
	HttpResponse,
	Headers,
	HttpResponseEncoding,
	HttpContent,
} from './http';
export * as Http from './http';

// Export all methods from "http" as Http
// import { getFile, getImage, getJSON, getString as httpGetString, request } from './http';
// export const Http = {
// 	getFile,
// 	getImage,
// 	getJSON,
// 	getString: httpGetString,
// 	request,
// };

export { ImageAsset } from './image-asset';
export type { ImageAssetOptions } from './image-asset';

export { ImageSource } from './image-source';
export { ModuleNameResolver, _setResolver } from './module-name-resolver';
export type { ModuleListProvider, PlatformContext } from './module-name-resolver';
export { isAndroid, isIOS, Screen, Device, platformNames } from './platform';
export type { IDevice } from './platform';

// Profiling
export {
	profile,
	enable as profilingEnable,
	disable as profilingDisable,
	time as profilingTime,
	uptime as profilingUptime,
	start as profilingStart,
	stop as profilingStop,
	isRunning as profilingIsRunning,
	dumpProfiles as profilingDumpProfiles,
	resetProfiles as profilingResetProfiles,
	startCPUProfile as profilingStartCPU,
	stopCPUProfile as profilingStopCPU,
} from './profiling';
export type { InstrumentationMode, TimerInfo } from './profiling';
export { encoding } from './text';
export * from './trace';
export * from './ui';
export * as Utils from './utils';

export { XmlParser, ParserEventType, ParserEvent } from './xml';
