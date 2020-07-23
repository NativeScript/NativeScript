/// <reference path="./global-types.d.ts" />

// Init globals first
import { initGlobal } from './globals';
initGlobal();

// Export all interfaces from "application" module
export { ApplicationEventData, LaunchEventData, OrientationChangedEventData, UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData, iOSApplication, AndroidApplication, AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData } from './application';

// Export all methods and fields from "application" as Application
import { launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent, suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent, getMainEntry, getRootView, _resetRootView, getResources, setResources, setCssFileName, getCssFileName, loadAppCss, addCss, on, off, run, orientation, getNativeApplication, hasLaunched, android as appAndroid, ios as iosApp } from './application';
export const Application = {
	launchEvent,
	displayedEvent,
	uncaughtErrorEvent,
	discardedErrorEvent,
	suspendEvent,
	resumeEvent,
	exitEvent,
	lowMemoryEvent,
	orientationChangedEvent,

	getMainEntry,
	getRootView,
	resetRootView: _resetRootView,
	getResources,
	setResources,
	setCssFileName,
	getCssFileName,
	loadAppCss,
	addCss,
	on,
	off,
	run,
	orientation,
	getNativeApplication,
	hasLaunched,

	android: appAndroid,
	ios: iosApp,
};

// Export all methods from "application-settings" as ApplicationSettings
import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from './application-settings';
export const ApplicationSettings = {
	clear,
	flush,
	hasKey,
	remove,
	setString,
	getString,
	getAllKeys,
	getBoolean,
	setBoolean,
	getNumber,
	setNumber,
};

export { Color } from './color';

import { connectionType, getConnectionType, startMonitoring, stopMonitoring } from './connectivity';
export const Connectivity = {
	connectionType,
	getConnectionType,
	startMonitoring,
	stopMonitoring,
};

export { ObservableArray, ChangeType, ChangedData } from './data/observable-array';
export { Observable, PropertyChangeData, EventData, WrappedValue, fromObject, fromObjectRecursive } from './data/observable';
export { VirtualArray, ItemsLoading } from './data/virtual-array';
export { File, FileSystemEntity, Folder, knownFolders, path } from './file-system';

// Export all interfaces from "http" module
export { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from './http';
// Export all methods from "http" as Http
import { getFile, getImage, getJSON, getString as httpGetString, request } from './http';
export const Http = {
	getFile,
	getImage,
	getJSON,
	getString: httpGetString,
	request,
};

export { ImageAsset, ImageAssetOptions } from './image-asset';

export { ImageSource } from './image-source';
export { ModuleNameResolver, ModuleListProvider, PlatformContext, _setResolver } from './module-name-resolver';
export { isAndroid, isIOS, Screen, IDevice, Device, platformNames } from './platform';

// Profiling
export { InstrumentationMode, TimerInfo, profile, enable as profilingEnable, disable as profilingDisable, time as profilingTime, uptime as profilingUptime, start as profilingStart, stop as profilingStop, isRunning as profilingIsRunning, dumpProfiles as profilingDumpProfiles, resetProfiles as profilingResetProfiles, startCPUProfile as profilingStartCPU, stopCPUProfile as profilingStopCPU } from './profiling';

export { encoding } from './text';

export * from './trace';

export * from './ui';

import { GC, isFontIconURI, isDataURI, isFileOrResourcePath, executeOnMainThread, mainThreadify, isMainThread, dispatchToMainThread, releaseNativeObject, getModuleName, openFile, openUrl, isRealDevice, layout, ad as androidUtils, iOSNativeHelper as iosUtils, Source } from './utils';
import { ClassInfo, getClass, getBaseClasses, getClassInfo, isBoolean, isDefined, isFunction, isNullOrUndefined, isNumber, isObject, isString, isUndefined, toUIString, verifyCallback } from './utils/types';

export const Utils = {
	GC,
	isFontIconURI,
	isDataURI,
	isFileOrResourcePath,
	executeOnMainThread,
	mainThreadify,
	isMainThread,
	dispatchToMainThread,
	releaseNativeObject,

	getModuleName,
	openFile,
	openUrl,
	isRealDevice,

	layout,
	android: androidUtils,
	// legacy (a lot of plugins use the shorthand "ad" Utils.ad instead of Utils.android)
	ad: androidUtils,
	ios: iosUtils,
	Source,
	ClassInfo,
	getClass,
	getBaseClasses,
	getClassInfo,
	isBoolean,
	isDefined,
	isFunction,
	isNullOrUndefined,
	isNumber,
	isObject,
	isString,
	isUndefined,
	toUIString,
	verifyCallback,
};

export { XmlParser, ParserEventType, ParserEvent } from './xml';
