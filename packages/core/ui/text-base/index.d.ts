import { View, AddChildFromBuilder } from '../core/view';
import { FormattedString } from './formatted-string';
import { Style } from '../styling/style';
import { Length } from '../styling/style-properties';
import { Property, CssProperty, InheritedCssProperty } from '../core/properties';
import { CoreTypes } from '../../core-types';
import { ShadowCSSValues } from '../styling/css-shadow';
import { StrokeCSSValues } from '../styling/css-stroke';

export class TextBase extends View implements AddChildFromBuilder {
	/**
	 * Gets of the text widget. In some cases(android TextInputLayout) the TextView is made of 2 views: the layout and the text view
	 * So we need a different getter for the layout and text functions
	 */
	public readonly nativeTextViewProtected: any;

	/**
	 * Gets or sets the text.
	 */
	text: string;

	/**
	 * Gets or sets a formatted string.
	 */
	formattedText: FormattedString;

	/**
	 * Gets or sets font-size style property.
	 */
	fontSize: number;

	/**
	 * Gets or sets letterSpace style property.
	 */
	letterSpacing: number;

	/**
	 * Gets or sets lineHeight style property.
	 */
	lineHeight: number;

	/**
	 * Gets or sets text-alignment style property.
	 */
	textAlignment: CoreTypes.TextAlignmentType;

	/**
	 * Gets or sets text decorations style property.
	 */
	textDecoration: CoreTypes.TextDecorationType;

	/**
	 * Gets or sets text transform style property.
	 */
	textTransform: CoreTypes.TextTransformType;

	/**
	 * Gets or sets text shadow style property.
	 */
	textShadow: ShadowCSSValues;

	/**
	 * Gets or sets white space style property.
	 */
	whiteSpace: CoreTypes.WhiteSpaceType;

	/**
	 * Gets or sets text-overflow style property.
	 */
	textOverflow: CoreTypes.TextOverflowType;

	/**
	 * Gets or sets white space style property.
	 */
	maxLines: CoreTypes.MaxLinesType;

	/**
	 * Gets or sets padding style property.
	 */
	padding: string | CoreTypes.LengthType;

	/**
	 * Specify the bottom padding of this layout.
	 */
	paddingBottom: CoreTypes.LengthType;

	/**
	 * Specify the left padding of this layout.
	 */
	paddingLeft: CoreTypes.LengthType;

	/**
	 * Specify the right padding of this layout.
	 */
	paddingRight: CoreTypes.LengthType;

	/**
	 * Specify the top padding of this layout.
	 */
	paddingTop: CoreTypes.LengthType;

	/**
	 * Specify wether the native text should be applied with or without animations
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
export const textTransformProperty: CssProperty<Style, CoreTypes.TextTransformType>;
export const textShadowProperty: CssProperty<Style, ShadowCSSValues>;
export const textStrokeProperty: CssProperty<Style, StrokeCSSValues>;
export const whiteSpaceProperty: CssProperty<Style, CoreTypes.WhiteSpaceType>;
export const textOverflowProperty: CssProperty<Style, CoreTypes.TextOverflowType>;
export const letterSpacingProperty: CssProperty<Style, number>;
export const lineHeightProperty: CssProperty<Style, number>;

//Used by tab view
export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string;

export const resetSymbol: symbol;
