export class Font {
	public static default: Font;

	public fontFamily: string;
	public fontStyle: FontStyleType;
	public fontWeight: FontWeightType;
	public fontSize: number;
	public fontScale: number;

	public isBold: boolean;
	public isItalic: boolean;

	constructor(family: string, size: number, style?: FontStyleType, weight?: FontWeightType, scale?: number);

	public getAndroidTypeface(): any /* android.graphics.Typeface */;
	public getUIFont(defaultFont: any /* UIFont */): any /* UIFont */;

	public withFontFamily(family: string): Font;
	public withFontStyle(style: FontStyleType): Font;
	public withFontWeight(weight: FontWeightType): Font;
	public withFontSize(size: number): Font;
	public withFontScale(scale: number): Font;

	public static equals(value1: Font, value2: Font): boolean;
}

export type FontStyleType = 'normal' | 'italic';
export namespace FontStyle {
	export const NORMAL: 'normal';
	export const ITALIC: 'italic';
	export function isValid(value: any): boolean;
	export function parse(value: string): FontStyleType;
}

export type FontWeightType = '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900' | number;
export namespace FontWeight {
	export const THIN: '100';
	export const EXTRA_LIGHT: '200';
	export const LIGHT: '300';
	export const NORMAL: 'normal';
	export const MEDIUM: '500';
	export const SEMI_BOLD: '600';
	export const BOLD: 'bold';
	export const EXTRA_BOLD: '800';
	export const BLACK: '900';
	export function isValid(value: any): boolean;
	export function parse(value: string): FontWeightType;
}

export interface ParsedFont {
	fontStyle?: FontStyleType;
	fontVariant?: string;
	fontWeight?: FontWeightType;
	lineHeight?: string;
	fontSize?: string;
	fontFamily?: string;
}

export function parseFont(fontValue: string): ParsedFont;

export namespace ios {
	export function registerFont(fontFile: string);
}
