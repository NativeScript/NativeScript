import * as definition from '.';
import * as types from '../utils/types';
import * as knownColors from './known-colors';
import { convertHSLToRGBColor } from '../css/parser';

const SHARP = '#';
const HEX_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^#[0-9A-F]{8}$)/i;

export class Color implements definition.Color {
	private _argb: number;
	private _name: string;

	constructor(color: number);
	constructor(color: string);
	constructor(a: number, r: number, g: number, b: number);
	constructor(...args) {
		if (args.length === 1) {
			const arg = args[0];
			if (types.isString(arg)) {
				if (isRgbOrRgba(arg)) {
					this._argb = argbFromRgbOrRgba(arg);
				} else if (isHslOrHsla(arg)) {
					this._argb = argbFromHslOrHsla(arg);
				} else if (knownColors.isKnownName(arg)) {
					// The parameter is a known color name
					const argb = knownColors.getKnownColor(arg);
					this._name = arg;
					this._argb = argb;
				} else if (arg[0].charAt(0) === SHARP && (arg.length === 4 || arg.length === 7 || arg.length === 9)) {
					// we dont use the regexp as it is quite slow. Instead we expect it to be a valid hex format
					// strange that it would not be. And if it is not a thrown error seems best
					// The parameter is a "#RRGGBBAA" formatted string
					const hex = this._normalizeHex(arg);
					this._argb = this._argbFromString(hex);
				} else {
					throw new Error('Invalid color: ' + arg);
				}
			} else if (types.isNumber(arg)) {
				// The parameter is a 32-bit unsigned integer where each 8 bits specify a color component
				// In case a 32-bit signed int (Android, Java has no unsigned types) was provided - convert to unsigned by applyint >>> 0
				this._argb = arg >>> 0;
			} else if (arg && arg._argb) {
				// we would go there if a color was passed as an argument (or an object which is why we dont do instanceof)
				// The parameter is a 32-bit unsigned integer where each 8 bits specify a color component
				// In case a 32-bit signed int (Android, Java has no unsigned types) was provided - convert to unsigned by applyint >>> 0
				this._argb = arg._argb >>> 0;
			} else {
				throw new Error('Expected 1 or 4 constructor parameters.');
			}
		} else if (args.length === 4) {
			this._argb = (args[0] & 0xff) * 0x01000000 + (args[1] & 0xff) * 0x00010000 + (args[2] & 0xff) * 0x00000100 + (args[3] & 0xff) * 0x00000001;
		} else {
			throw new Error('Expected 1 or 4 constructor parameters.');
		}
	}

	get a(): number {
		return (this._argb / 0x01000000) & 0xff;
	}
	get r(): number {
		return (this._argb / 0x00010000) & 0xff;
	}
	get g(): number {
		return (this._argb / 0x00000100) & 0xff;
	}
	get b(): number {
		return (this._argb / 0x00000001) & 0xff;
	}

	get argb(): number {
		return this._argb;
	}

