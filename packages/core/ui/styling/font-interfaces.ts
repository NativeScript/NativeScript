export type FontStyle = 'normal' | 'italic';

export type FontWeight = '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900';

export interface ParsedFont {
	fontStyle?: FontStyle;
	fontVariant?: string;
	fontWeight?: FontWeight;
	lineHeight?: string;
	fontSize?: string;
	fontFamily?: string;
}
