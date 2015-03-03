import types = require("utils/types");

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

export module layout {

    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;

    export var UNSPECIFIED = 0 << MODE_SHIFT;
    export var EXACTLY = 1 << MODE_SHIFT;
    export var AT_MOST = 2 << MODE_SHIFT;

    export var MEASURED_STATE_TOO_SMALL = 0x01000000;
    export var MEASURED_STATE_MASK = 0xff000000;

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