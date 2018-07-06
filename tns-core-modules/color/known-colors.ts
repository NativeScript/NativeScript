import * as knownColors from "./known-colors-constants";
export * from "./known-colors-constants";

export function isKnownName(name: string) {
    if (!name) {
        return undefined;
    }

    return name.toLowerCase() in knownColors;
}

export function getKnownColor(name: string): string {
    if (!name) {
        return undefined;
    }

    return knownColors[name.toLowerCase()];
}
