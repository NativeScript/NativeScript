export const VALID_FONT_SCALES: number[];
export function getCurrentFontScale(): number;
export enum FontScaleCategory {
	ExtraSmall = 'extra-small',
	Medium = 'medium',
	ExtraLarge = 'extra-large',
}
export function getFontScaleCategory(): FontScaleCategory;
export function initAccessibilityFontScale(): void;
