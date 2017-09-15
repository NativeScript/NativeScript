
const urlRegEx = /\s*url\((?:('|")([^\1]*)\1|([^\)]*))\)\s*|()/g;
export function parseURL(value: string, lastIndex: number = 0): { url: string, lastIndex: number } {
    urlRegEx.lastIndex = lastIndex;
    const result = urlRegEx.exec(value);
    lastIndex = urlRegEx.lastIndex;
    const url = result[2] || result[3] || undefined;
    return url === undefined ? null : { url, lastIndex };
}

const hexColorRegEx = /\s*#((?:[0-9A-F]{8})|(?:[0-9A-F]{6})|(?:[0-9A-F]{3}))\s*|()/gi;
function parseHexColor(value: string, lastIndex: number = 0): { argb: number, lastIndex: number } {
    hexColorRegEx.lastIndex = lastIndex;
    const result = hexColorRegEx.exec(value);
    lastIndex = hexColorRegEx.lastIndex;
    let hex = result[1];
    let argb;
    if (hex) {
        if (hex.length === 8) {
            argb = parseInt("0x" + hex);
        } else if (hex.length === 6) {
            argb = parseInt("0xFF" + hex);
        } else if (hex.length === 3) {
            argb = parseInt("0xFF" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]);
        }
    }
    return argb === undefined ? null : { argb, lastIndex };
}

function rgbaToArgbNumber(r: number, g: number, b: number, a: number = 1): number | undefined {
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
        return (Math.round(a * 0xFF) * 0x01000000) + (r * 0x010000) + (g * 0x000100) + (b * 0x000001);
    } else { 
        return null;
    }
}

const rgbColorRegEx = /\s*(rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\))|()/g;
function parseRGBColor(value: string, lastIndex: number = 0): { argb: number, lastIndex: number } {
    rgbColorRegEx.lastIndex = lastIndex;
    const result = rgbColorRegEx.exec(value);
    lastIndex = rgbColorRegEx.lastIndex;
    const argb = result[1] && rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]));
    return argb === undefined ? null : { argb, lastIndex };
}

const rgbaColorRegEx = /\s*(rgba\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*,\s*([01]?\.?\d*)\s*\))|()/g;
function parseRGBAColor(value: string, lastIndex: number = 0): { argb: number, lastIndex: number } {
    rgbaColorRegEx.lastIndex = lastIndex;
    const result = rgbaColorRegEx.exec(value);
    lastIndex = rgbaColorRegEx.lastIndex;
    const argb = result[1] && rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]), parseFloat(result[5]));
    return argb === undefined ? null : { argb, lastIndex };
}

export function parseColor(value: string, lastIndex: number = 0): { argb: number, lastIndex: number } {
    return parseHexColor(value, lastIndex) || parseRGBColor(value, lastIndex) || parseRGBAColor(value, lastIndex);
}

interface Keyword {
    keyword: string;
    lastIndex: number;
}

const keywordRegEx = /\s*([a-z][\w\-]*)\s*|()/gi;
function parseKeyword(value: string, lastIndex: number = 0, preParsedKeyword?: Keyword): Keyword {
    if (preParsedKeyword) {
        return preParsedKeyword;
    }

    keywordRegEx.lastIndex = lastIndex;
    const result = keywordRegEx.exec(value);
    lastIndex = keywordRegEx.lastIndex;
    const keyword = result[1];
    // TRICKY: We return null instead of undefined so passing it in places where optional parameters are accepted
    // can figure out that it is provided as argument, and should not be re-parsed.
    return keyword === undefined ? null : { keyword, lastIndex }
}

const backgroundRepeatMap = {
    "repeat": Object.freeze({ x: true, y: true }),
    "repeat-x": Object.freeze({ x: true, y: false }),
    "repeat-y": Object.freeze({ x: false, y: true }),
    "no-repeat": Object.freeze({ x: false, y: false })
}

function parseRepeat(value: string, lastIndex: number = 0, keyword = parseKeyword(value, lastIndex)): { repeat: { x: boolean, y: boolean }, lastIndex: number } {
    if (keyword && keyword.keyword in backgroundRepeatMap) {
        return { repeat: backgroundRepeatMap[keyword.keyword], lastIndex: keyword.lastIndex };
    }
    return null;
}

const percentageOrLengthRegEx = /\s*([\+\-]?(?:\d+\.\d+|\d+|\.\d+)(?:[eE][\+\-]?\d+)?)(px|dip|%)?\s*|()/g;
export function parsePercentageOrLength(value: string, lastIndex: number = 0): Percentage | Length {
    percentageOrLengthRegEx.lastIndex = lastIndex;
    const result = percentageOrLengthRegEx.exec(value);
    lastIndex = percentageOrLengthRegEx.lastIndex;
    if (result[1]) {
        let value = parseFloat(result[1]);
        const unit = <"px" | "dip" | "%">result[2] || "dip";
        if (unit === "%") {
            value /= 100;
        }
        return { value, unit, lastIndex };
    }
    return null;
}

interface Length {
    value: number;
    unit: "px" | "dip" | "%";
    lastIndex: number;
}
interface Percentage {
    value: number;
    unit: "px" | "dip";
    lastIndex: number;
}

