// Required by TypeScript compiler
require("./decorators");

// Required by V8 snapshot generator
if (!global.__extends) {
    global.__extends = function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                d[p] = b[p];
            }
        }
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}

// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
global.moduleMerge = function (sourceExports: any, destExports: any) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
}

import * as timerModule from "../timer";
import * as dialogsModule from "../ui/dialogs";

type ModuleLoader = (name?: string) => any;
const modules: Map<string, ModuleLoader> = new Map<string, ModuleLoader>();

(<any>global).moduleResolvers = [global.require];

global.registerModule = function (name: string, loader: ModuleLoader): void {
    modules.set(name, loader);
}

interface Context {
    keys(): string[];
    (key: string): any;
}
interface ExtensionMap {
    [originalFileExtension: string]: string;
}

const defaultExtensionMap = { ".js": ".js", ".ts": ".js", ".css": ".css", ".scss": ".css", ".xml": ".xml", ".less": ".css", ".sass": ".css" };
global.registerWebpackModules = function registerWebpackModules(context: Context, extensionMap: ExtensionMap = {}) {
    context.keys().forEach(key => {
        const extDotIndex = key.lastIndexOf(".");
        const base = key.substr(0, extDotIndex);
        const originalExt = key.substr(extDotIndex);
        const registerExt = extensionMap[originalExt] || defaultExtensionMap[originalExt] || originalExt;

        // We prefer source files for webpack scenarios before compilation leftovers,
        // e. g. if we get a .js and .ts for the same module, the .js is probably the compiled version of the .ts file,
        // so we register the .ts with higher priority, similar is the case with us preferring the .scss to .css
        const isSourceFile = originalExt !== registerExt;

        const registerName = base + registerExt;
        if (registerName.startsWith("./") && registerName.endsWith(".js")) {
            const jsNickNames = [
                // This is extremely short version like "main-page" that was promoted to be used with global.registerModule("module-name", loaderFunc);
                registerName.substr(2, registerName.length - 5),
                // This is for supporting module names like "./main/main-page"
                registerName.substr(0, registerName.length - 3),
                // This is for supporting module names like "main/main-page.js"
                registerName.substr(2),
            ];

            jsNickNames.forEach(jsNickName => {
                if (isSourceFile || !global.moduleExists(jsNickName)) {
                    global.registerModule(jsNickName, () => context(key));
                }
            });
        }
        if (isSourceFile || !global.moduleExists(registerName)) {
            global.registerModule(registerName, () => context(key));
        }
    });
}

global.moduleExists = function (name: string): boolean {
    return modules.has(name);
}

global.loadModule = function (name: string): any {
    const loader = modules.get(name);
    if (loader) {
        return loader();
    }
    for (let resolver of (<any>global).moduleResolvers) {
        const result = resolver(name);
        if (result) {
            modules.set(name, () => result);
            return result;
        }
    }
}

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
}

global.registerModule("timer", () => require("timer"));
global.registerModule("ui/dialogs", () => require("ui/dialogs"));
global.registerModule("xhr", () => require("xhr"));
global.registerModule("fetch", () => require("fetch"));

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
}

const __tnsGlobalMergedModules = new Map<string, boolean>();

function registerOnGlobalContext(name: string, module: string): void {

    Object.defineProperty(global, name, {
        get: function () {
            // We do not need to cache require() call since it is already cached in the runtime.
            let m = global.loadModule(module);

            // Redefine the property to make sure the above code is executed only once.
            let resolvedValue = m[name];
            Object.defineProperty(this, name, { value: resolvedValue, configurable: true, writable: true });

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
            var timer: typeof timerModule = require("timer");
            var dialogs: typeof dialogsModule = require("ui/dialogs");
            var xhr = require("xhr");
            var fetch = require("fetch");
            var consoleModule = require("console");

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

                console: new consoleModule.Console()
            }
        }
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

        // check whether the 'android' namespace is exposed
        // if positive - the current device is an Android 
        // so a custom implementation of the global 'console' object is attached.
        // otherwise do nothing on iOS - the NS runtime provides a native 'console' functionality.
        if ((<any>global).android) {
            const consoleModule = require("console");
            (<any>global).console = new consoleModule.Console();
        }
    }
}
install();

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
