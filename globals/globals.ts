// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
}

import types = require("utils/types");
import timer = require("timer");
import consoleModule = require("console");
import xhr = require("xhr/xhr");
import dialogs = require("ui/dialogs");

global.setTimeout = timer.setTimeout;
global.clearTimeout = timer.clearTimeout;
global.setInterval = timer.setInterval;
global.clearInterval = timer.clearInterval;

// Temporary workaround for console in iOS. We will use runtime console instead our implementation.
if (types.isUndefined(global.NSObject)) {
    global.console = new consoleModule.Console();
}

global.XMLHttpRequest = xhr.XMLHttpRequest;
global.FormData = xhr.FormData;
global.alert = dialogs.alert;

// Fetch module should be after XMLHttpRequest/FormData! 
var fetchModule = require("fetch");
global.moduleMerge(fetchModule, global);

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
