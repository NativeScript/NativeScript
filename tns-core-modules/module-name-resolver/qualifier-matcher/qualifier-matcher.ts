import { PlatformContext } from "./";
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
};

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
};

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

        return PRIORITY_STEP - (actualHeight - numVal);
    }
};

const platformQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "android" ||
            value === "ios";

    },
    getMatchValue(value: string, context: PlatformContext): number {
        return value === context.os.toLowerCase() ? 1 : -1;
    }
};

const orientationQualifier: QualifierSpec = {
    isMatch: function (value: string): boolean {
        return value === "land" ||
            value === "port";

    },
    getMatchValue(value: string, context: PlatformContext): number {
        const isLandscape: number = (context.width > context.height) ? 1 : -1;

        return (value === "land") ? isLandscape : -isLandscape;
    }
};

// List of supported qualifiers ordered by priority
const supportedQualifiers: Array<QualifierSpec> = [
    minWidthHeightQualifier,
    minWidthQualifier,
    minHeightQualifier,
    orientationQualifier,
    platformQualifier
];

function checkQualifiers(qualifiers: Array<string>, context: PlatformContext): number {
    let result = 0;
    let value: number;
    for (let i = 0; i < qualifiers.length; i++) {
        if (qualifiers[i]) {
            value = checkQualifier(qualifiers[i], context);
            if (value < 0) {
                // Non of the supported qualifiers matched this or the match was not satisfied
                return -1;
            }

            result += value;
        }
    }

    return result;
}

function checkQualifier(value: string, context: PlatformContext) {
    let result: number;
    for (let i = 0; i < supportedQualifiers.length; i++) {
        if (supportedQualifiers[i].isMatch(value)) {
            result = supportedQualifiers[i].getMatchValue(value, context);
            if (result > 0) {
                result += (supportedQualifiers.length - i) * PRIORITY_STEP;
            }

            return result;
        }
    }

    return -1;
}

export function findMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string {
    let bestValue = -1;
    let result: string = null;

    for (let i = 0; i < candidates.length; i++) {
        const filePath = candidates[i];
        const qualifiersStr: string = filePath.substr(path.length, filePath.length - path.length - (ext ? ext.length : 0));

        const qualifiers = qualifiersStr.split(".");

        const value = checkQualifiers(qualifiers, context);

        if (value >= 0 && value > bestValue) {
            bestValue = value;
            result = candidates[i];
        }
    }

    return result;
}