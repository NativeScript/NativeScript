import "../../core";

function registerOnGlobalContext(moduleName: string, exportName: string): void {
    Object.defineProperty(global, exportName, {
        get: function () {
            // We do not need to cache require() call since it is already cached in the runtime.
            let m = global.loadModule(moduleName);

            // Redefine the property to make sure the above code is executed only once.
            let resolvedValue = m[exportName];
            Object.defineProperty(global, exportName, { value: resolvedValue, configurable: true, writable: true });

            return resolvedValue;
        },
        configurable: true
    });
}

export function installPolyfills(moduleName: string, exportNames: string[]) {
    if (global.__snapshot) {
        const loadedModule = global.loadModule(moduleName);
        exportNames.forEach(exportName => global[exportName] = loadedModule[exportName]);
    } else {
        exportNames.forEach(exportName => registerOnGlobalContext(moduleName, exportName));
    }
}