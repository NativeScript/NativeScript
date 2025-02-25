import { View, AddChildFromBuilder } from '../core/view';
import { FormattedString } from './formatted-string';
import { Style } from '../styling/style';
import { Length } from '../styling/style-properties';
import { Property, CssProperty, InheritedCssProperty } from '../core/properties';
import { CoreTypes } from '../../core-types';
import { ShadowCSSValues } from '../styling/css-shadow';
import { StrokeCSSValues } from '../styling/css-stroke';
import { FontStyleType, FontWeightType } from '../styling/font-interfaces';

/**
 * @nsView TextBase
 */
export class TextBase extends View implements AddChildFromBuilder {
	/**
	 * Gets of the text widget. In some cases(android TextInputLayout) the TextView is made of 2 views: the layout and the text view
	 * So we need a different getter for the layout and text functions
	 */
	public readonly nativeTextViewProtected: any;

	/**
	 * Gets or sets the text.
	 *
	 * @nsProperty
	 */
	text: string;

	/**
	 * Gets or sets a formatted string.
	 *
	 * @nsProperty
	 */
	formattedText: FormattedString;

	/**
	 * Gets or sets font-family style property.
	 *
	 * @nsProperty
	 */
	fontFamily: string;

	/**
	 * Gets or sets font-size style property.
	 *
	 * @nsProperty
	 */
	fontSize: number;

	/**
	 * Gets or sets font-style style property.
	 *
	 * @nsProperty
	 */
	fontStyle: FontStyleType;

	/**
	 * Gets or sets font-weight style property.
	 *
	 * @nsProperty
	 */
	fontWeight: FontWeightType;

	/**
	 * Gets or sets letterSpace style property.
	 *
	 * @nsProperty
	 */
	letterSpacing: number;

	/**
	 * Gets or sets lineHeight style property.
	 *
	 * @nsProperty
	 */
	lineHeight: number;

	/**
	 * Gets or sets text-alignment style property.
	 *
	 * @nsProperty
	 */
	textAlignment: CoreTypes.TextAlignmentType;

	/**
	 * Gets or sets text decorations style property.
	 *
	 * @nsProperty
	 */
	textDecoration: CoreTypes.TextDecorationType;

	/**
	 * Gets or sets text transform style property.
	 *
	 * @nsProperty
	 */
	textTransform: CoreTypes.TextTransformType;

	/**
	 * Gets or sets text shadow style property.
	 *
	 * @nsProperty
	 */
	textShadow: ShadowCSSValues;

	/**
	 * Gets or sets text stroke style property.
	 *
	 * @nsProperty
	 */

	textStroke: StrokeCSSValues;

	/**
	 * Gets or sets white space style property.
	 *
	 * @nsProperty
	 */
	whiteSpace: CoreTypes.WhiteSpaceType;

	/**
	 * Gets or sets text-overflow style property.
	 *
	 * @nsProperty
	 */
	textOverflow: CoreTypes.TextOverflowType;

	/**
	 * Gets or sets white space style property.
	 *
	 * @nsProperty
	 */
	maxLines: CoreTypes.MaxLinesType;

	/**
	 * Gets or sets padding style property.
	 *
	 * @nsProperty
	 */
	padding: string | CoreTypes.LengthType;

	/**
	 * Specify the bottom padding of this layout.
	 *
	 * @nsProperty
	 */
	paddingBottom: CoreTypes.LengthType;

	/**
	 * Specify the left padding of this layout.
	 *
	 * @nsProperty
	 */
	paddingLeft: CoreTypes.LengthType;

	/**
	 * Specify the right padding of this layout.
	 *
	 * @nsProperty
	 */
	paddingRight: CoreTypes.LengthType;

	/**
	 * Specify the top padding of this layout.
	 *
	 * @nsProperty
	 */
	paddingTop: CoreTypes.LengthType;

	/**
	 * Specify wether the native text should be applied with or without animations
	 *
	 * @nsProperty
	 */
	iosTextAnimation: 'inherit' | boolean;

	/**
	 * The value used when the iosTextAnimation is set to 'inherit'
	 */
	static iosTextAnimationFallback: boolean;

	/**
	 * Called for every child element declared in xml.
	 * This method will add a child element (value) to current element.
	 * @private
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	_addChildFromBuilder(name: string, value: any): void;

	//@private
	/**
	 * Called when the text property is changed to request layout.
	 * @private
	 */
	_requestLayoutOnTextChanged(): void;

	/**
	 * @private
	 */
	_setNativeText(reset?: boolean): void;

	/**
	 * @private
	 */
	_isSingleLine: boolean;
	//@endprivate
}

export interface TextTransformation {
	new (owner: TextBase): any /* android.text.method.TransformationMethod */;
}

export const textProperty: Property<TextBase, string>;
export const formattedTextProperty: Property<TextBase, FormattedString>;

export const maxLinesProperty: InheritedCssProperty<Style, number>;
export const textAlignmentProperty: InheritedCssProperty<Style, CoreTypes.TextAlignmentType>;
export const textDecorationProperty: CssProperty<Style, CoreTypes.TextDecorationType>;
export const textTransformProperty: InheritedCssProperty<Style, CoreTypes.TextTransformType>;
export const textShadowProperty: InheritedCssProperty<Style, ShadowCSSValues>;
export const textStrokeProperty: InheritedCssProperty<Style, StrokeCSSValues>;
export const whiteSpaceProperty: InheritedCssProperty<Style, CoreTypes.WhiteSpaceType>;
export const textOverflowProperty: CssProperty<Style, CoreTypes.TextOverflowType>;
export const letterSpacingProperty: InheritedCssProperty<Style, number>;
export const lineHeightProperty: InheritedCssProperty<Style, number>;

// Used by tab view
export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string;

export const resetSymbol: symbol;
