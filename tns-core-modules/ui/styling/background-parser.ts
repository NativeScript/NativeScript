
interface TokenRange {
    lastIndex: number;
}

interface Color {
    argb: number;
}
interface URL {
    url: string;
}
interface Unit {
    value: number;
    unit: string;
}

const urlRegEx = /\s*url\((?:('|")([^\1]*)\1|([^\)]*))\)\s*/gy;
export function parseURL(value: string, lastIndex: number = 0): URL & TokenRange {
    urlRegEx.lastIndex = lastIndex;
    const result = urlRegEx.exec(value);
    if (!result) {
        return null;
    }
    lastIndex = urlRegEx.lastIndex;
    const url = result[2] || result[3] || undefined;
    return url === undefined ? null : { url, lastIndex };
}

const hexColorRegEx = /\s*#((?:[0-9A-F]{8})|(?:[0-9A-F]{6})|(?:[0-9A-F]{3}))\s*/giy;
function parseHexColor(value: string, lastIndex: number = 0): Color & TokenRange {
    hexColorRegEx.lastIndex = lastIndex;
    const result = hexColorRegEx.exec(value);
    if (!result) {
        return null;
    }
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

const rgbColorRegEx = /\s*(rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\))/gy;
function parseRGBColor(value: string, lastIndex: number = 0): Color & TokenRange {
    rgbColorRegEx.lastIndex = lastIndex;
    const result = rgbColorRegEx.exec(value);
    if (!result) {
        return null;
    }
    lastIndex = rgbColorRegEx.lastIndex;
    const argb = result[1] && rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]));
    return { argb, lastIndex };
}

const rgbaColorRegEx = /\s*(rgba\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*,\s*([01]?\.?\d*)\s*\))/gy;
function parseRGBAColor(value: string, lastIndex: number = 0): Color & TokenRange {
    rgbaColorRegEx.lastIndex = lastIndex;
    const result = rgbaColorRegEx.exec(value);
    if (!result) {
        return null;
    }
    lastIndex = rgbaColorRegEx.lastIndex;
    const argb = rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]), parseFloat(result[5]));
    return { argb, lastIndex };
}

