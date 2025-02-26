import { CoreTypes } from '../enums';

export type FontStyleType = 'normal' | 'italic' | CoreTypes.CSSWideKeywords;
export type FontWeightType = '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900' | number | CoreTypes.CSSWideKeywords;

export interface ParsedFont {
	fontStyle?: FontStyleType;
	fontVariant?: string;
	fontWeight?: FontWeightType;
	lineHeight?: string;
	fontSize?: string;
	fontFamily?: string;
	fontVariationSettings?: FontVariationSettingsType[];
}

export type FontVariationSettingsType = {
	axis: string;
	value: number;
};
