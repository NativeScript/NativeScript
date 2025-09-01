import * as definition from '.';
import * as types from '../utils/types';
import * as knownColors from './known-colors';
import { Color } from '.';
import { HEX_REGEX, argbFromColorMix, argbFromHslOrHsla, argbFromHsvOrHsva, argbFromRgbOrRgba, hslToRgb, hsvToRgb, isCssColorMixExpression, isHslOrHsla, isHsvOrHsva, isRgbOrRgba, rgbToHsl, rgbToHsv, argbFromString } from './color-utils';

export class ColorBase implements definition.Color {
	private _argb: number;
	private _name: string;

	constructor(color: number);
	constructor(color: string);
	constructor(a: number, r: number, g: number, b: number, type?: 'rbg' | 'hsl' | 'hsv');
	constructor(...args) {
		if (args.length === 1) {
			const arg = args[0];
			if (types.isString(arg)) {
				const lowered = arg.toLowerCase();
				if (isRgbOrRgba(lowered)) {
					this._argb = argbFromRgbOrRgba(lowered);
				} else if (isHslOrHsla(lowered)) {
					this._argb = argbFromHslOrHsla(lowered);
				} else if (isHsvOrHsva(lowered)) {
					this._argb = argbFromHsvOrHsva(lowered);
				} else if (knownColors.isKnownName(lowered)) {
					// The parameter is a known color name
					const argb = knownColors.getKnownColor(lowered);
					this._name = arg;
					this._argb = argb;
				} else if (isCssColorMixExpression(lowered)) {
					this._argb = argbFromColorMix(lowered);
				} else if (arg[0].charAt(0) === '#' && (arg.length === 4 || arg.length === 5 || arg.length === 7 || arg.length === 9)) {
					// we dont use the regexp as it is quite slow. Instead we expect it to be a valid hex format
					// strange that it would not be. And if it is not a thrown error seems best
					// The parameter is a "#RRGGBBAA" formatted string
					this._argb = this._argbFromString(arg);
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
		} else if (args.length >= 4) {
			const a = args[0];
			switch (args[4]) {
				case 'hsl': {
					const { r, g, b } = hslToRgb(args[1], args[2], args[3]);
					this._argb = (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff) * 0x00000001;
					break;
				}
				case 'hsv': {
					const { r, g, b } = hsvToRgb(args[1], args[2], args[3]);
					this._argb = (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff) * 0x00000001;
					break;
				}
				default:
					this._argb = (a & 0xff) * 0x01000000 + (args[1] & 0xff) * 0x00010000 + (args[2] & 0xff) * 0x00000100 + (args[3] & 0xff) * 0x00000001;
					break;
			}
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
		let result = '#' + ('000000' + (this._argb & 0xffffff).toString(16)).toUpperCase().slice(-6);
		if (this.a !== 0xff) {
			return (result += ('00' + this.a.toString(16).toUpperCase()).slice(-2));
		}
		return result;
	}

	get name(): string {
		return this._name;
	}

	get ios(): any /* UIColor */ {
		return undefined;
	}

	get android(): number {
		return undefined;
	}

	public _argbFromString(hex: string): number {
		return argbFromString(hex);
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
		if (value instanceof Color) {
			return true;
		}

		if (!types.isString(value)) {
			return false;
		}
		const lowered = value.toLowerCase();

		if (knownColors.isKnownName(lowered)) {
			return true;
		}

		return HEX_REGEX.test(value) || isRgbOrRgba(lowered) || isHslOrHsla(lowered);
	}
	public static fromHSL(a, h, s, l) {
		return new Color(a, h, s, l, 'hsl');
	}
	public static fromHSV(a, h, s, l) {
		return new Color(a, h, s, l, 'hsv');
	}

	public toString(): string {
		return this.hex;
	}

	/**
	 * @param {UIColor} value
	 */
	public static fromIosColor(value: any): Color {
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
		return { ...rgbToHsl(this.r, this.g, this.b), a: this.a };
	}

	/**
	 * return the [CSS hsv](https://www.w3schools.com/Css/css_colors_hsl.asp) representation of the color
	 *
	 */
	public toHslString() {
		const hsl = rgbToHsl(this.r, this.g, this.b);
		const h = Math.round(hsl.h),
			s = Math.round(hsl.s),
			l = Math.round(hsl.l);
		const a = this.a;
		return a == 255 ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)' : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + (a / 255).toFixed(2) + ')';
	}

	/**
	 * return the hsv representation of the color
	 *
	 */
	public toHsv() {
		return { ...rgbToHsv(this.r, this.g, this.b), a: this.a };
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
		const hsl = rgbToHsl(this.r, this.g, this.b);
		return Color.fromHSL(this.a, hsl.h, Math.min(100, Math.max(0, hsl.s - amount)), hsl.l);
	}

	/**
	 * Saturate the color a given amount, from 0 to 100.
	 *
	 * @param amount (between 0 and 100)
	 */
	public saturate(amount: number) {
		amount = amount === 0 ? 0 : amount || 10;
		const hsl = rgbToHsl(this.r, this.g, this.b);
		return Color.fromHSL(this.a, hsl.h, Math.min(100, Math.max(0, hsl.s + amount)), hsl.l);
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
		const hsl = rgbToHsl(this.r, this.g, this.b);
		return Color.fromHSL(this.a, hsl.h, hsl.s, Math.min(100, Math.max(0, hsl.l + amount)));
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
		const hsl = rgbToHsl(this.r, this.g, this.b);
		return Color.fromHSL(this.a, hsl.h, hsl.s, Math.min(100, Math.max(0, hsl.l - amount)));
	}

	/**
	 * Spin the hue a given amount, from -360 to 360. Calling with 0, 360, or -360 will do nothing (since it sets the hue back to what it was before).
	 *
	 * @param amount (between -360 and 360)
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

	static mix(color1: Color, color2: Color, amount = 50) {
		const p = amount / 100;

		const rgba = {
			r: (color2.r - color1.r) * p + color1.r,
			g: (color2.g - color1.g) * p + color1.g,
			b: (color2.b - color1.b) * p + color1.b,
			a: (color2.a - color1.a) * p + color1.a,
		};

		return new Color(rgba.a, rgba.r, rgba.g, rgba.b);
	}
}
