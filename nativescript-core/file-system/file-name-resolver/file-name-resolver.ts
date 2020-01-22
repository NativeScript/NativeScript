import { PlatformContext, FileNameResolver as FileNameResolverDefinition } from ".";
import { screen, device } from "../../platform";
import { path as fsPath, Folder, File } from "../file-system";
import * as trace from "../../trace";
import * as appCommonModule from "../../application/application-common";

import { findMatch } from "../../module-name-resolver/qualifier-matcher/qualifier-matcher";

export class FileNameResolver implements FileNameResolverDefinition {
    private _context: PlatformContext;
    private _cache = {};

    constructor(context: PlatformContext) {
        console.log("FileNameResolver is deprecated; use ModuleNameResolver instead");

        this._context = context;
    }

    public resolveFileName(path: string, ext: string): string {
        const key = path + ext;
        let result: string = this._cache[key];
        if (result === undefined) {
            result = this.resolveFileNameImpl(path, ext);
            this._cache[key] = result;
        }

        return result;
    }

    public clearCache(): void {
        this._cache = {};
    }

    private resolveFileNameImpl(path: string, ext: string): string {
        let result: string = null;
        path = fsPath.normalize(path);
        ext = "." + ext;

        const candidates = this.getFileCandidatesFromFolder(path, ext);
        result = findMatch(path, ext, candidates, this._context);

        return result;
    }

    private getFileCandidatesFromFolder(path: string, ext: string): Array<string> {
        const candidates = new Array<string>();
        const folderPath = path.substring(0, path.lastIndexOf(fsPath.separator) + 1);

        if (Folder.exists(folderPath)) {
            const folder = Folder.fromPath(folderPath);
            folder.eachEntity((e) => {
                if (e instanceof File) {
                    const file = e;
                    if (file.path.indexOf(path) === 0 && file.extension === ext) {
                        candidates.push(file.path);
                    }
                }

                return true;
            });
        }
        else {
            if (trace.isEnabled()) {
                trace.write("Could not find folder " + folderPath + " when loading " + path + ext, trace.categories.Navigation);
            }
        }

        return candidates;
    }
}

let resolverInstance: FileNameResolver;

export function resolveFileName(path: string, ext: string): string {
    if (!resolverInstance) {
        resolverInstance = new FileNameResolver({
            width: screen.mainScreen.widthDIPs,
            height: screen.mainScreen.heightDIPs,
            os: device.os,
            deviceType: device.deviceType
        });
    }

    return resolverInstance.resolveFileName(path, ext);
}
export function clearCache() {
    if (resolverInstance) {
        resolverInstance.clearCache();
    }
}

appCommonModule.on("cssChanged", args => resolverInstance = undefined);
appCommonModule.on("livesync", args => clearCache());
