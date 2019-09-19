/**
 * @module "@nativescript/core"
 */ /** */

/// <reference path="./tns-core-modules.d.ts" />

export * from "./application";
import { on, off } from "./application";
export declare const nsApp: {
    ios: import("./application/application").iOSApplication;
    android: import("./application/application").AndroidApplication;
    on: typeof on;
    off: typeof off;
};
import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from "./application-settings";
export declare const nsSettings: {
    clear: typeof clear;
    flush: typeof flush;
    hasKey: typeof hasKey;
    remove: typeof remove;
    setString: typeof setString;
    getString: typeof getString;
    getAllKeys: typeof getAllKeys;
    getBoolean: typeof getBoolean;
    setBoolean: typeof setBoolean;
    getNumber: typeof getNumber;
    setNumber: typeof setNumber;
};
export { Color } from "./color";
import { connectionType, getConnectionType, startMonitoring, stopMonitoring } from "./connectivity";
export declare const nsConnectivity: {
    connectionType: typeof connectionType;
    getConnectionType: typeof getConnectionType;
    startMonitoring: typeof startMonitoring;
    stopMonitoring: typeof stopMonitoring;
};
export { ObservableArray, ChangeType, ChangedData } from "./data/observable-array";
export { Observable, PropertyChangeData, EventData } from "./data/observable";
export { File, FileSystemEntity, Folder, knownFolders, path } from "./file-system";
export { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from "./http";
import { getFile, getImage, getJSON, getString as httpGetString, request } from "./http";
export declare const nsHttp: {
    getFile: typeof getFile;
    getImage: typeof getImage;
    getJSON: typeof getJSON;
    getString: typeof httpGetString;
    request: typeof request;
};
export { ImageAsset, ImageAssetOptions } from "./image-asset";
// export { ImageSource } from "./image-source";
import { ImageSource, fromAsset, fromBase64, fromData, fromFile, fromFileOrResource, fromFontIconCode, fromNativeSource, fromResource, fromUrl } from "./image-source";
export declare const nsImageSource: {
    ImageSource: typeof ImageSource;
    fromAsset: typeof fromAsset;
    fromBase64: typeof fromBase64;
    fromData: typeof fromData;
    fromFile: typeof fromFile;
    fromFileOrResource: typeof fromFileOrResource;
    fromFontIconCode: typeof fromFontIconCode;
    fromNativeSource: typeof fromNativeSource;
    fromResource: typeof fromResource;
    fromUrl: typeof fromUrl;
};
export { isAndroid, isIOS, screen } from "./platform";
export { InstrumentationMode, Level, TimerInfo, disable, dumpProfiles, enable, isRunning, level, log, profile, resetProfiles, start, startCPUProfile, stop, stopCPUProfile, time, timer, trace, uptime } from "./profiling";
export { encoding } from "./text";
import { clearInterval, clearTimeout, setInterval, setTimeout } from "./timer";
export declare const nsTimer: {
    clearInterval: typeof clearInterval;
    clearTimeout: typeof clearTimeout;
    setInterval: typeof setInterval;
    setTimeout: typeof setTimeout;
};
import * as trace from "./trace";
export declare const nsTrace: typeof trace;
export * from "./ui";
import { GC, isDataURI, ad, convertString, eliminateDuplicates, escapeRegexSymbols, hasDuplicates, ios as tnsIOS, isFileOrResourcePath, mergeSort, openUrl, layout } from "./utils/utils";
export declare const nsUtils: {
    GC: typeof GC;
    isDataURI: typeof isDataURI;
    ad: typeof ad;
    convertString: typeof convertString;
    eliminateDuplicates: typeof eliminateDuplicates;
    escapeRegexSymbols: typeof escapeRegexSymbols;
    hasDuplicates: typeof hasDuplicates;
    ios: typeof tnsIOS;
    isFileOrResourcePath: typeof isFileOrResourcePath;
    mergeSort: typeof mergeSort;
    openUrl: typeof openUrl;
    layout: typeof layout;
};
export { XmlParser, ParserEventType, ParserEvent } from "./xml";
