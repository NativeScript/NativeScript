import {
    launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent,
    suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent,

    ApplicationEventData, LaunchEventData, OrientationChangedEventData,
    UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData,

    getMainEntry, getRootView, setResources, setCssFileName, getCssFileName, loadAppCss, addCss,
    on, off, run, orientation, getNativeApplication, hasLaunched,

    android, AndroidApplication, AndroidActivityEventData, AndroidActivityBundleEventData,

    AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData,
    ios, iOSApplication,
} from "./application";

export {
    ApplicationEventData, LaunchEventData, OrientationChangedEventData,
    UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData,
    
    iOSApplication, AndroidApplication, 
    
    AndroidActivityEventData, AndroidActivityBundleEventData,
    AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, 
    AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData,
} from "./application"

export const nsApp = {
    launchEvent, displayedEvent, uncaughtErrorEvent, discardedErrorEvent,
    suspendEvent, resumeEvent, exitEvent, lowMemoryEvent, orientationChangedEvent,

    getMainEntry, getRootView, setResources, setCssFileName, getCssFileName, loadAppCss, addCss,
    on, off, run, orientation, getNativeApplication, hasLaunched,

    android, ios,
};

import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from "./application-settings";
export const nsSettings = { clear, flush, hasKey, remove, setString, getString, getAllKeys, getBoolean, setBoolean, getNumber, setNumber };

export { Color } from "./color";

import { connectionType, getConnectionType, startMonitoring, stopMonitoring } from "./connectivity";
export const nsConnectivity = { connectionType, getConnectionType, startMonitoring, stopMonitoring };

export { ObservableArray, ChangeType, ChangedData } from "./data/observable-array";
export { Observable, PropertyChangeData, EventData } from "./data/observable";
export { File, FileSystemEntity, Folder, knownFolders, path } from "./file-system";

export { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from "./http";
import { getFile, getImage, getJSON, getString as httpGetString, request } from "./http";
export const nsHttp = { getFile, getImage, getJSON, getString: httpGetString, request };

export { ImageAsset, ImageAssetOptions } from "./image-asset";

// TODO: Should the ImageSource be inside nsImageSource. Probably "yes" but still give it a thought.
import { ImageSource, fromAsset, fromBase64, fromData, fromFile, fromFileOrResource, fromFontIconCode, fromNativeSource, fromResource, fromUrl } from "./image-source";
export const nsImageSource = { ImageSource, fromAsset, fromBase64, fromData, fromFile, fromFileOrResource, fromFontIconCode, fromNativeSource, fromResource, fromUrl };

export { isAndroid, isIOS, screen } from "./platform";

export {
    InstrumentationMode, Level, TimerInfo, disable, dumpProfiles,
    enable, isRunning, level, log, profile, resetProfiles, start,
    startCPUProfile, stop, stopCPUProfile, time, timer, trace, uptime
} from "./profiling";

export { encoding } from "./text";

import { clearInterval, clearTimeout, setInterval, setTimeout } from "./timer";
export const nsTimer = { clearInterval, clearTimeout, setInterval, setTimeout };

import { DefaultErrorHandler, addCategories, addEventListener, addWriter, categories, clearWriters, disable, enable, error, getErrorHandler, isCategorySet, isEnabled, messageType, notifyEvent, removeEventListener, removeWriter, setCategories, setErrorHandler, write } from "./trace";
export const nsTrace = { DefaultErrorHandler, addCategories, addEventListener, addWriter, categories, clearWriters, disable, enable, error, getErrorHandler, isCategorySet, isEnabled, messageType, notifyEvent, removeEventListener, removeWriter, setCategories, setErrorHandler, write }

export * from "./ui" // Barrel export

import {
    GC,
    isDataURI,
    ad,
    convertString,
    eliminateDuplicates,
    escapeRegexSymbols,
    hasDuplicates,
    ios as tnsIOS,
    isFileOrResourcePath,
    mergeSort,
    openUrl,
    layout
} from "./utils/utils";

export const nsUtils = {
    GC,
    isDataURI,
    ad,
    convertString,
    eliminateDuplicates,
    escapeRegexSymbols,
    hasDuplicates,
    ios: tnsIOS,
    isFileOrResourcePath,
    mergeSort,
    openUrl,
    layout
};

export { XmlParser, ParserEventType, ParserEvent } from "./xml"