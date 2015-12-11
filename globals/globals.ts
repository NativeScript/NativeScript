// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
}

function registerOnGlobalContext(name, module) {
    Object.defineProperty(global, name, {
        get: function () {
            // We do not need to cache require() call since it is already cached in the runtime.
            let m = require(module);
            global.moduleMerge(m, global);

            // Redefine the property to make sure the above code is executed only once.
            Object.defineProperty(this, name, { value: m[name], configurable: true, writable: true });

            return m[name];
        },
        configurable: true
    });
}

registerOnGlobalContext("setTimeout", "timer");
registerOnGlobalContext("clearTimeout", "timer");
registerOnGlobalContext("setInterval", "timer");
registerOnGlobalContext("clearInterval", "timer");
registerOnGlobalContext("alert", "ui/dialogs");
registerOnGlobalContext("confirm", "ui/dialogs");
registerOnGlobalContext("prompt", "ui/dialogs");
registerOnGlobalContext("XMLHttpRequest", "../xhr/xhr");
registerOnGlobalContext("FormData", "../xhr/xhr");
registerOnGlobalContext("fetch", "fetch");

import platform = require("platform");
import consoleModule = require("console");

var c = new consoleModule.Console();

if (platform.device.os === platform.platformNames.android) {
    global.console = c;
} else if (platform.device.os === platform.platformNames.ios) {
    global.console.dump = function (args) { c.dump(args); };
}

if (typeof global.__decorate !== "function") {
    global.__decorate = function (decorators, target, key, desc) {
        if (typeof global.Reflect === "object" && typeof global.Reflect.decorate === "function") {
            return global.Reflect.decorate(decorators, target, key, desc);
        }
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    }
}

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
