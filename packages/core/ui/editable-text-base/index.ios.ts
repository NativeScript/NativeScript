import { EditableTextBase as EditableTextBaseCommon, autofillTypeProperty, keyboardTypeProperty, returnKeyTypeProperty, autocapitalizationTypeProperty, autocorrectProperty } from './editable-text-base-common';
import { FormattedString } from '../text-base/formatted-string';
import { CoreTypes } from '../../core-types';

export * from './editable-text-base-common';

export abstract class EditableTextBase extends EditableTextBaseCommon {
	public nativeViewProtected: UITextField | UITextView;
	public readonly nativeTextViewProtected: UITextField | UITextView;
	public dismissSoftInput() {
		this.nativeTextViewProtected.resignFirstResponder();
		this.notify({ eventName: EditableTextBase.blurEvent, object: this });
	}

	[keyboardTypeProperty.getDefault](): 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer' | string {
		const keyboardType = this.nativeTextViewProtected.keyboardType;
		switch (keyboardType) {
			case UIKeyboardType.NumbersAndPunctuation:
				return 'number';

			case UIKeyboardType.PhonePad:
				return 'phone';

			case UIKeyboardType.URL:
				return 'url';

			case UIKeyboardType.EmailAddress:
				return 'email';

			case UIKeyboardType.NumberPad:
				return 'integer';

			default:
				return keyboardType.toString();
		}
	}
	[keyboardTypeProperty.setNative](value: 'datetime' | 'phone' | 'number' | 'decimal' | 'url' | 'email' | 'integer' | string) {
		let newKeyboardType: UIKeyboardType;
		switch (value) {
			case 'datetime':
				newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
				break;

			case 'phone':
				newKeyboardType = UIKeyboardType.PhonePad;
				break;

			case 'number':
				newKeyboardType = UIKeyboardType.NumbersAndPunctuation;
				break;

			case 'decimal':
				newKeyboardType = UIKeyboardType.DecimalPad;
				break;

			case 'url':
				newKeyboardType = UIKeyboardType.URL;
				break;
			case 'email':
				newKeyboardType = UIKeyboardType.EmailAddress;
				break;

			case 'integer':
				newKeyboardType = UIKeyboardType.NumberPad;
				break;

			default: {
				const kt = +value;
				if (!isNaN(kt)) {
					newKeyboardType = <UIKeyboardType>kt;
				} else {
					newKeyboardType = UIKeyboardType.Default;
				}
				break;
			}
		}

		this.nativeTextViewProtected.keyboardType = newKeyboardType;
	}
	[autofillTypeProperty.setNative](value: CoreTypes.AutofillType) {
		let newTextContentType: string;
		switch (value) {
			case 'phone':
				newTextContentType = UITextContentTypeTelephoneNumber;
				break;
			case 'postalCode':
				newTextContentType = UITextContentTypePostalCode;
				break;
			case 'creditCardNumber':
				newTextContentType = UITextContentTypeCreditCardNumber;
				break;
			case 'email':
				newTextContentType = UITextContentTypeEmailAddress;
				break;
			case 'name':
				newTextContentType = UITextContentTypeName;
				break;
			case 'username':
				newTextContentType = UITextContentTypeUsername;
				break;
			case 'password':
				newTextContentType = UITextContentTypePassword;
				break;
			case 'newPassword':
				newTextContentType = UITextContentTypeNewPassword;
				break;
			case 'oneTimeCode':
				newTextContentType = UITextContentTypeOneTimeCode;
				break;
			case 'none':
				newTextContentType = null;
				break;
			default: {
				newTextContentType = value;
				break;
			}
		}

		this.nativeTextViewProtected.textContentType = newTextContentType;
	}

	[returnKeyTypeProperty.getDefault](): 'done' | 'next' | 'go' | 'search' | 'send' | string {
		const returnKeyType = this.nativeTextViewProtected.returnKeyType;
		switch (returnKeyType) {
			case UIReturnKeyType.Done:
				return 'done';

			case UIReturnKeyType.Go:
				return 'go';

			case UIReturnKeyType.Next:
				return 'next';

			case UIReturnKeyType.Search:
				return 'search';

			case UIReturnKeyType.Send:
				return 'send';

			default:
				return returnKeyType.toString();
		}
	}
	[returnKeyTypeProperty.setNative](value: 'done' | 'next' | 'go' | 'search' | 'send' | string) {
		let newValue;
		switch (value) {
			case 'done':
				newValue = UIReturnKeyType.Done;
				break;
			case 'go':
				newValue = UIReturnKeyType.Go;
				break;
			case 'next':
				newValue = UIReturnKeyType.Next;
				break;
			case 'search':
				newValue = UIReturnKeyType.Search;
				break;
			case 'send':
				newValue = UIReturnKeyType.Send;
				break;
			default: {
				const rkt = +value;
				if (!isNaN(rkt)) {
					newValue = <UIKeyboardType>rkt;
				} else {
					newValue = UIKeyboardType.Default;
				}
				break;
			}
		}

		this.nativeTextViewProtected.returnKeyType = newValue;
	}

	[autocapitalizationTypeProperty.getDefault](): 'none' | 'words' | 'sentences' | 'allcharacters' {
		const autocapitalizationType = this.nativeTextViewProtected.autocapitalizationType;
		switch (autocapitalizationType) {
			case UITextAutocapitalizationType.None:
				return 'none';

			case UITextAutocapitalizationType.Words:
				return 'words';

			case UITextAutocapitalizationType.Sentences:
				return 'sentences';

			case UITextAutocapitalizationType.AllCharacters:
				return 'allcharacters';

			default:
				throw new Error('Invalid autocapitalizationType value:' + autocapitalizationType);
		}
	}
	[autocapitalizationTypeProperty.setNative](value: 'none' | 'words' | 'sentences' | 'allcharacters') {
		let newValue: UITextAutocapitalizationType;
		switch (value) {
			case 'none':
				newValue = UITextAutocapitalizationType.None;
				break;
			case 'words':
				newValue = UITextAutocapitalizationType.Words;
				break;
			case 'sentences':
				newValue = UITextAutocapitalizationType.Sentences;
				break;
			case 'allcharacters':
				newValue = UITextAutocapitalizationType.AllCharacters;
				break;
			default:
				newValue = UITextAutocapitalizationType.Sentences;
				break;
		}

		this.nativeTextViewProtected.autocapitalizationType = newValue;
	}

	[autocorrectProperty.getDefault](): boolean | number {
		const autocorrectionType = this.nativeTextViewProtected.autocorrectionType;
		switch (autocorrectionType) {
			case UITextAutocorrectionType.Yes:
				return true;
			case UITextAutocorrectionType.No:
				return false;
			case UITextAutocorrectionType.Default:
				return autocorrectionType;
		}
	}
	[autocorrectProperty.setNative](value: boolean | number) {
		let newValue: UITextAutocorrectionType;
		let spelling: UITextSpellCheckingType;

		if (typeof value === 'number') {
			newValue = UITextAutocorrectionType.Default;
			spelling = UITextSpellCheckingType.Default;
		} else if (value) {
			newValue = UITextAutocorrectionType.Yes;
			spelling = UITextSpellCheckingType.Yes;
		} else {
			newValue = UITextAutocorrectionType.No;
			spelling = UITextSpellCheckingType.No;
		}

		this.nativeTextViewProtected.autocorrectionType = newValue;
		this.nativeTextViewProtected.spellCheckingType = spelling;
	}
	public setSelection(start: number, stop?: number) {
		const view = this.nativeTextViewProtected;
		if (view) {
			if (stop !== undefined) {
				const begin = view.beginningOfDocument;
				const fromPosition = view.positionFromPositionOffset(begin, start);
				const toPosition = view.positionFromPositionOffset(begin, stop);
				view.selectedTextRange = view.textRangeFromPositionToPosition(fromPosition, toPosition);
			} else {
				const begin = view.beginningOfDocument;
				const pos = view.positionFromPositionOffset(begin, start);
				view.selectedTextRange = view.textRangeFromPositionToPosition(pos, pos);
			}
		}
	}
}

export function _updateCharactersInRangeReplacementString(formattedText: FormattedString, rangeLocation: number, rangeLength: number, replacementString: string): void {
	const deletingText = !replacementString;
	let currentLocation = 0;
	for (let i = 0, length = formattedText.spans.length; i < length; i++) {
		const span = formattedText.spans.getItem(i);
		if (currentLocation <= rangeLocation && rangeLocation < currentLocation + span.text.length) {
			const newText = splice(span.text, rangeLocation - currentLocation, deletingText ? rangeLength : 0, replacementString);
			span._setTextInternal(newText);

			return;
		}
		currentLocation += span.text.length;
	}
}

/*
 * @param {String} value The string to splice.
 * @param {number} start Index at which to start changing the string.
 * @param {number} delCount An integer indicating the number of old chars to remove.
 * @param {string} newSubStr The String that is spliced in.
 * @return {string} A new string with the spliced substring.function splice(value: string, start: number, delCount: number, newSubStr: string) {
 */
function splice(value: string, start: number, delCount: number, newSubStr: string) {
	return value.slice(0, start) + newSubStr + value.slice(start + Math.abs(delCount));
}
