export const VALID_FONT_SCALES = global.isIOS // iOS supports a wider number of font scales than Android does.
	? [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 2, 2.5, 3, 3.5, 4]
	: [0.85, 1, 1.15, 1.3];

export function getClosestValidFontScale(fontScale: number): number {
	fontScale = Number(fontScale) || 1;

	return VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b))[0];
}

export enum FontScaleCategory {
	ExtraSmall = 'extra-small',
	Medium = 'medium',
	ExtraLarge = 'extra-large',
}
