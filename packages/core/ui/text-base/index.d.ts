import { View, AddChildFromBuilder } from '../core/view';
import { FormattedString } from './formatted-string';
import { Style } from '../styling/style';
import { Length } from '../styling/style-properties';
import { Property, CssProperty, InheritedCssProperty } from '../core/properties';

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
	textAlignment: TextAlignment;

	/**
	 * Gets or sets text decorations style property.
	 */
	textDecoration: TextDecoration;

	/**
	 * Gets or sets text transform style property.
	 */
	textTransform: TextTransform;

	/**
	 * Gets or sets white space style property.
	 */
	whiteSpace: WhiteSpace;

	/**
	 * Gets or sets padding style property.
	 */
	padding: string | Length;

	/**
	 * Specify the bottom padding of this layout.
	 */
	paddingBottom: Length;

	/**
	 * Specify the left padding of this layout.
	 */
	paddingLeft: Length;

	/**
	 * Specify the right padding of this layout.
	 */
	paddingRight: Length;

	/**
	 * Specify the top padding of this layout.
	 */
	paddingTop: Length;

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

export type WhiteSpace = 'initial' | 'normal' | 'nowrap';
export type TextAlignment = 'initial' | 'left' | 'center' | 'right';
export type TextTransform = 'initial' | 'none' | 'capitalize' | 'uppercase' | 'lowercase';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'underline line-through';

export const textAlignmentProperty: InheritedCssProperty<Style, TextAlignment>;
export const textDecorationProperty: CssProperty<Style, TextDecoration>;
export const textTransformProperty: CssProperty<Style, TextTransform>;
export const whiteSpaceProperty: CssProperty<Style, WhiteSpace>;
export const letterSpacingProperty: CssProperty<Style, number>;
export const lineHeightProperty: CssProperty<Style, number>;

//Used by tab view
export function getTransformedText(text: string, textTransform: TextTransform): string;

export const resetSymbol: symbol;
