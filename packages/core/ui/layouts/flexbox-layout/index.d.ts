import { LayoutBase } from '../layout-base';
import { Style } from '../../styling/style';
import { CssProperty } from '../../core/properties';
import { View } from '../../core/view';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';

/**
 * A flex order integer.
 */
export type Order = number;

/**
 * A flex-grow number. Negative values are invalid.
 */
export type FlexGrow = number;

/**
 * A flex-shrink number. Negative values are invalid.
 */
export type FlexShrink = number;

/**
 * A flex-wrap-before value. True, false or their string presentations "true" or "false".
 */
export type FlexWrapBefore = boolean;

export type AlignSelf = 'auto' | AlignItems;

export class FlexboxLayout extends LayoutBase {
	public flexDirection: FlexDirection;
	public flexWrap: FlexWrap;
	public justifyContent: JustifyContent;
	public alignItems: AlignItems;
	public alignContent: AlignContent;

	public static setOrder(view: View, order: number);
	public static getOrder(view: View): number;

	public static setFlexGrow(view: View, grow: number);
	public static getFlexGrow(view: View);

	public static setFlexShrink(view: View, shrink: number);
	public static getFlexShrink(view: View): number;

	public static setAlignSelf(view: View, align: AlignSelf);
	public static getAlignSelf(view: View): AlignSelf;

	public static setFlexWrapBefore(view: View, wrap: boolean);
	public static getFlexWrapBefore(view: View): boolean;
}

export const flexDirectionProperty: CssProperty<Style, FlexDirection>;
export const flexWrapProperty: CssProperty<Style, FlexWrap>;
export const justifyContentProperty: CssProperty<Style, JustifyContent>;
export const alignItemsProperty: CssProperty<Style, AlignItems>;

export const orderProperty: CssProperty<Style, Order>;
export const flexGrowProperty: CssProperty<Style, FlexGrow>;
export const flexShrinkProperty: CssProperty<Style, FlexShrink>;
export const flexWrapBeforeProperty: CssProperty<Style, FlexWrapBefore>;
export const alignSelfProperty: CssProperty<Style, AlignSelf>;