const colorKeywords = {
    aliceblue: 0xFFF0F8FF,
    antiquewhite: 0xFFFAEBD7,
    aqua: 0xFF00FFFF,
    aquamarine: 0xFF7FFFD4,
    azure: 0xFFF0FFFF,
    beige: 0xFFF5F5DC,
    bisque: 0xFFFFE4C4,
    black: 0xFF000000,
    blanchedalmond: 0xFFFFEBCD,
    blue: 0xFF0000FF,
    blueviolet: 0xFF8A2BE2,
    brown: 0xFFA52A2A,
    burlywood: 0xFFDEB887,
    cadetblue: 0xFF5F9EA0,
    chartreuse: 0xFF7FFF00,
    chocolate: 0xFFD2691E,
    coral: 0xFFFF7F50,
    cornflowerblue: 0xFF6495ED,
    cornsilk: 0xFFFFF8DC,
    crimson: 0xFFDC143C,
    cyan: 0xFF00FFFF,
    darkblue: 0xFF00008B,
    darkcyan: 0xFF008B8B,
    darkgoldenrod: 0xFFB8860B,
    darkgray: 0xFFA9A9A9,
    darkgreen: 0xFF006400,
    darkgrey: 0xFFA9A9A9,
    darkkhaki: 0xFFBDB76B,
    darkmagenta: 0xFF8B008B,
    darkolivegreen: 0xFF556B2F,
    darkorange: 0xFFFF8C00,
    darkorchid: 0xFF9932CC,
    darkred: 0xFF8B0000,
    darksalmon: 0xFFE9967A,
    darkseagreen: 0xFF8FBC8F,
    darkslateblue: 0xFF483D8B,
    darkslategray: 0xFF2F4F4F,
    darkslategrey: 0xFF2F4F4F,
    darkturquoise: 0xFF00CED1,
    darkviolet: 0xFF9400D3,
    deeppink: 0xFFFF1493,
    deepskyblue: 0xFF00BFFF,
    dimgray: 0xFF696969,
    dimgrey: 0xFF696969,
    dodgerblue: 0xFF1E90FF,
    firebrick: 0xFFB22222,
    floralwhite: 0xFFFFFAF0,
    forestgreen: 0xFF228B22,
    fuchsia: 0xFFFF00FF,
    gainsboro: 0xFFDCDCDC,
    ghostwhite: 0xFFF8F8FF,
    gold: 0xFFFFD700,
    goldenrod: 0xFFDAA520,
    gray: 0xFF808080,
    green: 0xFF008000,
    greenyellow: 0xFFADFF2F,
    grey: 0xFF808080,
    honeydew: 0xFFF0FFF0,
    hotpink: 0xFFFF69B4,
    indianred: 0xFFCD5C5C,
    indigo: 0xFF4B0082,
    ivory: 0xFFFFFFF0,
    khaki: 0xFFF0E68C,
    lavender: 0xFFE6E6FA,
    lavenderblush: 0xFFFFF0F5,
    lawngreen: 0xFF7CFC00,
    lemonchiffon: 0xFFFFFACD,
    lightblue: 0xFFADD8E6,
    lightcoral: 0xFFF08080,
    lightcyan: 0xFFE0FFFF,
    lightgoldenrodyellow: 0xFFFAFAD2,
    lightgray: 0xFFD3D3D3,
    lightgreen: 0xFF90EE90,
    lightgrey: 0xFFD3D3D3,
    lightpink: 0xFFFFB6C1,
    lightsalmon: 0xFFFFA07A,
    lightseagreen: 0xFF20B2AA,
    lightskyblue: 0xFF87CEFA,
    lightslategray: 0xFF778899,
    lightslategrey: 0xFF778899,
    lightsteelblue: 0xFFB0C4DE,
    lightyellow: 0xFFFFFFE0,
    lime: 0xFF00FF00,
    limegreen: 0xFF32CD32,
    linen: 0xFFFAF0E6,
    magenta: 0xFFFF00FF,
    maroon: 0xFF800000,
    mediumaquamarine: 0xFF66CDAA,
    mediumblue: 0xFF0000CD,
    mediumorchid: 0xFFBA55D3,
    mediumpurple: 0xFF9370DB,
    mediumseagreen: 0xFF3CB371,
    mediumslateblue: 0xFF7B68EE,
    mediumspringgreen: 0xFF00FA9A,
    mediumturquoise: 0xFF48D1CC,
    mediumvioletred: 0xFFC71585,
    midnightblue: 0xFF191970,
    mintcream: 0xFFF5FFFA,
    mistyrose: 0xFFFFE4E1,
    moccasin: 0xFFFFE4B5,
    navajowhite: 0xFFFFDEAD,
    navy: 0xFF000080,
    oldlace: 0xFFFDF5E6,
    olive: 0xFF808000,
    olivedrab: 0xFF6B8E23,
    orange: 0xFFFFA500,
    orangered: 0xFFFF4500,
    orchid: 0xFFDA70D6,
    palegoldenrod: 0xFFEEE8AA,
    palegreen: 0xFF98FB98,
    paleturquoise: 0xFFAFEEEE,
    palevioletred: 0xFFDB7093,
    papayawhip: 0xFFFFEFD5,
    peachpuff: 0xFFFFDAB9,
    peru: 0xFFCD853F,
    pink: 0xFFFFC0CB,
    plum: 0xFFDDA0DD,
    powderblue: 0xFFB0E0E6,
    purple: 0xFF800080,
    red: 0xFFFF0000,
    rosybrown: 0xFFBC8F8F,
    royalblue: 0xFF4169E1,
    saddlebrown: 0xFF8B4513,
    salmon: 0xFFFA8072,
    sandybrown: 0xFFF4A460,
    seagreen: 0xFF2E8B57,
    seashell: 0xFFFFF5EE,
    sienna: 0xFFA0522D,
    silver: 0xFFC0C0C0,
    skyblue: 0xFF87CEEB,
    slateblue: 0xFF6A5ACD,
    slategray: 0xFF708090,
    slategrey: 0xFF708090,
    snow: 0xFFFFFAFA,
    springgreen: 0xFF00FF7F,
    steelblue: 0xFF4682B4,
    tan: 0xFFD2B48C,
    teal: 0xFF008080,
    thistle: 0xFFD8BFD8,
    tomato: 0xFFFF6347,
    turquoise: 0xFF40E0D0,
    violet: 0xFFEE82EE,
    wheat: 0xFFF5DEB3,
    white: 0xFFFFFFFF,
    whitesmoke: 0xFFF5F5F5,
    yellow: 0xFFFFFF00,
    yellowgreen: 0xFF9ACD32
};

