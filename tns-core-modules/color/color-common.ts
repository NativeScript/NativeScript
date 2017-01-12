import * as definition from "color";
import * as types from "utils/types";
import * as knownColors from "color/known-colors";

const SHARP = "#";
const HEX_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^#[0-9A-F]{8}$)/i;

export class Color implements definition.Color {
    private _a: number;
    private _r: number;
    private _g: number;
    private _b: number;
    private _hex: string;
    private _argb: number;
    private _name: string;

    constructor(color: number);
    constructor(color: string);
    constructor(a: number, r: number, g: number, b: number);
    constructor() {
        if (arguments.length === 1) {
            const arg = arguments[0];
            if (types.isString(arg)) {
                if (isRgbOrRgba(arg)) {
                    this._argb = argbFromRgbOrRgba(arg);
                } else if (knownColors.isKnownName(arg)) {
                    // The parameter is a known color name
                    this._hex = knownColors.getKnownColor(arg);
                    this._name = arg;
                    this._argb = this._argbFromString(this._hex);
                } else if (HEX_REGEX.test(arg)) {
                    // The parameter is a "#AARRGGBB" formatted string
                    this._hex = this._normalizeHex(arg);
                    this._argb = this._argbFromString(this._hex);
                } else {
                    throw new Error("Invalid color: " + arg);
                }
            } else if (types.isNumber(arg)) {
                // The parameter is a 32-bit unsigned integer where each 8 bits specify a color component
                this._argb = arg;
            } else {
                throw new Error("Expected 1 or 4 constructor parameters.");
            }
            this._parseComponents();
            if (!this._hex) {
                this._hex = this._buildHex();
            }
        } else if (arguments.length === 4) {
            // TODO: Alpha may be optional
            this._a = arguments[0];
            this._r = arguments[1];
            this._g = arguments[2];
            this._b = arguments[3];
            this._buildArgb();
            this._hex = this._buildHex();
        } else {
            throw new Error("Expected 1 or 4 constructor parameters.");
        }
    }

    get a(): number {
        return this._a;
    }

    get r(): number {
        return this._r;
    }

    get g(): number {
        return this._g;
    }

    get b(): number {
        return this._b;
    }

    get argb(): number {
        return this._argb;
    }

    get hex(): string {
        return this._hex;
    }

    get name(): string {
        return this._name;
    }

    get ios(): UIColor {
        return undefined;
    }

    get android(): number {
        return undefined;
    }

    public _argbFromString(hex: string): number {
        return undefined;
    }

    public equals(value: definition.Color): boolean {
        return this.argb === value.argb;
    }

    public static equals(value1: definition.Color, value2: definition.Color): boolean {
        // both values are falsy
        if (!value1 && !value2) {
            return true;
        }

        // only one is falsy
        if (!value1 || !value2) {
            return false;
        }

        return value1.equals(value2);
    }

    public static isValid(value: any): boolean {
        if (types.isNullOrUndefined(value) || value instanceof Color) {
            return true;
        }

        if (!types.isString(value)) {
            return false;
        }

        if (knownColors.isKnownName(value)) {
            return true;
        }

        return HEX_REGEX.test(value) || isRgbOrRgba(value);
    }

    private _buildHex(): string {
        return SHARP + this._componentToHex(this._a) + this._componentToHex(this._r) + this._componentToHex(this._g) + this._componentToHex(this._b);
    }

    private _componentToHex(component: number): string {
        let hex = component.toString(16);
        if (hex.length === 1) {
            hex = "0" + hex;
        }

        return hex;
    }

    private _parseComponents() {
        if (types.isUndefined(this._argb)) {
            throw new Error("Missing the ARGB numeric value");
        }

        // Format is ARGB, so alpha takes the first 8 bits, red the next, green the next and the last 8 bits are for the blue component
        this._a = (this._argb >> 24) & 255;
        this._r = (this._argb >> 16) & 255;
        this._g = (this._argb >> 8) & 255;
        this._b = this._argb & 255;
    }

    private _buildArgb() {
        // Format is ARGB, so alpha takes the first 8 bits, red the next, green the next and the last 8 bits are for the blue component
        this._argb = (this._a << 24) | (this._r << 16) | (this._g << 8) | this._b;
    }

    private _normalizeHex(hexStr: string): string {
        if (hexStr.charAt(0) === SHARP && hexStr.length === 4) {
            // Duplicate each char after the #, so "#123" becomes "#112233"
            hexStr = hexStr.charAt(0)
                + hexStr.charAt(1) + hexStr.charAt(1)
                + hexStr.charAt(2) + hexStr.charAt(2)
                + hexStr.charAt(3) + hexStr.charAt(3);
        }
        return hexStr;
    }

    public toString(): string {
        return this.hex;
    }
}

function isRgbOrRgba(value: string): boolean {
    const toLower = value.toLowerCase();
    return (toLower.indexOf("rgb(") === 0 || toLower.indexOf("rgba(") === 0) && toLower.indexOf(")") === (toLower.length - 1);
}

function argbFromRgbOrRgba(value: string): number {
    const toLower = value.toLowerCase();
    const parts = toLower.replace("rgba(", "").replace("rgb(", "").replace(")", "").trim().split(",");

    let r = 255;
    let g = 255;
    let b = 255;
    let a = 255;

    if (parts[0]) {
        r = parseInt(parts[0].trim());
    }

    if (parts[1]) {
        g = parseInt(parts[1].trim());
    }

    if (parts[2]) {
        b = parseInt(parts[2].trim());
    }

    if (parts[3]) {
        a = Math.round(parseFloat(parts[3].trim()) * 255);
    }

    // Format is ARGB, so alpha takes the first 8 bits, red the next, green the next and the last 8 bits are for the blue component
    return (a << 24) | (r << 16) | (g << 8) | b;
}