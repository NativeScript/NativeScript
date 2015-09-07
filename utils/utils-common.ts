import types = require("utils/types");

export var RESOURCE_PREFIX = "res://";

export function copyFrom(source: any, target: any) {
    if (types.isDefined(source) && types.isDefined(target)) {
        var i: number;
        var key: string;
        var value: any;
        var keys = Object.keys(source);

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = source[key];

            if (types.isDefined(value)) {
                target[key] = value;
            }
        }
    }
}

export function parseJSON(source: string): any {
    var src = source.trim();
    if (src.lastIndexOf(")") === src.length - 1) {
        return JSON.parse(src.substring(src.indexOf("(") + 1, src.lastIndexOf(")")));
    }

    return JSON.parse(src);
}

export module layout {

    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;

    export var UNSPECIFIED = 0 << MODE_SHIFT;
    export var EXACTLY = 1 << MODE_SHIFT;
    export var AT_MOST = 2 << MODE_SHIFT;

    export var MEASURED_STATE_TOO_SMALL = 0x01000000;
    export var MEASURED_STATE_MASK = 0xff000000;
    export var MEASURED_SIZE_MASK = 0x00ffffff;

    export function getMode(mode: number): string {
        switch (mode) {
            case layout.EXACTLY:
                return "Exact";

            case layout.AT_MOST:

                return "AtMost";

            default:
                return "Unspecified";
        }
    }

    export function getMeasureSpecMode(spec: number): number {
        return (spec & MODE_MASK);
    }

    export function getMeasureSpecSize(spec: number): number {
        return (spec & ~MODE_MASK);
    }
}

export function isFileOrResourcePath(path: string): boolean {
    if (!types.isString(path)) {
        return false;
    }

    return path.indexOf("~/") === 0 ||  // relative to AppRoot
        path.indexOf("/") === 0 ||      // absolute path
        path.indexOf(RESOURCE_PREFIX) === 0;    // resource
}

export function isDataURI(uri: string): boolean {
    if (!types.isString(uri)) {
        return false;
    }

    var firstSegment = uri.trim().split(',')[0];

    return firstSegment && firstSegment.indexOf("data:") === 0 && firstSegment.indexOf('base64') >= 0;
}