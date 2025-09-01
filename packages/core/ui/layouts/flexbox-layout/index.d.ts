import { LayoutBase } from '../layout-base';
import { Style } from '../../styling/style';
import { CssProperty } from '../../core/properties';
import { View } from '../../core/view';
import { CoreTypes } from '../../enums';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
export type FlexFlow = `${FlexDirection} ${FlexWrap}`;
export type Flex = number | 'auto' | 'none' | `${FlexGrow} ${FlexShrink}` | CoreTypes.CSSWideKeywords;

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

/**
 * @nsView FlexboxLayout
 */
export class FlexboxLayout extends LayoutBase {
	/**
	 * Gets or set the direction of childern on the main axis.
	 *
	 * @nsProperty
	 */
	public flexDirection: FlexDirection;
	/**
	 * Gets or sets whether children can wrap into multiple lines
	 *
	 * @nsProperty
	 */
	public flexWrap: FlexWrap;
	/**
	 * Gets or sets alignment of childern on the main axis
	 *
	 * @nsProperty
	 */
	public justifyContent: JustifyContent;
	/**
	 * Gets or sets alignment of the childern on cross axis
	 *
	 * @nsProperty
	 */
	public alignItems: AlignItems;
	/**
	 * Gets or sets alignment of items along the cross axis
	 *
	 * @nsProperty
	 */
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
export const flexFlowProperty: CssProperty<Style, FlexFlow>;
export const flexProperty: CssProperty<Style, Flex>;