	get hex(): string {
		if (this.a === 0xff) {
			return ('#' + this._componentToHex(this.r) + this._componentToHex(this.g) + this._componentToHex(this.b)).toUpperCase();
		} else {
			return ('#' + this._componentToHex(this.r) + this._componentToHex(this.g) + this._componentToHex(this.b) + this._componentToHex(this.a)).toUpperCase();
		}
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
		if (hex.charAt(0) === '#') {
			hex = hex.substr(1);
		}

		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		} else if (hex.length === 4) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
		}

		let intVal = parseInt(hex, 16);
		if (hex.length === 6) {
			// add the alpha component since the provided string is RRGGBB
			intVal = (intVal & 0x00ffffff) + 0xff000000;
		} else {
			// the new format is #RRGGBBAA
			// we need to shift the alpha value to 0x01000000 position
			const a = (intVal / 0x00000001) & 0xff;
			intVal = (intVal >>> 8) + (a & 0xff) * 0x01000000;
		}

		return intVal;
	}

	public equals(value: definition.Color): boolean {
		return value && this.argb === value.argb;
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

		return HEX_REGEX.test(value) || isRgbOrRgba(value) || isHslOrHsla(value);
	}
	public static fromHSL(a, h, s, l) {
		const rgb = hslToRgb(h, s, l);
		return new Color(a, rgb.r, rgb.g, rgb.b);
	}

	private _componentToHex(component: number): string {
		let hex = component.toString(16);
		if (hex.length === 1) {
			hex = '0' + hex;
		}

		return hex;
	}

	private _normalizeHex(hexStr: string): string {
		// we expect this to already has a # as first char as it is supposed to be tested before
		if (hexStr.length === 4) {
			// Duplicate each char after the #, so "#123" becomes "#112233"
			hexStr = hexStr.charAt(0) + hexStr.charAt(1) + hexStr.charAt(1) + hexStr.charAt(2) + hexStr.charAt(2) + hexStr.charAt(3) + hexStr.charAt(3);
		}

		return hexStr;
	}

	public toString(): string {
		return this.hex;
	}

	public static fromIosColor(value: UIColor): Color {
		return undefined;
	}

	/**
	 * return true if brightness < 128
	 *
	 */
	public isDark() {
		return this.getBrightness() < 128;
	}

	/**
	 * return true if brightness >= 128
	 *
	 */
	public isLight() {
		return !this.isDark();
	}

	/**
	 * return the [brightness](http://www.w3.org/TR/AERT#color-contrast)
	 *
	 */
	public getBrightness() {
		return (this.r * 299 + this.g * 587 + this.b * 114) / 1000;
	}

	/**
	 * return the [luminance](http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef)
	 *
	 */
	public getLuminance() {
		let R, G, B;
		const RsRGB = this.r / 255;
		const GsRGB = this.g / 255;
		const BsRGB = this.b / 255;

		if (RsRGB <= 0.03928) {
			R = RsRGB / 12.92;
		} else {
			R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
		}
		if (GsRGB <= 0.03928) {
			G = GsRGB / 12.92;
		} else {
			G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
		}
		if (BsRGB <= 0.03928) {
			B = BsRGB / 12.92;
		} else {
			B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
		}
		return 0.2126 * R + 0.7152 * G + 0.0722 * B;
	}

	/**
	 * Return this color (as a new Color instance) with the provided alpha
	 *
	 * @param alpha (between 0 and 255)
	 */
	public setAlpha(a: number) {
		return new Color(a, this.r, this.g, this.b);
	}

	/**
	 * return the hsl representation of the color
	 *
	 */
	public toHsl() {
		const hsl = rgbToHsl(this.r, this.g, this.b);
		return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this.a };
	}

	/**
	 * return the [CSS hsv](https://www.w3schools.com/Css/css_colors_hsl.asp) representation of the color
	 *
	 */
	public toHslString() {
		const hsl = rgbToHsl(this.r, this.g, this.b);
		const h = Math.round(hsl.h * 360),
			s = Math.round(hsl.s * 100),
			l = Math.round(hsl.l * 100);
		const a = this.a;
		return a == 255 ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)' : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + (a / 255).toFixed(2) + ')';
	}

	/**
	 * return the hsv representation of the color
	 *
	 */
	public toHsv() {
		const hsv = rgbToHsv(this.r, this.g, this.b);
		return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this.a };
	}

	/**
	 * return the [CSS hsv](https://www.w3schools.com/Css/css_colors_rgb.asp) representation of the color
	 *
	 */
	public toHsvString() {
		const hsv = rgbToHsv(this.r, this.g, this.b);
		const h = Math.round(hsv.h * 360),
			s = Math.round(hsv.s * 100),
			v = Math.round(hsv.v * 100);
		const a = this.a;
		return a == 255 ? 'hsv(' + h + ', ' + s + '%, ' + v + '%)' : 'hsva(' + h + ', ' + s + '%, ' + v + '%, ' + (a / 255).toFixed(2) + ')';
	}

	/**
	 * return the [CSS rgb](https://www.w3schools.com/Css/css_colors_rgb.asp) representation of the color
	 *
	 */
	public toRgbString() {
		const a = this.a;
		return a == 1 ? 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')' : 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', ' + (a / 255).toFixed(2) + ')';
	}

	/**
	 *  Desaturate the color a given amount, from 0 to 100. Providing 100 will is the same as calling greyscale.
	 *
	 * @param amount (between 0 and 100)
	 */
	public desaturate(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const hsl = this.toHsl();
		hsl.s -= amount / 100;
		hsl.s = Math.min(1, Math.max(0, hsl.s));
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}

	/**
	 * Saturate the color a given amount, from 0 to 100.
	 *
	 * @param amount (between 0 and 100)
	 */
	public saturate(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const hsl = this.toHsl();
		hsl.s += amount / 100;
		hsl.s = Math.min(1, Math.max(0, hsl.s));
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}

	/**
	 * Completely desaturates a color into greyscale. Same as calling desaturate(100).
	 *
	 */
	public greyscale() {
		return this.desaturate(100);
	}

	/**
	 * Lighten the color a given amount, from 0 to 100. Providing 100 will always return white.
	 *
	 * @param amount (between 0 and 100)
	 */
	public lighten(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const hsl = this.toHsl();
		hsl.l += amount / 100;
		hsl.l = Math.min(1, Math.max(0, hsl.l));
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}

	/**
	 * Brighten the color a given amount, from 0 to 100.
	 *
	 * @param amount (between 0 and 100)
	 */
	public brighten(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const r = Math.max(0, Math.min(255, this.r - Math.round(255 * -(amount / 100))));
		const g = Math.max(0, Math.min(255, this.g - Math.round(255 * -(amount / 100))));
		const b = Math.max(0, Math.min(255, this.b - Math.round(255 * -(amount / 100))));
		return new Color(this.a, r, g, b);
	}

	/**
	 * Darken the color a given amount, from 0 to 100. Providing 100 will always return black.
	 *
	 * @param amount (between 0 and 100)
	 */
	public darken(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const hsl = this.toHsl();
		hsl.l -= amount / 100;
		hsl.l = Math.min(1, Math.max(0, hsl.l));
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}

	/**
	 * Spin the hue a given amount, from -360 to 360. Calling with 0, 360, or -360 will do nothing (since it sets the hue back to what it was before).
	 *
	 * @param amount (between 0 and 100)
	 */
	public spin(amount: number) {
		const hsl = this.toHsl();
		const hue = (hsl.h + amount) % 360;
		hsl.h = hue < 0 ? 360 + hue : hue;
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}

	/**
	 * returns the color complement
	 *
	 */
	public complement() {
		const hsl = this.toHsl();
		hsl.h = (hsl.h + 180) % 360;
		return Color.fromHSL(this.a, hsl.h, hsl.s, hsl.l);
	}
}

