import { Font } from './font';
import { ParsedFont, FontStyleType, FontWeightType, FontVariationSettingsType } from './font-interfaces';
import { makeValidator, makeParser } from '../core/properties';
import { Trace } from '../../trace';

export const FONTS_BASE_PATH = '/fonts';

export abstract class FontBase implements Font {
	public static default = undefined;
	public readonly fontStyle: FontStyleType;
	public readonly fontWeight: FontWeightType;
	public readonly fontScale: number;

	isDirty = false;

	cloneOrDirty() {
		let clone = <Font>this;
		if (clone === Font.default) {
			clone = new Font(undefined, undefined);
			Object.assign(clone, this);
		} else {
			clone.isDirty = true;
			// clear android cached typeface. need to find a better way
			clone['_typeface'] = null;
		}
		return clone;
	}

	get isItalic(): boolean {
		return this.fontStyle === FontStyle.ITALIC;
	}

	get isBold(): boolean {
		return isFontWeightBold(this.fontWeight);
	}

	protected constructor(
		public readonly fontFamily: string,
		public readonly fontSize: number,
		fontStyle?: FontStyleType,
		fontWeight?: FontWeightType,
		fontScale?: number,
		public readonly fontVariationSettings?: Array<FontVariationSettingsType>,
	) {
		this.fontStyle = fontStyle ?? FontStyle.NORMAL;
		this.fontWeight = fontWeight ?? FontWeight.NORMAL;
		this.fontScale = fontScale ?? 1;
	}

	public abstract getAndroidTypeface(): any; /* android.graphics.Typeface */
	public abstract getUIFont(defaultFont: any /* UIFont */): any; /* UIFont */

	public withFontFamily(family: string): Font {
		const clone = this.cloneOrDirty();
		clone.fontFamily = family;
		return clone;
	}

	public withFontStyle(style: FontStyleType): Font {
		const clone = this.cloneOrDirty();
		clone.fontStyle = style;
		return clone;
	}

	public withFontWeight(weight: FontWeightType): Font {
		const clone = this.cloneOrDirty();
		clone.fontWeight = weight;
		return clone;
	}

	public withFontSize(size: number): Font {
		const clone = this.cloneOrDirty();
		clone.fontSize = size;
		return clone;
	}

	public withFontScale(scale: number): Font {
		const clone = this.cloneOrDirty();
		clone.fontScale = scale;
		return clone;
	}

	public withFontVariationSettings(variationSettings: Array<FontVariationSettingsType> | null): Font {
		const clone = this.cloneOrDirty();
		clone.fontVariationSettings = variationSettings;
		return clone;
	}

	public isEqualToDefaultFont() {
		return this === Font.default || (!this.fontFamily && this.fontScale === undefined && this.fontSize === undefined && !this.fontStyle && !this.fontWeight && !this.fontVariationSettings);
	}

	public static equals(value1: Font, value2: Font): boolean {
		// both values are falsy
		if (!value1 && !value2) {
			return true;
		}

		// only one is falsy
		if (!value1 || !value2) {
			return false;
		}

		return value1.fontFamily === value2.fontFamily && value1.fontSize === value2.fontSize && value1.fontStyle === value2.fontStyle && value1.fontWeight === value2.fontWeight && value1.fontScale === value2.fontScale && FontVariationSettings.toString(value1.fontVariationSettings) === FontVariationSettings.toString(value2.fontVariationSettings);
	}
}

export namespace FontStyle {
	export const NORMAL = 'normal';
	export const ITALIC = 'italic';
	export const isValid = makeValidator<FontStyleType>(NORMAL, ITALIC);
	export const parse = makeParser<FontStyleType>(isValid);
}

export namespace FontWeight {
	export const THIN = '100';
	export const EXTRA_LIGHT = '200';
	export const LIGHT = '300';
	export const NORMAL = 'normal';
	export const MEDIUM = '500';
	export const SEMI_BOLD = '600';
	export const BOLD = 'bold';
	export const EXTRA_BOLD = '800';
	export const BLACK = '900';
	export const isValid = makeValidator<FontWeightType>(THIN, EXTRA_LIGHT, LIGHT, NORMAL, '400', MEDIUM, SEMI_BOLD, BOLD, '700', EXTRA_BOLD, BLACK);
	export const parse = makeParser<FontWeightType>(isValid);
}

