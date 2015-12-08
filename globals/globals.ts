// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
}
import platform = require("platform");
import consoleModule = require("console");

var c = new consoleModule.Console();

if (platform.device.os === platform.platformNames.android) {
    global.console = c;
} else if (platform.device.os === platform.platformNames.ios) {
    global.console.dump = function (args) { c.dump(args); };
}

global.setTimeout = function (callback, milliseconds) {
    let tm = require("timer");
    return tm.setTimeout(callback, milliseconds);
}

global.clearTimeout = function (id) {
    let tm = require("timer");
    tm.clearTimeout(id);
}

global.setInterval = function (callback, milliseconds) {
    let tm = require("timer");
    return tm.setInterval(callback, milliseconds);
}

global.clearInterval = function (id) {
    let tm = require("timer");
    tm.clearInterval(id);
}

global.alert = function (args) {
    let dm = require("ui/dialogs");
    return dm.alert(args);
}

var xhr = require("../xhr/xhr");
global.moduleMerge(xhr, global);

// Fetch module should be after XMLHttpRequest/FormData! 
var fetchModule = require("fetch");
global.moduleMerge(fetchModule, global);

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
