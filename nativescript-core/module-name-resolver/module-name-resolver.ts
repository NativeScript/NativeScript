import { ModuleNameResolver as ModuleNameResolverDefinition, ModuleListProvider } from "./";
import { screen, device } from "../platform/platform";
import * as appCommonModule from "../application/application-common";
import { PlatformContext, findMatch, stripQualifiers } from "./qualifier-matcher";
import { registerModulesFromFileSystem } from "./non-bundle-workflow-compat";
import {
    isEnabled as traceEnabled,
    write as traceWrite,
    categories as traceCategories
} from "../trace";

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

        if (traceEnabled()) {
            traceWrite(`path: '${path}' with ext: '${ext}' resolved: '${result}'`, traceCategories.ModuleNameResolver);
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

        // This call will return a clean path without qualifiers
        path = stripQualifiers(path);

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
    if (global.__snapshot) {
        return resolveModuleSnapshot(path, ext);
    }

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

function resolveModuleSnapshot(path, ext) {
    traceWrite(`Resolving module in SNAPSHOT context - path: '${path}' with ext: '${ext}'`, traceCategories.ModuleNameResolver);

    // Platform module when in snapshot. So resolve modules with default android phone.
    // NB: The only module name that should ever be resolved while in snapshot is app.css, because it is
    // applied explicitly in the snapshot by [NativeScriptSnapshotPlugin](https://github.com/NativeScript/nativescript-dev-webpack/blob/48b26f412fd70c19dc0b9c7763e08e9505a0ae11/plugins/NativeScriptSnapshotPlugin/index.js#L48-L56)
    return new ModuleNameResolver({
        width: 400,
        height: 800,
        os: "Android",
        deviceType: "Phone"
    }).resolveModuleName(path, ext);
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
