type ModuleLoader = (name?: string) => any;

interface Context {
    keys(): string[];
    (key: string): any;
}

interface ExtensionMap {
    [originalFileExtension: string]: string;
}

const modules: Map<string, { moduleId: string, loader: ModuleLoader }> = new Map<string, { moduleId: string, loader: ModuleLoader }>();
const modulesLoadedForUI = new Set<string>();
const defaultExtensionMap: ExtensionMap = {
    ".js": ".js",
    ".ts": ".js",
    ".css": ".css",
    ".scss": ".css",
    ".less": ".css",
    ".sass": ".css",
    ".xml": ".xml"
};

// Cast to <any> because moduleResolvers is read-only in definitions
(<any>global).moduleResolvers = [global.require];

global.registerModule = function (name: string, loader: ModuleLoader): void {
    modules.set(name, { loader, moduleId: name });
};

global._unregisterModule = function _unregisterModule(name: string): void {
    modules.delete(name);
};

global._isModuleLoadedForUI = function _isModuleLoadedForUI(moduleName: string): boolean {
    return modulesLoadedForUI.has(moduleName);
};

global.registerWebpackModules = function registerWebpackModules(context: Context, extensionMap: ExtensionMap = {}) {
    context.keys().forEach(moduleId => {
        const extDotIndex = moduleId.lastIndexOf(".");
        const base = moduleId.substr(0, extDotIndex);
        const originalExt = moduleId.substr(extDotIndex);
        const registerExt = extensionMap[originalExt] || defaultExtensionMap[originalExt] || originalExt;

        // We prefer source files for webpack scenarios before compilation leftovers,
        // e. g. if we get a .js and .ts for the same module, the .js is probably the compiled version of the .ts file,
        // so we register the .ts with higher priority, similar is the case with us preferring the .scss to .css
        const isSourceFile = originalExt !== registerExt;
        const registerName = base + registerExt;

        const registerWithName = (nickName: string) => {
            modules.set(nickName, {
                moduleId,
                loader: () => {
                    return context(moduleId);
                }
            });
        };

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
                    registerWithName(jsNickName);
                }
            });
        } else if (registerName.startsWith("./")) {
            const moduleNickNames = [
                // This is for supporting module names like "main/main-page.xml"
                registerName.substr(2),
            ];

            moduleNickNames.forEach(moduleNickName => {
                if (!global.moduleExists(moduleNickName)) {
                    registerWithName(moduleNickName);
                }
            });
        }

        if (isSourceFile || !global.moduleExists(registerName)) {
            registerWithName(registerName);
        }
    });
};

global.moduleExists = function moduleExists(name: string): boolean {
    return modules.has(name);
};

global.loadModule = function loadModule(name: string, isUIModule: boolean = false): any {
    const moduleInfo = modules.get(name);
    if (moduleInfo) {
        if (isUIModule) {
            modulesLoadedForUI.add(moduleInfo.moduleId);
        }

        const result = moduleInfo.loader(name);

        if (result.enableAutoAccept) {
            result.enableAutoAccept();
        }

        return result;
    }

    for (let resolver of (<any>global).moduleResolvers) {
        const result = resolver(name);
        if (result) {
            modules.set(name, { moduleId: name, loader: () => result });

            return result;
        }
    }
};

global.getRegisteredModules = function getRegisteredModules(): string[] {
    return Array.from(modules.keys());
};