function parseColorKeyword(value, lastIndex: number, keyword = parseKeyword(value, lastIndex)): Color & TokenRange {
    if (keyword && keyword.keyword in colorKeywords) {
        return { argb: colorKeywords[keyword.keyword], lastIndex: keyword.lastIndex };
    }
    return null;
}

export function parseColor(value: string, lastIndex: number = 0, keyword = parseKeyword(value, lastIndex)): Color & TokenRange {
    return parseHexColor(value, lastIndex) || parseColorKeyword(value, lastIndex, keyword) || parseRGBColor(value, lastIndex) || parseRGBAColor(value, lastIndex);
}

interface Keyword {
    keyword: string;
    lastIndex: number;
}

const keywordRegEx = /\s*([a-z][\w\-]*)\s*/giy;
function parseKeyword(value: string, lastIndex: number = 0, preParsedKeyword?: Keyword): Keyword {
    if (preParsedKeyword) {
        return preParsedKeyword;
    }
    keywordRegEx.lastIndex = lastIndex;
    const result = keywordRegEx.exec(value);
    if (!result) {
        return null;
    }
    lastIndex = keywordRegEx.lastIndex;
    const keyword = result[1];
    // TRICKY: We return null instead of undefined so passing it in places where optional parameters are accepted
    // can figure out that it is provided as argument, and should not be re-parsed.
    return keyword === undefined ? null : { keyword, lastIndex }
}

const backgroundRepeatKeywords = new Set([ "repeat", "repeat-x", "repeat-y", "no-repeat" ]);
function parseRepeat(value: string, lastIndex: number = 0, keyword = parseKeyword(value, lastIndex)): BackgroundRepeat & TokenRange {
    if (keyword && backgroundRepeatKeywords.has(keyword.keyword)) {
        lastIndex = keyword.lastIndex;
        switch (keyword.keyword) {
            case "repeat": return { x: true, y: true, lastIndex };
            case "repeat-x": return { x: true, y: false, lastIndex };
            case "repeat-y": return { x: false, y: true, lastIndex };
            case "no-repeat": return { x: false, y: false, lastIndex };
        }
    }
    return null;
}

const unitRegEx = /\s*([\+\-]?(?:\d+\.\d+|\d+|\.\d+)(?:[eE][\+\-]?\d+)?)([a-zA-Z]+|%)?\s*/gy;
export function parseUnit(str: string, lastIndex: number = 0): TokenRange & Unit {
    unitRegEx.lastIndex = lastIndex;
    const result = unitRegEx.exec(str);
    if (!result) {
        return null;
    }
    lastIndex = unitRegEx.lastIndex;
    const value = parseFloat(result[1]);
    const unit = <any>result[2] || "dip";
    return { value, unit, lastIndex };
}

export function parsePercentageOrLength(value: string, lastIndex: number = 0): TokenRange & LengthPercentage {
    const unitResult = parseUnit(value, lastIndex);
    if (unitResult) {
        const { lastIndex, value, unit } = unitResult;
        if (unit === "%") {
            return { value: value / 100, unit, lastIndex };
        } else if (!unit) {
            return { value, unit: "dip", lastIndex };
        } else if (unit === "px" || unit === "dip") {
            return { value, unit, lastIndex };
        }
    }
    return null;
}

export function parseAngle(value: string, lastIndex: number = 0): TokenRange & Angle {
    const angleResult = parseUnit(value, lastIndex);
    if (angleResult) {
        const { lastIndex, value, unit } = angleResult;
        return ({
            "deg": (deg: number) => ({ angle: deg / 180 * Math.PI, lastIndex }),
            "rad": (rad: number) => ({ angle: rad, lastIndex }),
            "grad": (grad: number) => ({ angle: grad / 200 * Math.PI, lastIndex }),
            "turn": (turn: number) => ({ angle: turn * Math.PI * 2, lastIndex })
        }[unit] || (() => null))(value);
    }
    return null;
}
export interface Angle {
    angle: number;
}
export interface Length {
    value: number;
    unit: "px" | "dip";
}
export interface Percentage {
    value: number;
    unit: "%";
}
export type LengthPercentage = Length | Percentage; 

