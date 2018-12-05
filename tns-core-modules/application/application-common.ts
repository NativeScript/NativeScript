// Require globals first so that snapshot takes __extends function.
require("globals");

import { Observable, EventData } from "../data/observable";
import {
    trace as profilingTrace,
    time,
    uptime,
    level as profilingLevel,
} from "../profiling";

const events = new Observable();
let launched = false;
function setLaunched() {
    launched = true;
    events.off("launch", setLaunched);
}
events.on("launch", setLaunched);

if (profilingLevel() > 0) {
    events.on("displayed", () => {
        const duration = uptime();
        const end = time();
        const start = end - duration;
        profilingTrace(`Displayed in ${duration.toFixed(2)}ms`, start, end);
    });
}

export function hasLaunched(): boolean {
    return launched;
}

export { Observable };

import {
    AndroidApplication,
    CssChangedEventData,
    getRootView,
    iOSApplication,
    LoadAppCSSEventData,
    UnhandledErrorEventData
} from "./application";

export { UnhandledErrorEventData, CssChangedEventData, LoadAppCSSEventData };

export const launchEvent = "launch";
export const suspendEvent = "suspend";
export const displayedEvent = "displayed";
export const resumeEvent = "resume";
export const exitEvent = "exit";
export const lowMemoryEvent = "lowMemory";
export const uncaughtErrorEvent = "uncaughtError";
export const orientationChangedEvent = "orientationChanged";

let cssFile: string = "./app.css";

let resources: any = {};

export function getResources() {
    return resources;
}

export function setResources(res: any) {
    resources = res;
}

export let android = undefined;
export let ios = undefined;

export const on: typeof events.on = events.on.bind(events);
export const off: typeof events.off = events.off.bind(events);
export const notify: typeof events.notify = events.notify.bind(events);
export const hasListeners: typeof events.hasListeners = events.hasListeners.bind(events);

let app: iOSApplication | AndroidApplication;
export function setApplication(instance: iOSApplication | AndroidApplication): void {
    app = instance;
}

export function livesync(context?: HmrContext) {
    events.notify(<EventData>{ eventName: "livesync", object: app });
    const liveSyncCore = global.__onLiveSyncCore;
    let reapplyAppCss = false

    if (context) {
        const fullFileName = getCssFileName();
        const fileName = fullFileName.substring(0, fullFileName.lastIndexOf(".") + 1);
        const extensions = ["css", "scss"];
        reapplyAppCss = extensions.some(ext => context.module === fileName.concat(ext));
    }

    if (reapplyAppCss) {
        getRootView()._onCssStateChange();
    } else if (liveSyncCore) {
        liveSyncCore();
    }
}

export function setCssFileName(cssFileName: string) {
    cssFile = cssFileName;
    events.notify(<CssChangedEventData>{ eventName: "cssChanged", object: app, cssFile: cssFileName });
}

export function getCssFileName(): string {
    return cssFile;
}

export function loadAppCss(): void {
    try {
        events.notify(<LoadAppCSSEventData>{ eventName: "loadAppCss", object: app, cssFile: getCssFileName() });
    } catch (e) {
        throw new Error(`The file ${getCssFileName()} couldn't be loaded! ` +
            `You may need to register it inside ./app/vendor.ts.`);
    }
}

export function addCss(cssText: string): void {
    events.notify(<CssChangedEventData>{ eventName: "cssChanged", object: app, cssText: cssText });
}

global.__onUncaughtError = function (error: NativeScriptError) {
    events.notify(<UnhandledErrorEventData>{ eventName: uncaughtErrorEvent, object: app, android: error, ios: error, error: error });
}
