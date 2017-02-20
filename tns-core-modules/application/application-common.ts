require("globals");

import { NativeScriptError, UnhandledErrorEventData, iOSApplication, AndroidApplication, CssChangedEventData } from "application";
import { Observable, EventData } from "data/observable";
import { NavigationEntry } from "ui/frame";
import "../bundle-entry-points";

const events = new Observable();
global.moduleMerge(events, exports);

export { Observable };

export const launchEvent = "launch";
export const suspendEvent = "suspend";
export const resumeEvent = "resume";
export const exitEvent = "exit";
export const lowMemoryEvent = "lowMemory";
export const uncaughtErrorEvent = "uncaughtError";
export const orientationChangedEvent = "orientationChanged";

export let cssFile: string = "app.css";

export let mainModule: string;
export let mainEntry: NavigationEntry;

export let resources: any = {};

export function setResources(res: any) {
    resources = res;
}

export let android = undefined;
export let ios = undefined;

export function notify(args: EventData): void {
    events.notify(args);
}

let app: iOSApplication | AndroidApplication;
export function setApplication(instance: iOSApplication | AndroidApplication): void {
    app = instance;
}

export function livesync() {
    events.notify(<EventData>{ eventName: "livesync", object: app });  
}

export function setCssFileName(cssFileName: string) {
    exports.cssFile = cssFileName;
    events.notify(<CssChangedEventData>{ eventName: "cssChanged", object: app, cssFile: cssFileName });
}

export function addCss(cssText: string): void {
    events.notify(<CssChangedEventData>{ eventName: "cssChanged", object: app, cssText: cssText });
}

global.__onUncaughtError = function (error: NativeScriptError) {
    events.notify(<UnhandledErrorEventData>{ eventName: uncaughtErrorEvent, object: app, android: error, ios: error, error: error });
}
