// Required by TypeScript compiler
import "./ts-helpers";

import "./register-module-helpers";

// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (let key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
};

import * as timerModule from "../timer";
import * as dialogsModule from "../ui/dialogs";

global.zonedCallback = function (callback: Function): Function {
    if ((<any>global).zone) {
        // Zone v0.5.* style callback wrapping
        return (<any>global).zone.bind(callback);
    }
    if ((<any>global).Zone) {
        // Zone v0.6.* style callback wrapping
        return (<any>global).Zone.current.wrap(callback);
    } else {
        return callback;
    }
};

global.registerModule("timer", () => require("../timer"));
global.registerModule("ui/dialogs", () => require("../ui/dialogs"));
global.registerModule("xhr", () => require("../xhr"));
global.registerModule("fetch", () => require("../fetch"));

(<any>global).System = {
    import(path) {
        return new Promise((resolve, reject) => {
            try {
                resolve(global.require(path));
            } catch (e) {
                reject(e);
            }
        });
    }
};

function registerOnGlobalContext(name: string, module: string): void {
    Object.defineProperty(global, name, {
        get: function () {
            // We do not need to cache require() call since it is already cached in the runtime.
            let m = global.loadModule(module);

            // Redefine the property to make sure the above code is executed only once.
            let resolvedValue = m[name];
            Object.defineProperty(global, name, { value: resolvedValue, configurable: true, writable: true });

            return resolvedValue;
        },
        configurable: true
    });
}

let snapshotGlobals;
export function install() {
    if ((<any>global).__snapshot || (<any>global).__snapshotEnabled) {
        if (!snapshotGlobals) {
            // require in snapshot mode is cheap
            const timer: typeof timerModule = require("../timer");
            const dialogs: typeof dialogsModule = require("../ui/dialogs");
            const xhr = require("../xhr");
            const fetch = require("../fetch");

            snapshotGlobals = snapshotGlobals || {
                setTimeout: timer.setTimeout,
                clearTimeout: timer.clearTimeout,
                setInterval: timer.setInterval,
                clearInterval: timer.clearInterval,

                alert: dialogs.alert,
                confirm: dialogs.confirm,
                prompt: dialogs.prompt,
                login: dialogs.login,
                action: dialogs.action,

                XMLHttpRequest: xhr.XMLHttpRequest,
                FormData: xhr.FormData,

                fetch: fetch.fetch,
                Headers: fetch.Headers,
                Request: fetch.Request,
                Response: fetch.Response,
            };
        }
        const consoleModule = require("../console").Console;
        // Object.assign call will fire an error when trying to write to a read-only property of an object, such as 'console'
        global.console = global.console || new consoleModule();
        Object.assign(global, snapshotGlobals);
    } else {
        registerOnGlobalContext("setTimeout", "timer");
        registerOnGlobalContext("clearTimeout", "timer");
        registerOnGlobalContext("setInterval", "timer");
        registerOnGlobalContext("clearInterval", "timer");

        registerOnGlobalContext("alert", "ui/dialogs");
        registerOnGlobalContext("confirm", "ui/dialogs");
        registerOnGlobalContext("prompt", "ui/dialogs");
        registerOnGlobalContext("login", "ui/dialogs");
        registerOnGlobalContext("action", "ui/dialogs");

        registerOnGlobalContext("XMLHttpRequest", "xhr");
        registerOnGlobalContext("FormData", "xhr");

        registerOnGlobalContext("fetch", "fetch");
        registerOnGlobalContext("Headers", "fetch");
        registerOnGlobalContext("Request", "fetch");
        registerOnGlobalContext("Response", "fetch");
    }
}
install();

export function Deprecated(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key.toString()} is deprecated`);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is deprecated`);

        return target;
    }
}

global.Deprecated = Deprecated;

export function Experimental(target: Object, key?: string | symbol, descriptor?: any) {
    if (descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(`${key.toString()} is experimental`);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    } else {
        console.log(`${(target && (<any>target).name || target)} is experimental`);

        return target;
    }
}

global.Experimental = Experimental;
