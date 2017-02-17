import { PlatformContext, FileNameResolver as FileNameResolverDefinition } from "file-system/file-name-resolver";
import { screen, device } from "platform";
import { path as fsPath, Folder, File } from "file-system";
import * as trace from "trace";
import * as appModule from "application";

declare module "file-system/file-name-resolver" {
    export function _findFileMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string
}

const MIN_WH: string = "minWH";
const MIN_W: string = "minW";
const MIN_H: string = "minH";
const PRIORITY_STEP = 10000;

interface QualifierSpec {
    isMatch(value: string): boolean;
    getMatchValue(value: string, context: PlatformContext): number;
}

const minWidthHeightQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_WH) === 0;

    },
    getMatchValue(value: string, context: PlatformContext): number {
        const numVal = parseInt(value.substr(MIN_WH.length));
        if (isNaN(numVal)) {
            return -1;
        }

        const actualLength = Math.min(context.width, context.height);
        if (actualLength < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualLength - numVal);
    }
}

const minWidthQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_W) === 0 && value.indexOf(MIN_WH) < 0;

    },
    getMatchValue(value: string, context: PlatformContext): number {
        const numVal = parseInt(value.substr(MIN_W.length));
        if (isNaN(numVal)) {
            return -1;
        }

        const actualWidth = context.width;
        if (actualWidth < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualWidth - numVal);
    }
}

const minHeightQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_H) === 0 && value.indexOf(MIN_WH) < 0;

    },
    getMatchValue(value: string, context: PlatformContext): number {
        const numVal = parseInt(value.substr(MIN_H.length));
        if (isNaN(numVal)) {
            return -1;
        }

        const actualHeight = context.height;
        if (actualHeight < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualHeight - numVal)
    }
}

const platformQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "android" ||
            value === "ios";

    },
    getMatchValue(value: string, context: PlatformContext): number {
        return value === context.os.toLowerCase() ? 1 : -1;
    }
}

const orientationQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "land" ||
            value === "port";

    },
    getMatchValue(value: string, context: PlatformContext): number {
        const isLandscape: number = (context.width > context.height) ? 1 : -1;
        return (value === "land") ? isLandscape : -isLandscape;
    }
}

// List of supported qualifiers ordered by priority
const supportedQualifiers: Array<QualifierSpec> = [
    minWidthHeightQualifier,
    minWidthQualifier,
    minHeightQualifier,
    orientationQualifier,
    platformQualifier
];

export class FileNameResolver implements FileNameResolverDefinition {
    private _context: PlatformContext;
    private _cache = {};

    constructor(context: PlatformContext) {
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
        result = _findFileMatch(path, ext, candidates, this._context);

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

export function _findFileMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string {
    let bestValue = -1
    let result: string = null;

    for (let i = 0; i < candidates.length; i++) {
        const filePath = candidates[i];
        const qualifiersStr: string = filePath.substr(path.length, filePath.length - path.length - ext.length);

        const qualifiers = qualifiersStr.split(".");

        const value = checkQualifiers(qualifiers, context);

        if (value >= 0 && value > bestValue) {
            bestValue = value;
            result = candidates[i];
        }
    }

    return result;
}

function checkQualifiers(qualifiers: Array<string>, context: PlatformContext): number {
    let result = 0;
    for (var i = 0; i < qualifiers.length; i++) {
        if (qualifiers[i]) {
            var value = checkQualifier(qualifiers[i], context);
            if (value < 0) {
                // Non of the supported qualifiers matched this or the match was not satisified
                return -1;
            }

            result += value;
        }
    }

    return result;
}

function checkQualifier(value: string, context: PlatformContext) {
for (var i = 0; i < supportedQualifiers.length; i++) {
        if (supportedQualifiers[i].isMatch(value)) {
            var result = supportedQualifiers[i].getMatchValue(value, context);
            if (result > 0) {
                result += (supportedQualifiers.length - i) * PRIORITY_STEP;
            }
            return result;
        }
    }

    return -1;
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

appModule.on("cssChanged", args => resolverInstance = undefined);
appModule.on("livesync", args => resolverInstance && resolverInstance.clearCache());