const backgroundPositionKeywords = Object.freeze(new Set([ "left", "right", "top", "bottom", "center" ]));
const backgroundPositionKeywordsDirection: {[align: string]: "x" | "center" | "y" } = {
    "left": "x",
    "right": "x",
    "center": "center",
    "top": "y",
    "bottom": "y"
}
export function parseBackgroundPosition(value: string, lastIndex: number = 0, keyword = parseKeyword(value, lastIndex)): BackgroundPosition & { lastIndex: number } {
    function format<T extends "center">(align: T, offset: Percentage | Length) {
        if (align === "center") {
            return "center"
        } else if (offset && offset.value !== 0) {
            return { align, offset: offset.value, unit: offset.unit }
        } else {
            return align;
        }
    }
    if (keyword && backgroundPositionKeywords.has(keyword.keyword)) {
        lastIndex = keyword.lastIndex;
        let firstDirection = backgroundPositionKeywordsDirection[keyword.keyword];

        const firstLength = firstDirection != "center" && parsePercentageOrLength(value, lastIndex);
        if (firstLength) {
            lastIndex = firstLength.lastIndex;
        }

        const secondKeyword = parseKeyword(value, lastIndex);
        if (secondKeyword && backgroundPositionKeywords.has(secondKeyword.keyword)) {
            lastIndex = secondKeyword.lastIndex;
            let secondDirection = backgroundPositionKeywordsDirection[secondKeyword.keyword];

            if (firstDirection === secondDirection && firstDirection !== "center") {
                return null; // Reject pair of both horizontal or both vertical alignments.
            }

            const secondLength = secondDirection != "center" && parsePercentageOrLength(value, lastIndex);
            if (secondLength) {
                lastIndex = secondLength.lastIndex;
            }

            if ((firstDirection === secondDirection && secondDirection === "center") || (firstDirection === "x" || secondDirection === "y")) {
                return {
                    x: format(<any>keyword.keyword, firstLength),
                    y: format(<any>secondKeyword.keyword, secondLength),
                    lastIndex
                }
            } else {
                return {
                    y: format(<any>keyword.keyword, firstLength),
                    x: format(<any>secondKeyword.keyword, secondLength),
                    lastIndex
                }
            }
        } else {
            if (firstDirection === "center") {
                return { x: "center", y: "center", lastIndex };
            } else if (firstDirection === "x") {
                return {
                    x: format(<any>keyword.keyword, firstLength),
                    y: "center",
                    lastIndex
                }
            } else {
                return {
                    x: "center",
                    y: format(<any>keyword.keyword, firstLength),
                    lastIndex
                }
            }
        }
    } else {
        const firstLength = parsePercentageOrLength(value, lastIndex);
        if (firstLength) {
            lastIndex = firstLength.lastIndex;
            const secondLength = parsePercentageOrLength(value, lastIndex);
            if (secondLength) {
                lastIndex = secondLength.lastIndex;
                return {
                    x: { align: "left", offset: firstLength.value, unit: firstLength.unit },
                    y: { align: "top", offset: secondLength.value, unit: secondLength.unit },
                    lastIndex
                };
            } else {
                return {
                    x: { align: "left", offset: firstLength.value, unit: firstLength.unit },
                    y: "center",
                    lastIndex
                };
            }
        } else {
            return null;
        }
    }
}

export interface Background {
    /**
     * Background color argb number.
     */
    readonly color?: number;
    /**
     * Background image url.
     */
    readonly image?: string;
    readonly repeat?: BackgroundRepeat;
    readonly position?: BackgroundPosition;
}

export interface BackgroundRepeat {
    readonly x: boolean;
    readonly y: boolean;
}

export interface BackgroundPosition {
    readonly x: "left" | "center" | "right" | {
        readonly align: "left" | "right",
        readonly offset: number,
        readonly unit: "dip" | "px" | "%"
    };
    readonly y: "top" | "center" | "bottom" | {
        readonly align: "top" | "bottom";
        readonly offset: number;
        readonly unit: "dip" | "px" | "%";
    };
}

export function parseBackground(value: string): Background {
    const background: any = {};
    let lastIndex = 0;
    while(lastIndex < value.length) {
        const color = parseColor(value, lastIndex);
        if (color) {
            background.color = color.argb;
            lastIndex = color.lastIndex;
            continue;
        }
        const url = parseURL(value, lastIndex);
        if (url) {
            background.image = url.url;
            lastIndex = url.lastIndex;
            continue;
        }

        const keyword = parseKeyword(value, lastIndex);
        const repeat = parseRepeat(value, lastIndex, keyword);
        if (repeat) {
            background.repeat = repeat.repeat;
            lastIndex = repeat.lastIndex;
            continue;
        }

        const position = parseBackgroundPosition(value, lastIndex, keyword);
        if (position) {
            background.position = { x: position.x, y: position.y };
            lastIndex = position.lastIndex;
            // Try to parse also <"/" size>
            continue;
        }

        return null;
    }
    return background;
}

function getLeadingWhiteSpace(result: RegExpExecArray): string {
    return result[1] || "";
}
