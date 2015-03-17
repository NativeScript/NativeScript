import definition = require("file-system/file-name-resolver");
import fs = require("file-system");
import types = require("utils/types");

var MIN_WH: string = "minWH";
var MIN_W: string = "minW";
var MIN_H: string = "minH";
var PRIORITY_STEP = 10000;

interface QualifierSpec {
    isMatch(value: string): boolean;
    getMatchValue(value: string, context: definition.PlatformContext): number;
}

var minWidthHeightQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_WH) === 0;

    },
    getMatchValue(value: string, context: definition.PlatformContext): number {
        var numVal = parseInt(value.substr(MIN_WH.length));
        if (isNaN(numVal)) {
            return -1;
        }

        var actualLength = Math.min(context.width, context.height);
        if (actualLength < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualLength - numVal);
    }
}

var minWidthQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_W) === 0 && value.indexOf(MIN_WH) < 0;

    },
    getMatchValue(value: string, context: definition.PlatformContext): number {
        var numVal = parseInt(value.substr(MIN_W.length));
        if (isNaN(numVal)) {
            return -1;
        }

        var actualWidth = context.width;
        if (actualWidth < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualWidth - numVal);
    }
}

var minHeightQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value.indexOf(MIN_H) === 0 && value.indexOf(MIN_WH) < 0;

    },
    getMatchValue(value: string, context: definition.PlatformContext): number {
        var numVal = parseInt(value.substr(MIN_H.length));
        if (isNaN(numVal)) {
            return -1;
        }

        var actualHeight = context.height;
        if (actualHeight < numVal) {
            return -1;
        }

        return PRIORITY_STEP - (actualHeight - numVal)
    }
}

var fromQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "tablet" || value === "phone";

    },
    getMatchValue(value: string, context: definition.PlatformContext): number{
        if (value !== context.deviceType.toLocaleLowerCase()) {
            return -1;
        }
        return 1;
    }
}

var paltformQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "android" ||
            value === "ios";

    },
    getMatchValue(value: string, context: definition.PlatformContext): number{
        return value === context.os.toLowerCase() ? 1 : -1;
    }
}

// List of supported qualifiers ordered by priority
var supportedQualifiers: Array<QualifierSpec> = [
    minWidthHeightQualifier,
    minWidthQualifier,
    minHeightQualifier,
    paltformQualifier,
    fromQualifier];

export class FileNameResolver implements definition.FileNameResolver {
    private _context: definition.PlatformContext;
    private _cache = {};

    constructor(context: definition.PlatformContext) {
        this._context = context;
    }

    public resolveFileName(path: string, ext: string): string {
        var key = path + ext;
        var result: string = this._cache[key];
        if(types.isUndefined(result)) {
            result = this.resolveFileNameImpl(path, ext);
            this._cache[key] = result;
        }

        return result;
    }

    private resolveFileNameImpl(path: string, ext: string): string {
        path = fs.path.normalize(path);
        ext = "." + ext;
        var folderPath = path.substring(0, path.lastIndexOf(fs.path.separator) + 1);
        console.log("search folderPath: " + folderPath);

        if (fs.Folder.exists(folderPath)) {
            var folder = fs.Folder.fromPath(folderPath);

            var candidates = new Array<fs.File>();
            folder.eachEntity((e) => {

                if (e instanceof fs.File) {
                    var file = <fs.File>e;
                    console.log("File path: " + e.path);
                    if (file.path.indexOf(path) === 0 && file.extension === ext) {
                        candidates.push(file);

                    }
                }

                return true;
            });

            var bestValue = Number.MIN_VALUE;
            var bestCandidate: fs.File = null;

            console.log("Candidates:");
            for (var i = 0; i < candidates.length; i++) {
                console.log("---------- candiate[" + i + "]: " + candidates[i].name);
                var filePath = candidates[i].path;
                var qualifiersStr: string = filePath.substr(path.length, filePath.length - path.length - ext.length);

                var qualifiers = qualifiersStr.split(".");

                var value = this.checkQualifiers(qualifiers);
                console.log("qualifiers: " + qualifiersStr + " result: " + value);

                if (value >= 0 && value > bestValue) {
                    bestValue = value;
                    bestCandidate = candidates[i];
                }
            }
        }

        return bestCandidate ? bestCandidate.path : null;
    }

    private checkQualifiers(qualifiers: Array<string>): number {
        var result = 0;
        for (var i = 0; i < qualifiers.length; i++) {
            if (qualifiers[i]) {
                var value = this.checkQualifier(qualifiers[i]);

                console.log("checking qualifier: " + qualifiers[i] + " result: " + value);
                if (value < 0) {
                    // Non of the supported qualifiers matched this or the match was not satisified
                    return -1;
                }

                result += value;
            }
        }

        return result;
    }

    private checkQualifier(value: string) {
        for (var i = 0; i < supportedQualifiers.length; i++) {
            if (supportedQualifiers[i].isMatch(value)) {
                var result = supportedQualifiers[i].getMatchValue(value, this._context);
                if (result > 0) {
                    result += (supportedQualifiers.length - i) * PRIORITY_STEP;
                }
                return result;
            }
        }

        return -1;
    }
}
