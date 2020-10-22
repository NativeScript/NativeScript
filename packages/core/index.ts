/// <reference path="./global-types.d.ts" />
// Init globals first (use import to ensure it's always at the top)
import './globals';

export { iOSApplication, AndroidApplication } from './application';
export type { ApplicationEventData, LaunchEventData, OrientationChangedEventData, UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData, AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData, SystemAppearanceChangedEventData } from './application';

import { launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent, suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent, systemAppearanceChanged, systemAppearanceChangedEvent, getMainEntry, getRootView, _resetRootView, getResources, setResources, setCssFileName, getCssFileName, loadAppCss, addCss, on, off, notify, hasListeners, run, orientation, getNativeApplication, hasLaunched, android as appAndroid, ios as iosApp, systemAppearance } from './application';
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
	systemAppearanceChangedEvent,
	systemAppearanceChanged,

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
	notify,
	hasListeners,
	run,
	orientation,
	getNativeApplication,
	hasLaunched,
	systemAppearance,

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

export { CSSUtils } from './css/system-classes';

export { ObservableArray, ChangeType } from './data/observable-array';
export type { ChangedData } from './data/observable-array';
export { Observable, WrappedValue, fromObject, fromObjectRecursive } from './data/observable';
export type { PropertyChangeData, EventData } from './data/observable';
export { VirtualArray } from './data/virtual-array';
export type { ItemsLoading } from './data/virtual-array';
export { File, FileSystemEntity, Folder, knownFolders, path, getFileAccess } from './file-system';

// Export all interfaces from "http" module
export type { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from './http';
// Export all methods from "http" as Http
import { getFile, getImage, getJSON, getString as httpGetString, request } from './http';
export const Http = {
	getFile,
	getImage,
	getJSON,
	getString: httpGetString,
	request,
};

export { ImageAsset } from './image-asset';
export type { ImageAssetOptions } from './image-asset';

export { ImageSource } from './image-source';
export { ModuleNameResolver, _setResolver } from './module-name-resolver';
export type { ModuleListProvider, PlatformContext } from './module-name-resolver';
export { isAndroid, isIOS, Screen, Device, platformNames } from './platform';
export type { IDevice } from './platform';

// Profiling
export { profile, enable as profilingEnable, disable as profilingDisable, time as profilingTime, uptime as profilingUptime, start as profilingStart, stop as profilingStop, isRunning as profilingIsRunning, dumpProfiles as profilingDumpProfiles, resetProfiles as profilingResetProfiles, startCPUProfile as profilingStartCPU, stopCPUProfile as profilingStopCPU } from './profiling';
export type { InstrumentationMode, TimerInfo } from './profiling';

export { encoding } from './text';
// for developers to be explicit if they desire around globals (allows access via Utils below)
import { setTimeout, setInterval, clearInterval, clearTimeout } from './timer';
export * from './trace';

export * from './ui';

import { GC, isFontIconURI, isDataURI, isFileOrResourcePath, executeOnMainThread, mainThreadify, isMainThread, dispatchToMainThread, releaseNativeObject, getModuleName, openFile, openUrl, isRealDevice, layout, ad as androidUtils, iOSNativeHelper as iosUtils, Source, RESOURCE_PREFIX, FILE_PREFIX } from './utils';
import { ClassInfo, getClass, getBaseClasses, getClassInfo, isBoolean, isDefined, isFunction, isNullOrUndefined, isNumber, isObject, isString, isUndefined, toUIString, verifyCallback } from './utils/types';

export const Utils = {
	GC,
	RESOURCE_PREFIX,
	FILE_PREFIX,
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
	setTimeout,
	setInterval,
	clearInterval,
	clearTimeout,
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
