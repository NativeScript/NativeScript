import { TextBase } from '../text-base';
import { Color } from '../../color';
import { FormattedString } from '../text-base/formatted-string';
import { Style } from '../styling/style';
import { Property, CssProperty } from '../core/properties';
import { CoreTypes } from '../../core-types';

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
	keyboardType: CoreTypes.KeyboardInputType;

	/**
	 * Gets or sets the soft keyboard return key flavor.
	 */
	returnKeyType: CoreTypes.ReturnKeyButtonType;

	/**
	 * Gets or sets a value indicating when the text property will be updated.
	 */
	updateTextTrigger: CoreTypes.UpdateTextTriggerType;

	/**
	 * Gets or sets the autocapitalization type.
	 */
	autocapitalizationType: CoreTypes.AutocapitalizationInputType;

	/**
	 * Gets or sets the autofill type.
	 */
	autofillType: CoreTypes.AutofillType;

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
	 * Format input values
	 * Note: useful for input masking/formatting
	 */
	valueFormatter: (value: string) => string;

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

	/**
	 * Set the selection anchor to start and the selection edge to stop
	 */
	public setSelection(start: number, stop?: number);
}

export const keyboardTypeProperty: Property<EditableTextBase, CoreTypes.KeyboardInputType>;
export const returnKeyTypeProperty: Property<EditableTextBase, CoreTypes.ReturnKeyButtonType>;
export const editableProperty: Property<EditableTextBase, boolean>;
export const updateTextTriggerProperty: Property<EditableTextBase, CoreTypes.UpdateTextTriggerType>;
export const autocapitalizationTypeProperty: Property<EditableTextBase, CoreTypes.AutocapitalizationInputType>;
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
