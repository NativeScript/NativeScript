// Export all interfaces from "application" module
export {
    ApplicationEventData, LaunchEventData, OrientationChangedEventData,
    UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData,

    iOSApplication, AndroidApplication,

    AndroidActivityEventData, AndroidActivityBundleEventData,
    AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData,
    AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData,
} from "./application"

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

// TODO: Should the ImageSource be inside nsImageSource. Probably "yes" but still give it a thought.
// import { ImageSource, fromAsset, fromBase64, fromData, fromFile, fromFileOrResource, fromFontIconCode, fromNativeSource, fromResource, fromUrl } from "./image-source";
// export const nsImageSource = { ImageSource, fromAsset, fromBase64, fromData, fromFile, fromFileOrResource, fromFontIconCode, fromNativeSource, fromResource, fromUrl };

export { isAndroid, isIOS, screen } from "./platform";

// TODO: eExport Profiling
// export {
//     InstrumentationMode, Level, TimerInfo, disable, dumpProfiles,
//     enable, isRunning, level, log, profile, resetProfiles, start,
//     startCPUProfile, stop, stopCPUProfile, time, timer, trace, uptime
// } from "./profiling";

export { encoding } from "./text";

// No need to export timer - they are registered in global as polyfills
// import { clearInterval, clearTimeout, setInterval, setTimeout } from "./timer";
// export const Timer = { clearInterval, clearTimeout, setInterval, setTimeout };

import { DefaultErrorHandler, addCategories, addEventListener, addWriter, categories, clearWriters, disable, enable, error, getErrorHandler, isCategorySet, isEnabled, messageType, notifyEvent, removeEventListener, removeWriter, setCategories, setErrorHandler, write } from "./trace";
export const nsTrace = { DefaultErrorHandler, addCategories, addEventListener, addWriter, categories, clearWriters, disable, enable, error, getErrorHandler, isCategorySet, isEnabled, messageType, notifyEvent, removeEventListener, removeWriter, setCategories, setErrorHandler, write }

export * from "./ui" // Barrel export

// TODO: Export Utils
// import {
//     GC, isDataURI, ad, convertString, eliminateDuplicates, escapeRegexSymbols,
//     hasDuplicates, ios as tnsIOS, isFileOrResourcePath, mergeSort, openUrl, layout
// } from "./utils/utils";

// export const nsUtils = {
//     GC, isDataURI, ad, convertString, eliminateDuplicates, escapeRegexSymbols, 
//     hasDuplicates, ios: tnsIOS, isFileOrResourcePath, mergeSort, openUrl, layout
// };

export { XmlParser, ParserEventType, ParserEvent } from "./xml"