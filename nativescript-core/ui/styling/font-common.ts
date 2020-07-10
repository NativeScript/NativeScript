import { Font as FontDefinition } from './font';
import { ParsedFont } from './font-interfaces';
import { makeValidator, makeParser } from '../core/properties';

export * from './font-interfaces';

export abstract class Font implements FontDefinition {
	public static default = undefined;

	get isItalic(): boolean {
		return this.fontStyle === FontStyle.ITALIC;
	}

	get isBold(): boolean {
		return this.fontWeight === FontWeight.SEMI_BOLD || this.fontWeight === FontWeight.BOLD || this.fontWeight === '700' || this.fontWeight === FontWeight.EXTRA_BOLD || this.fontWeight === FontWeight.BLACK;
	}

	protected constructor(public readonly fontFamily: string, public readonly fontSize: number, public readonly fontStyle: FontStyle, public readonly fontWeight: FontWeight) {}

	public abstract getAndroidTypeface(): any /* android.graphics.Typeface */;
	public abstract getUIFont(defaultFont: any /* UIFont */): any /* UIFont */;
	public abstract withFontFamily(family: string): Font;
	public abstract withFontStyle(style: string): Font;
	public abstract withFontWeight(weight: string): Font;
	public abstract withFontSize(size: number): Font;

	public static equals(value1: Font, value2: Font): boolean {
		// both values are falsy
		if (!value1 && !value2) {
			return true;
		}

		// only one is falsy
		if (!value1 || !value2) {
			return false;
		}

		return value1.fontFamily === value2.fontFamily && value1.fontSize === value2.fontSize && value1.fontStyle === value2.fontStyle && value1.fontWeight === value2.fontWeight;
	}
}

export type FontStyle = 'normal' | 'italic';
export namespace FontStyle {
	export const NORMAL: 'normal' = 'normal';
	export const ITALIC: 'italic' = 'italic';
	export const isValid = makeValidator<FontStyle>(NORMAL, ITALIC);
	export const parse = makeParser<FontStyle>(isValid);
}

export type FontWeight = '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900';
export namespace FontWeight {
	export const THIN: '100' = '100';
	export const EXTRA_LIGHT: '200' = '200';
	export const LIGHT: '300' = '300';
	export const NORMAL: 'normal' = 'normal';
	export const MEDIUM: '500' = '500';
	export const SEMI_BOLD: '600' = '600';
	export const BOLD: 'bold' = 'bold';
	export const EXTRA_BOLD: '800' = '800';
	export const BLACK: '900' = '900';
	export const isValid = makeValidator<FontWeight>(THIN, EXTRA_LIGHT, LIGHT, NORMAL, '400', MEDIUM, SEMI_BOLD, BOLD, '700', EXTRA_BOLD, BLACK);
	export const parse = makeParser<FontStyle>(isValid);
}

export function parseFontFamily(value: string): Array<string> {
	const result = new Array<string>();
	if (!value) {
		return result;
	}

	const split = value.split(',');
	for (let i = 0; i < split.length; i++) {
		let str = split[i].trim().replace(/['"]+/g, '');
		if (str) {
			result.push(str);
		}
	}

	return result;
}

export module genericFontFamilies {
	export const serif = 'serif';
	export const sansSerif = 'sans-serif';
	export const monospace = 'monospace';
	export const system = 'system';
}

const styles = new Set();
[FontStyle.NORMAL, FontStyle.ITALIC].forEach((val, i, a) => styles.add(val));

// http://www.w3schools.com/cssref/pr_font_weight.asp
//- normal(same as 400)
//- bold(same as 700)
//- 100(Thin) (API16 -thin)
//- 200(Extra Light / Ultra Light) (API16 -light)
//- 300(Light) (API16 -light)
//- 400(Normal)
//- 500(Medium) (API21 -medium)
//- 600(Semi Bold / Demi Bold) (API21 -medium)
//- 700(Bold) (API16 -bold)
//- 800(Extra Bold / Ultra Bold) (API16 -bold)
//- 900(Black / Heavy) (API21 -black)
const weights = new Set();
[FontWeight.THIN, FontWeight.EXTRA_LIGHT, FontWeight.LIGHT, FontWeight.NORMAL, '400', FontWeight.MEDIUM, FontWeight.SEMI_BOLD, FontWeight.BOLD, '700', FontWeight.EXTRA_BOLD, FontWeight.BLACK].forEach((val, i, a) => weights.add(val));

export function parseFont(fontValue: string): ParsedFont {
	let result: ParsedFont = {
		fontStyle: 'normal',
		fontVariant: 'normal',
		fontWeight: 'normal',
	};

	const parts = fontValue.split(/\s+/);
	let part: string;
	while ((part = parts.shift())) {
		if (part === 'normal') {
			// nothing to do here
		} else if (part === 'small-caps') {
			// The only supported font variant in shorthand font
			result.fontVariant = part;
		} else if (styles.has(part)) {
			result.fontStyle = <any>part;
		} else if (weights.has(part)) {
			result.fontWeight = <any>part;
		} else if (!result.fontSize) {
			let sizes = part.split('/');
			result.fontSize = sizes[0];
			result.lineHeight = sizes.length > 1 ? sizes[1] : undefined;
		} else {
			result.fontFamily = part;
			if (parts.length) {
				result.fontFamily += ' ' + parts.join(' ');
			}
			break;
		}
	}

	return result;
}
