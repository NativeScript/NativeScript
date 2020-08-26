import { TransformFunctionsInfo } from '../animation';
import { Color } from '../../color';
import { CssProperty, CssAnimationProperty, ShorthandProperty, InheritedCssProperty } from '../core/properties';
import { Style } from '../styling/style';
import { Font, FontStyle, FontWeight } from './font';
import { Background } from './background';
import { dip, px, percent } from '../core/view';

export type LengthDipUnit = { readonly unit: 'dip'; readonly value: dip };
export type LengthPxUnit = { readonly unit: 'px'; readonly value: px };
export type LengthPercentUnit = { readonly unit: '%'; readonly value: percent };

export type Length = 'auto' | dip | LengthDipUnit | LengthPxUnit;
export type PercentLength = 'auto' | dip | LengthDipUnit | LengthPxUnit | LengthPercentUnit;

export namespace Length {
	export function parse(text: string): Length;
	export function equals(a: Length, b: Length): boolean;
	/**
	 * Converts Length unit to device pixels.
	 * @param length The Length to convert.
	 * @param auto Value to use for conversion of "auto". By default is Math.NaN.
	 */
	export function toDevicePixels(length: Length, auto?: number): number;
	export function convertToString(length: Length): string;
}

export namespace PercentLength {
	export function parse(text: string): PercentLength;
	export function equals(a: PercentLength, b: PercentLength): boolean;
	/**
	 * Converts PercentLength unit to device pixels.
	 * @param length The PercentLength to convert.
	 * @param auto Value to use for conversion of "auto". By default is Math.NaN.
	 * @param parentAvailableWidth Value to use as base when converting percent unit. By default is Math.NaN.
	 */
	export function toDevicePixels(length: PercentLength, auto?: number, parentAvailableWidth?: px): number;
	export function convertToString(length: PercentLength): string;
}

export const zeroLength: Length;

export const rotateProperty: CssAnimationProperty<Style, number>;
export const scaleXProperty: CssAnimationProperty<Style, number>;
export const scaleYProperty: CssAnimationProperty<Style, number>;
export const translateXProperty: CssAnimationProperty<Style, dip>;
export const translateYProperty: CssAnimationProperty<Style, dip>;

export function transformConverter(text: string): TransformFunctionsInfo;

export const clipPathProperty: CssProperty<Style, string>;
export const colorProperty: InheritedCssProperty<Style, Color>;

export const backgroundProperty: ShorthandProperty<Style, string>;
export const backgroundColorProperty: CssAnimationProperty<Style, Color>;
export const backgroundImageProperty: CssProperty<Style, string>;
export const backgroundRepeatProperty: CssProperty<Style, BackgroundRepeat>;
export const backgroundSizeProperty: CssProperty<Style, string>;
export const backgroundPositionProperty: CssProperty<Style, string>;

export const borderColorProperty: ShorthandProperty<Style, string | Color>;
export const borderTopColorProperty: CssProperty<Style, Color>;
export const borderRightColorProperty: CssProperty<Style, Color>;
export const borderBottomColorProperty: CssProperty<Style, Color>;
export const borderLeftColorProperty: CssProperty<Style, Color>;

export const borderWidthProperty: ShorthandProperty<Style, string | Length>;
export const borderTopWidthProperty: CssProperty<Style, Length>;
export const borderRightWidthProperty: CssProperty<Style, Length>;
export const borderBottomWidthProperty: CssProperty<Style, Length>;
export const borderLeftWidthProperty: CssProperty<Style, Length>;

export const borderRadiusProperty: ShorthandProperty<Style, string | Length>;
export const borderTopLeftRadiusProperty: CssProperty<Style, Length>;
export const borderTopRightRadiusProperty: CssProperty<Style, Length>;
export const borderBottomRightRadiusProperty: CssProperty<Style, Length>;
export const borderBottomLeftRadiusProperty: CssProperty<Style, Length>;

export const zIndexProperty: CssProperty<Style, number>;
export const visibilityProperty: CssProperty<Style, Visibility>;
export const opacityProperty: CssAnimationProperty<Style, number>;

export const minWidthProperty: CssProperty<Style, dip | LengthDipUnit | LengthPxUnit>;
export const minHeightProperty: CssProperty<Style, dip | LengthDipUnit | LengthPxUnit>;
export const widthProperty: CssAnimationProperty<Style, PercentLength>;
export const heightProperty: CssAnimationProperty<Style, PercentLength>;
export const lineHeightProperty: CssProperty<Style, number>;
export const marginProperty: ShorthandProperty<Style, string | PercentLength>;
export const marginLeftProperty: CssProperty<Style, PercentLength>;
export const marginRightProperty: CssProperty<Style, PercentLength>;
export const marginTopProperty: CssProperty<Style, PercentLength>;
export const marginBottomProperty: CssProperty<Style, PercentLength>;

export const paddingProperty: ShorthandProperty<Style, string | Length>;
export const paddingLeftProperty: CssProperty<Style, Length>;
export const paddingRightProperty: CssProperty<Style, Length>;
export const paddingTopProperty: CssProperty<Style, Length>;
export const paddingBottomProperty: CssProperty<Style, Length>;

export const horizontalAlignmentProperty: CssProperty<Style, HorizontalAlignment>;
export const verticalAlignmentProperty: CssProperty<Style, VerticalAlignment>;

export const fontSizeProperty: InheritedCssProperty<Style, number>;
export const fontFamilyProperty: InheritedCssProperty<Style, string>;
export const fontStyleProperty: InheritedCssProperty<Style, FontStyle>;
export const fontWeightProperty: InheritedCssProperty<Style, FontWeight>;

export const backgroundInternalProperty: CssProperty<Style, Background>;
export const fontInternalProperty: InheritedCssProperty<Style, Font>;

export const androidElevationProperty: CssProperty<Style, number>;
export const androidDynamicElevationOffsetProperty: CssProperty<Style, number>;

export type BackgroundRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
export type Visibility = 'visible' | 'hidden' | 'collapse';
export type HorizontalAlignment = 'left' | 'center' | 'right' | 'stretch';
export namespace HorizontalAlignment {
	export const LEFT: 'left';
	export const CENTER: 'center';
	export const RIGHT: 'right';
	export const STRETCH: 'stretch';
}
export type VerticalAlignment = 'top' | 'middle' | 'bottom' | 'stretch' | 'text-top' | 'text-bottom' | 'super' | 'sub' | 'baseline';
export namespace VerticalAlignment {
	export const TOP: 'top';
	export const MIDDLE: 'middle';
	export const BOTTOM: 'bottom';
	export const STRETCH: 'stretch';
	export const TEXTTOP: 'text-top';
	export const TEXTBOTTOM: 'text-bottom';
	export const SUPER: 'super';
	export const SUB: 'sub';
	export const BASELINE: 'baseline';
}
