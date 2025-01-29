// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./global-types.d.ts" />
// Init globals first (use import to ensure it's always at the top)
import './globals';
export * from './application';
export * as ApplicationSettings from './application-settings';
import * as Accessibility from './accessibility';
export namespace AccessibilityEvents {
	export const accessibilityBlurEvent = Accessibility.accessibilityBlurEvent;
	export const accessibilityFocusEvent = Accessibility.accessibilityFocusEvent;
	export const accessibilityFocusChangedEvent = Accessibility.accessibilityFocusChangedEvent;
	export const accessibilityPerformEscapeEvent = Accessibility.accessibilityPerformEscapeEvent;
}
export { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait, FontScaleCategory } from './accessibility';

export { Color } from './color';
export * as Connectivity from './connectivity';
export * from './core-types';
export { CSSUtils } from './css/system-classes';
export { ObservableArray, ChangeType } from './data/observable-array';
export type { ChangedData } from './data/observable-array';
export { Observable, WrappedValue, fromObject, fromObjectRecursive } from './data/observable';
export type { PropertyChangeData, EventData } from './data/observable';
export { VirtualArray } from './data/virtual-array';
export type { ItemsLoading } from './data/virtual-array';
export { File, FileSystemEntity, Folder, knownFolders, path, getFileAccess, AndroidDirectory } from './file-system';

// Export all interfaces from "http" module
export type { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContent } from './http';
export * as Http from './http';
export { ImageAsset } from './image-asset';
export type { ImageAssetOptions } from './image-asset';
export { ImageSource } from './image-source';
export { ModuleNameResolver, _setResolver } from './module-name-resolver';
export type { ModuleListProvider, PlatformContext } from './module-name-resolver';
export { isAndroid, isIOS, isVisionOS, isApple, Screen, Device, platformNames } from './platform';
export type { IDevice } from './platform';

// Profiling
export { profile, enable as profilingEnable, disable as profilingDisable, time as profilingTime, uptime as profilingUptime, start as profilingStart, stop as profilingStop, isRunning as profilingIsRunning, dumpProfiles as profilingDumpProfiles, resetProfiles as profilingResetProfiles, startCPUProfile as profilingStartCPU, stopCPUProfile as profilingStopCPU } from './profiling';
export type { InstrumentationMode, TimerInfo } from './profiling';
export { encoding } from './text';
export * from './trace';
export * from './ui';
export * as Utils from './utils';
export { XmlParser, ParserEventType, ParserEvent } from './xml';
