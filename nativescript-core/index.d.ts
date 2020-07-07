/// <reference path="./tns-core-modules.d.ts" />
export { ApplicationEventData, LaunchEventData, OrientationChangedEventData, UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData, iOSApplication, AndroidApplication, AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, AndroidActivityNewIntentEventData, AndroidActivityBackPressedEventData } from './application';
import { getMainEntry, getRootView, _resetRootView, setResources, setCssFileName, getCssFileName, loadAppCss, addCss, on, off, run, orientation, getNativeApplication, hasLaunched, AndroidApplication, iOSApplication } from './application';
export declare const Application: {
  launchEvent: string;
  displayedEvent: string;
  uncaughtErrorEvent: string;
  discardedErrorEvent: string;
  suspendEvent: string;
  resumeEvent: string;
  exitEvent: string;
  lowMemoryEvent: string;
  orientationChangedEvent: string;
  getMainEntry: typeof getMainEntry;
  getRootView: typeof getRootView;
  resetRootView: typeof _resetRootView;
  setResources: typeof setResources;
  setCssFileName: typeof setCssFileName;
  getCssFileName: typeof getCssFileName;
  loadAppCss: typeof loadAppCss;
  addCss: typeof addCss;
  on: typeof on;
  off: typeof off;
  run: typeof run;
  orientation: typeof orientation;
  getNativeApplication: typeof getNativeApplication;
  hasLaunched: typeof hasLaunched;
  android: AndroidApplication;
  ios: iOSApplication;
} = {
  launchEvent: 'launch',
  displayedEvent: 'displayed',
  uncaughtErrorEvent: 'uncaughtError',
  discardedErrorEvent: 'discardedError',
  suspendEvent: 'suspend',
  resumeEvent: 'resume',
  exitEvent: 'exit',
  lowMemoryEvent: 'lowMemory',
  orientationChangedEvent: 'orientationChanged',
  getMainEntry,
  getRootView,
  resetRootView,
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
  android,
  ios,
};
import { setString, getString, clear, flush, getAllKeys, getBoolean, getNumber, hasKey, remove, setBoolean, setNumber } from './application-settings';
export declare const ApplicationSettings: {
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
} = {
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
export declare const Connectivity: {
  connectionType: typeof connectionType;
  getConnectionType: typeof getConnectionType;
  startMonitoring: typeof startMonitoring;
  stopMonitoring: typeof stopMonitoring;
} = {
  connectionType,
  getConnectionType,
  startMonitoring,
  stopMonitoring,
};
export { ObservableArray, ChangeType, ChangedData } from './data/observable-array';
export { Observable, PropertyChangeData, EventData } from './data/observable';
export { VirtualArray, ItemsLoading } from './data/virtual-array';
export { File, FileSystemEntity, Folder, knownFolders, path } from './file-system';
export { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from './http';
import { getFile, getImage, getJSON, getString as httpGetString, request } from './http';
export declare const Http: {
  getFile: typeof getFile;
  getImage: typeof getImage;
  getJSON: typeof getJSON;
  getString: typeof httpGetString;
  request: typeof request;
} = {
  getFile,
  getImage,
  getJSON,
  getString,
  request,
};
export { ImageAsset, ImageAssetOptions } from './image-asset';
export { ImageSource } from './image-source';
export { isAndroid, isIOS, screen as Screen, IDevice, Device, platformNames } from './platform';
export { InstrumentationMode, TimerInfo } from './profiling';
import { enable as profilingEnable, disable as profilingDisable, time, uptime, start, stop, isRunning, dumpProfiles, resetProfiles, profile, startCPUProfile, stopCPUProfile } from './profiling';
export declare const Profiling: {
  enable: typeof profilingEnable;
  disable: typeof profilingDisable;
  time: typeof time;
  uptime: typeof uptime;
  start: typeof start;
  stop: typeof stop;
  isRunning: typeof isRunning;
  dumpProfiles: typeof dumpProfiles;
  resetProfiles: typeof resetProfiles;
  profile: typeof profile;
  startCPUProfile: typeof startCPUProfile;
  stopCPUProfile: typeof stopCPUProfile;
} = {
  enable: profilingEnable,
  disable: profilingDisable,
  time,
  uptime,
  start,
  stop,
  isRunning,
  dumpProfiles,
  resetProfiles,
  profile,
  startCPUProfile,
  stopCPUProfile,
};
export { encoding } from './text';
export * from './trace';

export * from './ui';
import { GC, isFontIconURI, isDataURI, isFileOrResourcePath, executeOnMainThread, mainThreadify, isMainThread, dispatchToMainThread, releaseNativeObject, getModuleName, openFile, openUrl, isRealDevice, layout, ad as androidUtils, ios as iosUtils } from './utils';
export declare const Utils: {
  GC: typeof GC;
  isFontIconURI: typeof isFontIconURI;
  isDataURI: typeof isDataURI;
  isFileOrResourcePath: typeof isFileOrResourcePath;
  executeOnMainThread: typeof executeOnMainThread;
  mainThreadify: typeof mainThreadify;
  isMainThread: typeof isMainThread;
  dispatchToMainThread: typeof dispatchToMainThread;
  releaseNativeObject: typeof releaseNativeObject;
  getModuleName: typeof getModuleName;
  openFile: typeof openFile;
  openUrl: typeof openUrl;
  isRealDevice: typeof isRealDevice;
  layout: typeof layout;
  android: typeof androidUtils;
  ios: typeof iosUtils;
} = {
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
  android,
  ios,
};
export { XmlParser, ParserEventType, ParserEvent } from './xml';