const backgroundSizeKeywords = new Set(["auto", "contain", "cover"]);
export function parseBackgroundSize(value: string, lastIndex: number = 0, keyword = parseKeyword(value, lastIndex)): { size: BackgroundSize, lastIndex: number } {
    if (keyword && backgroundSizeKeywords.has(keyword.keyword)) {
        lastIndex = keyword.lastIndex;
        const size = <"auto" | "cover" | "contain">keyword.keyword;
        return { size, lastIndex };
    }

    // Parse one or two lengths... the other will be "auto"
    const firstLength = parsePercentageOrLength(value, lastIndex);
    if (firstLength) {
        lastIndex = firstLength.lastIndex;
        const secondLength = parsePercentageOrLength(value, firstLength.lastIndex);
        if (secondLength) {
            lastIndex = secondLength.lastIndex;
            return { 
                size: {
                    x: { value: firstLength.value, unit: firstLength.unit },
                    y: { value: secondLength.value, unit: secondLength.unit }
                },
                lastIndex
            };
        } else {
            return {
                size: { 
                    x: { value: firstLength.value, unit: firstLength.unit },
                    y: "auto"
                },
                lastIndex
            };
        }
    }
    return null;
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
    function format<T extends "center">(align: T, offset: LengthPercentage) {
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

export interface ColorStop extends Color {
    offset?: LengthPercentage;
}

export interface LinearGradient {
    gradient: "linear";
    angle: number;
    colors: ColorStop[];
}

export interface RadialGradient {
    gradient: "radial";
    colors: ColorStop[];
}

const directionRegEx = /\s*to\s*(left|right|top|bottom)\s*(left|right|top|bottom)?\s*/gy;
const sideDirections = {
    top: Math.PI * 0/2,
    right: Math.PI * 1/2,
    bottom: Math.PI * 2/2,
    left: Math.PI * 3/2
}
const cornerDirections = {
    top: {
        right: Math.PI * 1/4,
        left: Math.PI * 7/4
    },
    right: {
        top: Math.PI * 1/4,
        bottom: Math.PI * 3/4
    },
    bottom: {
        right: Math.PI * 3/4,
        left: Math.PI * 5/4
    },
    left: {
        top: Math.PI * 7/4,
        bottom: Math.PI * 5/4
    }
}
function parseDirection(value: string, lastIndex: number = 0): TokenRange & Angle {
    directionRegEx.lastIndex = lastIndex;
    const result = directionRegEx.exec(value);
    if (!result) {
        return null;
    }
    lastIndex = directionRegEx.lastIndex;
    const firstDirection = result[1];
    if (result[2]) {
        const secondDirection = result[2];
        const direction = cornerDirections[firstDirection][secondDirection];
        return direction === undefined ? null : { angle: direction, lastIndex };
    } else {
        return { angle: sideDirections[firstDirection], lastIndex }
    }
}

const openingBracketRegEx = /\s*\(\s*/gy;
const closingBracketRegEx = /\s*\)\s*/gy;
const closingBracketOrCommaRegEx = /\s*(\)|,)\s*/gy;
function parseArgumentsList(value: string, lastIndex: number, argument: (value: string, lastIndex: number, index: number) => TokenRange): TokenRange {
    openingBracketRegEx.lastIndex = lastIndex;
    const openingBracket = openingBracketRegEx.exec(value);
    if (!openingBracket) {
        return null;
    }
    lastIndex = openingBracketRegEx.lastIndex;

    closingBracketRegEx.lastIndex = lastIndex;
    const closingBracket = closingBracketRegEx.exec(value);
    if (closingBracket) {
        return { lastIndex };
    }

    for(var index = 0; true; index++) {
        const arg = argument(value, lastIndex, index);
        if (!arg) {
            return null;
        }
        lastIndex = arg.lastIndex;
        
        closingBracketOrCommaRegEx.lastIndex = lastIndex;
        const closingBracketOrComma = closingBracketOrCommaRegEx.exec(value);
        if (closingBracketOrComma) {
            lastIndex = closingBracketOrCommaRegEx.lastIndex;
            if (closingBracketOrComma[1] === ",") {
                continue;
            } else if (closingBracketOrComma[1] === ")") {
                return { lastIndex };
            }
        } else {
            return null;
        }
    }
}

const linearGradientStartRegEx = /\s*linear-gradient\s*/gy;
export function parseLinearGradient(value: string, lastIndex: number = 0): TokenRange & { gradient: LinearGradient } {
    linearGradientStartRegEx.lastIndex = lastIndex;
    const lgs = linearGradientStartRegEx.exec(value);
    if (!lgs) {
        return null;
    }
    lastIndex = linearGradientStartRegEx.lastIndex;

    let angle = Math.PI;
    const colors: ColorStop[] = [];

    const parsedArgs = parseArgumentsList(value, lastIndex, (value, lastIndex, index) => {
        if (!index) {
            const angleArg = parseAngle(value, lastIndex) || parseDirection(value, lastIndex);
            if (angleArg) {
                angle = angleArg.angle;
                return angleArg;
            }
        }

        const color = parseColor(value, lastIndex);
        if (color) {
            const offset = parsePercentageOrLength(value, color.lastIndex);
            if (offset) {
                colors.push({ argb: color.argb, offset: <any>{ value: offset.value, unit: offset.unit } });
                return offset;
            }
            colors.push({ argb: color.argb });
            return color;
        }
    });
    if (!parsedArgs) {
        return null;
    }
    lastIndex = parsedArgs.lastIndex;

    return { gradient: { gradient: "linear", angle, colors }, lastIndex };
}

export function parseRadialGradient(vlaue: string, lastIndex: number = 0): TokenRange & { gradient: RadialGradient } {
    return null;
}

export interface Background {
    readonly color?: number;
    readonly image?: URL | LinearGradient;
    readonly repeat?: BackgroundRepeat;
    readonly position?: BackgroundPosition;
    readonly size?: BackgroundSize;
}

export interface BackgroundRepeat {
    readonly x: boolean;
    readonly y: boolean;
}

export type BackgroundSize = "auto" | "cover" | "contain" | {
    x: { value: number, unit: "%" | "px" | "dip" },
    y: "auto" | { value: number, unit: "%" | "px" | "dip" }
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

const slashRegEx = /\s*(\/)\s*/gy;
function parseSlash(value: string, lastIndex: number): TokenRange {
    slashRegEx.lastIndex = lastIndex;
    const slash = slashRegEx.exec(value);
    if (!slash) {
        return null;
    }
    return { lastIndex: slashRegEx.lastIndex };
}

export function parseBackground(value: string): Background {
    const background: any = {};
    let lastIndex = 0;
    while(lastIndex < value.length) {
        const keyword = parseKeyword(value, lastIndex);
        const color = parseColor(value, lastIndex, keyword);
        if (color) {
            background.color = color.argb;
            lastIndex = color.lastIndex;
            continue;
        }
        const url = parseURL(value, lastIndex);
        if (url) {
            background.image = { url: url.url };
            lastIndex = url.lastIndex;
            continue;
        }
        const repeat = parseRepeat(value, lastIndex, keyword);
        if (repeat) {
            background.repeat = { x: repeat.x, y: repeat.y };
            lastIndex = repeat.lastIndex;
            continue;
        }
        const position = parseBackgroundPosition(value, lastIndex, keyword);
        if (position) {
            background.position = { x: position.x, y: position.y };
            lastIndex = position.lastIndex;

            const slash = parseSlash(value, lastIndex);
            if (slash) {
                lastIndex = slash.lastIndex;
                const size = parseBackgroundSize(value, lastIndex);
                if (!size) {
                    // Found / but no proper size following
                    return null;
                }
                background.size = size.size;
                lastIndex = size.lastIndex;
            }
            continue;
        }

        const gradient = parseLinearGradient(value, lastIndex) || parseRadialGradient(value, lastIndex);
        if (gradient) {
            background.image = gradient.gradient;
            lastIndex = gradient.lastIndex;
            continue;
        }

        return null;
    }
    return background;
}

function getLeadingWhiteSpace(result: RegExpExecArray): string {
    return result[1] || "";
}