function isRgbOrRgba(value: string): boolean {
	const toLower = value.toLowerCase();

	return (toLower.indexOf('rgb(') === 0 || toLower.indexOf('rgba(') === 0) && toLower.indexOf(')') === toLower.length - 1;
}

function isHslOrHsla(value: string): boolean {
	const toLower = value.toLowerCase();

	return (toLower.indexOf('hsl(') === 0 || toLower.indexOf('hsla(') === 0) && toLower.indexOf(')') === toLower.length - 1;
}

function parseColorWithAlpha(value: string): any {
	const toLower = value.toLowerCase();
	const parts = toLower
		.replace(/(rgb|hsl)a?\(/, '')
		.replace(')', '')
		.trim()
		.split(',');

	let f = 255;
	let s = 255;
	let t = 255;
	let a = 255;

	if (parts[0]) {
		f = parseInt(parts[0].trim());
	}

	if (parts[1]) {
		s = parseInt(parts[1].trim());
	}

	if (parts[2]) {
		t = parseInt(parts[2].trim());
	}

	if (parts[3]) {
		a = Math.round(parseFloat(parts[3].trim()) * 255);
	}

	return { f, s, t, a };
}

function argbFromRgbOrRgba(value: string): number {
	const { f: r, s: g, t: b, a } = parseColorWithAlpha(value);

	return (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff);
}

function argbFromHslOrHsla(value: string): number {
	const { f: h, s: s, t: l, a } = parseColorWithAlpha(value);

	const { r, g, b } = convertHSLToRGBColor(h, s, l);

	return (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff);
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h, s;
	const l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return { h: h, s: s, l: l };
}

function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
	let r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h;
	const v = max;

	const d = max - min;
	const s = max === 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h: h, s: s, v: v };
}
