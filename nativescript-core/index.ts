/// <reference path="./tns-core-modules.d.ts" />

// Export all interfaces from "application" module
export {
    ApplicationEventData, LaunchEventData, OrientationChangedEventData,
    UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData,

    iOSApplication, AndroidApplication,

    AndroidActivityEventData, AndroidActivityBundleEventData,
    AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData,
    AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData,
} from "./application";

// Export all methods and fields from "application" as Application
import {
    launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent,
    suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent,

    getMainEntry, getRootView, setResources, setCssFileName, getCssFileName, loadAppCss, addCss,
    on, off, run, orientation, getNativeApplication, hasLaunched,

    android, ios,
} from "./application";
export const Application = {
    launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent,
    suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent,

    getMainEntry, getRootView, setResources, setCssFileName, getCssFileName, loadAppCss, addCss,
    on, off, run, orientation, getNativeApplication, hasLaunched,

    android, ios,
};

// Export all methods from "application-settings" as ApplicationSettings
import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from "./application-settings";
export const ApplicationSettings = { clear, flush, hasKey, remove, setString, getString, getAllKeys, getBoolean, setBoolean, getNumber, setNumber };

export { Color } from "./color";

import { connectionType, getConnectionType, startMonitoring, stopMonitoring } from "./connectivity";
export const Connectivity = { connectionType, getConnectionType, startMonitoring, stopMonitoring };

export { ObservableArray, ChangeType, ChangedData } from "./data/observable-array";
export { Observable, PropertyChangeData, EventData } from "./data/observable";
export { File, FileSystemEntity, Folder, knownFolders, path } from "./file-system";

// Export all interfaces from "http" module
export { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from "./http";
// Export all methods from "http" as ApplicationSettings
import { getFile, getImage, getJSON, getString as httpGetString, request } from "./http";
export const Http = { getFile, getImage, getJSON, getString: httpGetString, request };

export { ImageAsset, ImageAssetOptions } from "./image-asset";

export { ImageSource } from "./image-source";
export { isAndroid, isIOS, screen as Screen, device as Device } from "./platform";

// Export interfaces from "profiling" module
export { InstrumentationMode, TimerInfo } from "./profiling";
// Export methods from "profiling" module
import {
    enable as profilingEnable, disable as profilingDisable,
    time, uptime,
    start, stop, isRunning,
    dumpProfiles, resetProfiles,
    profile, startCPUProfile, stopCPUProfile,
} from "./profiling";
export const Profiling = {
    enable: profilingEnable,
    disable: profilingDisable,
    time, uptime,
    start, stop, isRunning,
    dumpProfiles, resetProfiles,
    profile, startCPUProfile, stopCPUProfile,
};

export { encoding } from "./text";

export { DefaultErrorHandler, ErrorHandler, TraceWriter } from "./trace";
import {
    messageType, categories, setCategories, addCategories,
    addWriter, removeWriter, clearWriters,
    setErrorHandler,
    write, error, enable, disable, isEnabled
} from "./trace";

export const Trace = {
    messageType, categories, setCategories, addCategories,
    addWriter, removeWriter, clearWriters,
    setErrorHandler,
    write, error, enable, disable, isEnabled
};

export * from "./ui"; // Barrel export

import {
    GC, isFontIconURI, isDataURI, isFileOrResourcePath,
    executeOnMainThread, mainThreadify, isMainThread, dispatchToMainThread, releaseNativeObject,
    getModuleName,
    openFile, openUrl,
    layout, ad as androidUtils, ios as iosUtils
} from "./utils/utils";

export const Utils = {
    GC, isFontIconURI, isDataURI, isFileOrResourcePath,
    executeOnMainThread, mainThreadify, isMainThread, dispatchToMainThread, releaseNativeObject,

    getModuleName,
    openFile, openUrl,

    layout, android: androidUtils, ios: iosUtils
};

export { XmlParser, ParserEventType, ParserEvent } from "./xml";