export namespace FontVariationSettings {
	export function parse(fontVariationSettings: string): Array<FontVariationSettingsType> | null {
		if (!fontVariationSettings) {
			return null;
		}

		const excluded = ['normal', 'inherit', 'initial', 'revert', 'revert-layer', 'unset'];
		const variationSettingsValue: string = fontVariationSettings.trim();

		if (excluded.indexOf(variationSettingsValue.toLowerCase()) !== -1) {
			return null;
		}

		const chunks = variationSettingsValue.split(',');
		if (chunks.length) {
			const parsed: Array<FontVariationSettingsType> = [];
			for (const chunk of chunks) {
				const trimmedChunk = chunk.trim();
				const axisChunks = trimmedChunk.split(' ');
				if (axisChunks.length === 2) {
					const axisName = axisChunks[0].trim();
					const axisValue = parseFloat(axisChunks[1]);
					// See https://drafts.csswg.org/css-fonts/#font-variation-settings-def.
					// Axis name strings longer or shorter than four characters are invalid.
					if (!isNaN(axisValue) && axisName.length === 6 && ((axisName.startsWith("'") && axisName.endsWith("'")) || (axisName.startsWith('"') && axisName.endsWith('"')))) {
						// Remove quotes as they might cause problems when using name as an object key
						const unquotedAxisName = axisName.substring(1, axisName.length - 1);
						parsed.push({ axis: unquotedAxisName, value: axisValue });
					} else {
						Trace.write('Invalid value (font-variation-settings): ' + variationSettingsValue, Trace.categories.Error, Trace.messageType.error);
					}
				} else {
					Trace.write('Invalid value (font-variation-settings): ' + variationSettingsValue, Trace.categories.Error, Trace.messageType.error);
				}
			}

			return parsed;
		}

		Trace.write('Invalid value (font-variation-settings): ' + variationSettingsValue, Trace.categories.Error, Trace.messageType.error);
	}

	export function toString(fontVariationSettings: FontVariationSettingsType[] | null): string | null {
		if (fontVariationSettings?.length) {
			return fontVariationSettings.map(({ axis, value }) => `'${axis}' ${value}`).join(', ');
		}

		return null;
	}
}

export function parseFontFamily(value: string): Array<string> {
	if (!value) {
		return [];
	}

	return value
		.split(',')
		.map((v) => (v || '').trim().replace(/['"]+/g, ''))
		.filter((v) => !!v);
}

export function isFontWeightBold(fontWeight: FontWeightType): boolean {
	return fontWeight === FontWeight.SEMI_BOLD || fontWeight === FontWeight.BOLD || fontWeight === '700' || fontWeight === FontWeight.EXTRA_BOLD || fontWeight === FontWeight.BLACK;
}

export namespace genericFontFamilies {
	export const serif = 'serif';
	export const sansSerif = 'sans-serif';
	export const monospace = 'monospace';
	export const system = 'system';
}

const styles = new Set<string>([FontStyle.NORMAL, FontStyle.ITALIC]);

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
const weights = new Set<string>([FontWeight.THIN, FontWeight.EXTRA_LIGHT, FontWeight.LIGHT, FontWeight.NORMAL, '400', FontWeight.MEDIUM, FontWeight.SEMI_BOLD, FontWeight.BOLD, '700', FontWeight.EXTRA_BOLD, FontWeight.BLACK]);

export function parseFont(fontValue: string): ParsedFont {
	const result: ParsedFont = {
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
			const sizes = part.split('/');
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

/**
 * Kind of hack.
 * Used to search font variation axis names, since iOS for some reason requires names
 * but tags are the standards.
 */
export function fuzzySearch(query: string, dataset: string[]): string[] | null {
	const q = query ? query.trim().toLowerCase() : '';

	const result: string[] = [];
	if (!q.length) {
		return null;
	}

	dataset.forEach((item) => {
		const s = item.trim().toLowerCase();
		let n = -1;
		for (const char of q) {
			n = s.indexOf(char, n + 1);
			if (!~n) {
				return;
			}
		}
		result.push(item);
	});

	return result.length ? result : null;
}
