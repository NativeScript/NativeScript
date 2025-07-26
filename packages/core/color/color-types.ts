// Shared Color interface/type for use in color-common.ts and platform files

export interface IColor {
	readonly a: number;
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly hex: string;
	readonly argb: number;
	readonly name: string;
	readonly android: number;
	readonly ios: any;

	equals(value: IColor): boolean;
	isDark(): boolean;
	isLight(): boolean;
	getBrightness(): number;
	getLuminance(): number;
	setAlpha(a: number): IColor;
	toHsl(): { h: number; s: number; l: number; a: number };
	toHslString(): string;
	toHsv(): { h: number; s: number; v: number; a: number };
	toHsvString(): string;
	toRgbString(): string;
	desaturate(amount: number): IColor;
	saturate(amount: number): IColor;
	greyscale(): IColor;
	lighten(amount: number): IColor;
	brighten(amount: number): IColor;
	darken(amount: number): IColor;
	spin(amount: number): IColor;
	complement(): IColor;
}

// Optionally, export the Color class type for static methods if needed
export type ColorClass = {
	new (...args: any[]): IColor;
	isValid(value: any): boolean;
	fromIosColor(value: any): IColor;
	fromHSL(a: number, h: number, s: number, l: number): IColor;
	fromHSV(a: number, h: number, s: number, l: number): IColor;
	mix(color1: IColor, color2: IColor, amount?: number): IColor;
	equals(value1: IColor, value2: IColor): boolean;
};
