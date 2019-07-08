import { ModuleNameResolver as ModuleNameResolverDefinition, ModuleListProvider } from "./";
import { screen, device } from "../platform/platform";
import * as appCommonModule from "../application/application-common";
import { PlatformContext, findMatch } from "./qualifier-matcher";
import { registerModulesFromFileSystem } from "./non-bundle-workflow-compat";

export class ModuleNameResolver implements ModuleNameResolverDefinition {
    private _cache = {};

    constructor(private context: PlatformContext, private moduleListProvider: ModuleListProvider = global.getRegisteredModules) {
    }

    public resolveModuleName(path: string, ext: string): string {
        const key = path + ext;
        let result: string = this._cache[key];
        if (result === undefined) {
            result = this.resolveModuleNameImpl(path, ext);
            this._cache[key] = result;
        }

        return result;
    }

    public clearCache(): void {
        this._cache = {};
    }

    private resolveModuleNameImpl(path: string, ext: string): string {
        let result: string = null;
        ext = ext ? "." + ext : "";

        // Compatibility path for non-webpack workflow
        // register modules from FS first
        if (!global.TNS_WEBPACK) {
            registerModulesFromFileSystem(path);
        }

        let candidates = this.getCandidates(path, ext);
        result = findMatch(path, ext, candidates, this.context);

        return result;
    }

    private getCandidates(path: string, ext: string): Array<string> {
        const candidates = this.moduleListProvider()
            .filter((moduleName) => moduleName.startsWith(path) && (!ext || moduleName.endsWith(ext)));

        return candidates;
    }
}

let resolverInstance: ModuleNameResolver;

export function resolveModuleName(path: string, ext: string): string {
    if (!resolverInstance) {
        resolverInstance = new ModuleNameResolver({
            width: screen.mainScreen.widthDIPs,
            height: screen.mainScreen.heightDIPs,
            os: device.os,
            deviceType: device.deviceType
        });
    }

    return resolverInstance.resolveModuleName(path, ext);
}

export function clearCache() {
    if (resolverInstance) {
        resolverInstance.clearCache();
    }
}

export function _setResolver(resolver: ModuleNameResolver) {
    resolverInstance = resolver;
}

appCommonModule.on("livesync", args => clearCache());
appCommonModule.on("orientationChanged", args => {
    resolverInstance = undefined;
});
