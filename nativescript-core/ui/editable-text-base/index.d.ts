import { TextBase } from '../text-base';
import { Color } from '../../color';
import { FormattedString } from '../text-base/formatted-string';
import { Style } from '../styling/style';
import { Property, CssProperty } from '../core/properties';
import { KeyboardType } from '../enums';

/**
 * Represents the base class for all editable text views.
 */
export class EditableTextBase extends TextBase {
	public static blurEvent: string;
	public static focusEvent: string;
	public static textChangeEvent: string;

	/**
	 * Gets or sets the soft keyboard type.
	 */
	keyboardType: KeyboardType;

	/**
	 * Gets or sets the soft keyboard return key flavor.
	 */
	returnKeyType: ReturnKeyType;

	/**
	 * Gets or sets a value indicating when the text property will be updated.
	 */
	updateTextTrigger: UpdateTextTrigger;

	/**
	 * Gets or sets the autocapitalization type.
	 */
	autocapitalizationType: AutocapitalizationType;

	/**
	 * Gets or sets whether the instance is editable.
	 */
	editable: boolean;

	/**
	 * Enables or disables autocorrection.
	 */
	autocorrect: boolean;

	/**
	 * Gets or sets the placeholder text.
	 */
	hint: string;

	/**
	 * Limits input to a certain number of characters.
	 */
	maxLength: number;

	/**
	 * Hides the soft input method, ususally a soft keyboard.
	 */
	dismissSoftInput(): void;

	//@private
	/**
	 * @private
	 */
	public _setInputType(inputType: number): void;
	//@endprivate
}

export type ReturnKeyType = 'done' | 'next' | 'go' | 'search' | 'send';
export type UpdateTextTrigger = 'focusLost' | 'textChanged';
export type AutocapitalizationType = 'none' | 'words' | 'sentences' | 'allcharacters';

export const keyboardTypeProperty: Property<EditableTextBase, KeyboardType>;
export const returnKeyTypeProperty: Property<EditableTextBase, ReturnKeyType>;
export const editableProperty: Property<EditableTextBase, boolean>;
export const updateTextTriggerProperty: Property<EditableTextBase, UpdateTextTrigger>;
export const autocapitalizationTypeProperty: Property<EditableTextBase, AutocapitalizationType>;
export const autocorrectProperty: Property<EditableTextBase, boolean>;
export const hintProperty: Property<EditableTextBase, string>;
export const placeholderColorProperty: CssProperty<Style, Color>;
export const maxLengthProperty: Property<EditableTextBase, number>;

//@private
/**
 * @private
 */
export function _updateCharactersInRangeReplacementString(formattedText: FormattedString, rangeLocation: number, rangeLength: number, replacementString: string): void;
//@endprivate
