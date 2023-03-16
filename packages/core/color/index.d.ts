/**
 * Represents a color object. Stores all color components (alpha (opacity), red, green, blue) in a [0..255] range.
 */
export declare class Color {
	constructor(knownColor: string);
	constructor(hex: string);
	constructor(argb: number);
	constructor(alpha: number, red: number, green: number, blue: number, type?: 'rgb' | 'hsl' | 'hsv');

	/**
	 * Gets the Alpha component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public a: number;

	/**
	 * Gets the Red component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public r: number;

	/**
	 * Gets the Green component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public g: number;

	/**
	 * Gets the Blue component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public b: number;

	/**
	 * Gets the Hexadecimal string representation of this color. This is a read-only property.
	 */
	public hex: string;

	/**
	 * Gets the Argb Number representation of this color where each 8 bits represent a single color component. This is a read-only property.
	 */
	public argb: number;

	/**
	 * Gets the known name of this instance. Defined only if it has been constructed from a known color name - e.g. "red". This is a read-only property.
	 */
	public name: string;

	/**
	 * Gets the android-specific integer value representation. Same as the Argb one. This is a read-only property.
	 */
	android: number;

	/**
	 * Gets the iOS-specific UIColor value representation. This is a read-only property.
	 */
	ios: any /* UIColor */;

	/**
	 * Specifies whether this Color is equal to the Color parameter.
	 * @param value The Color to test.
	 */
	public equals(value: Color): boolean;

	/**
	 * Compares two Color instances.
	 * @param value1 A Color to compare.
	 * @param value2 A Color to compare.
	 */
	public static equals(value1: Color, value2: Color): boolean;

	/**
	 * Validates if a value can be converted to color.
	 * @param value Input string.
	 */
	public static isValid(value: any): boolean;

	/**
	 * Creates color from iOS-specific UIColor value representation.
	 */
	public static fromIosColor(value: any /* UIColor */): Color;

	/**
	 * return true if brightenss < 128
	 *
	 */
	public isDark(): boolean;

	/**
	 * return true if brightenss >= 128
	 *
	 */
	public isLight(): boolean;

	/**
	 * return the [brightness](http://www.w3.org/TR/AERT#color-contrast)
	 *
	 */
	public getBrightness(): number;
	/**
	 * return the [luminance](http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef)
	 *
	 */
	public getLuminance(): number;

	/**
	 * Return this color (as a new Color instance) with the provided alpha
	 *
	 * @param alpha (between 0 and 255)
	 */
	public setAlpha(a: number): Color;
	/**
	 * return the hsl representation of the color
	 *
	 */
	public toHsl(): { h: number; s: number; l: number; a: number };

	/**
	 * return the [CSS hsv](https://www.w3schools.com/Css/css_colors_hsl.asp) representation of the color
	 *
	 */
	public toHslString(): string;

	/**
	 * return the hsv representation of the color
	 *
	 */
	public toHsv(): { h: number; s: number; v: number; a: number };

	/**
	 * return the [CSS hsv](https://www.w3schools.com/Css/css_colors_rgb.asp) representation of the color
	 *
	 */
	public toHsvString(): string;

	/**
	 * return the [CSS rgb](https://www.w3schools.com/Css/css_colors_rgb.asp) representation of the color
	 *
	 */
	public toRgbString(): string;

	/**
	 *  Desaturate the color a given amount, from 0 to 100. Providing 100 will is the same as calling greyscale.
	 *
	 * @param amount (between 0 and 100)
	 */
	public desaturate(amount: number): Color;

	/**
	 * Saturate the color a given amount, from 0 to 100.
	 *
	 * @param amount (between 0 and 100)
	 */
	public saturate(amount: number): Color;

	/**
	 * Completely desaturates a color into greyscale. Same as calling desaturate(100).
	 *
	 * @returns
	 */
	public greyscale(): Color;

	/**
	 * Lighten the color a given amount, from 0 to 100. Providing 100 will always return white.
	 *
	 * @param amount (between 0 and 100)
	 * @returns olor : Color
	 */
	public lighten(amount: number): Color;

	/**
	 * Brighten the color a given amount, from 0 to 100.
	 *
	 * @param amount (between 0 and 100)
	 */
	public brighten(amount: number): Color;

	/**
	 * Darken the color a given amount, from 0 to 100. Providing 100 will always return black.
	 *
	 * @param amount (between 0 and 100)
	 */
	public darken(amount: number): Color;

	/**
	 * Spin the hue a given amount, from -360 to 360. Calling with 0, 360, or -360 will do nothing (since it sets the hue back to what it was before).
	 *
	 * @param amount (between 0 and 100)
	 */
	public spin(amount: number): Color;

	/**
	 * returns the color complement
	 *
	 */
	public complement(): Color;

	/**
	 * returns the color complement
	 *
	 */
	public static mix(color1: Color, color2: Color, amount: number): Color;

	/**
	 * returns a new Color from HSL
	 *
	 */
	public static fromHSL(a, h, s, l): Color;
	public static fromHSV(a, h, s, l): Color;
}
