// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
}

import * as timerModule from "timer";
import * as dialogsModule from "ui/dialogs";

type ModuleLoader = () => any;
const modules: Map<string, ModuleLoader> = new Map<string, ModuleLoader>();

global.registerModule = function(name: string, loader: ModuleLoader): void {
    modules.set(name, loader);
}

global.moduleExists = function(name: string): boolean {
    return modules.has(name);
}

global.loadModule = function(name: string): any {
    const loader = modules.get(name);
    if (loader) {
        return loader();
    } else {
        return require(name);
    }
}

global.registerModule("timer", () => require("timer"));
global.registerModule("ui/dialogs", () => require("ui/dialogs"));
global.registerModule("xhr", () => require("xhr"));
global.registerModule("fetch", () => require("fetch"));

const __tnsGlobalMergedModules = new Map<string, boolean>();

function registerOnGlobalContext(name: string, module: string): void {

    Object.defineProperty(global, name, {
        get: function () {
            // We do not need to cache require() call since it is already cached in the runtime.
            let m = global.loadModule(module);
            if (!__tnsGlobalMergedModules.has(module)) {
                __tnsGlobalMergedModules.set(module, true);
                global.moduleMerge(m, global);
            }

            // Redefine the property to make sure the above code is executed only once.
            let resolvedValue = m[name];
            Object.defineProperty(this, name, { value: resolvedValue, configurable: true, writable: true });

            return resolvedValue;
        },
        configurable: true
    });
}

if (global.__snapshot) {
    // when we have a snapshot, it is better to pre-populate these on the global context to get them saved within the blob
    var timer: typeof timerModule = require("timer");
    global.setTimeout = timer.setTimeout;
    global.clearTimeout = timer.clearTimeout;
    global.setInterval = timer.setInterval;
    global.clearInterval = timer.clearInterval;

    var dialogs: typeof dialogsModule = require("ui/dialogs");
    global.alert = dialogs.alert;
    global.confirm = dialogs.confirm;
    global.prompt = dialogs.prompt;

    var xhr = require("xhr");
    global.XMLHttpRequest = xhr.XMLHttpRequest;
    global.FormData = xhr.FormData;

    var fetch = require("fetch");
    global.fetch = fetch.fetch;
} else {
    registerOnGlobalContext("setTimeout", "timer");
    registerOnGlobalContext("clearTimeout", "timer");
    registerOnGlobalContext("setInterval", "timer");
    registerOnGlobalContext("clearInterval", "timer");
    registerOnGlobalContext("alert", "ui/dialogs");
    registerOnGlobalContext("confirm", "ui/dialogs");
    registerOnGlobalContext("prompt", "ui/dialogs");
    registerOnGlobalContext("XMLHttpRequest", "xhr");
    registerOnGlobalContext("FormData", "xhr");
    registerOnGlobalContext("fetch", "fetch");
}

import platform = require("platform");
import consoleModule = require("console");

var c = new consoleModule.Console();

if (platform.device.os === platform.platformNames.android) {
    global.console = c;
} else if (platform.device.os === platform.platformNames.ios) {
    global.console.dump = function (args) { c.dump(args); };
}

require("./decorators");

export function Deprecated(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        var originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key} is deprecated`);

            return originalMethod.apply(this, args);
        }

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is deprecated`);
        return target;
    }
}

global.Deprecated = Deprecated;

export function Experimental(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        var originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key} is experimental`);

            return originalMethod.apply(this, args);
        }

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is experimental`);
        return target;
    }
}

global.Experimental = Experimental;
