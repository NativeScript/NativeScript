import { TextFieldBase, secureProperty } from './text-field-common';
import { whiteSpaceProperty, WhiteSpace } from '../text-base';
import { keyboardTypeProperty } from '../editable-text-base';

export * from './text-field-common';

export class TextField extends TextFieldBase {
	public _configureEditText(editText: android.widget.EditText) {
		editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
		editText.setLines(1);
		editText.setMaxLines(1);
		editText.setHorizontallyScrolling(true);
	}

	public _onReturnPress() {
		this.notify({ eventName: TextField.returnPressEvent, object: this });
	}

	[secureProperty.setNative]() {
		this.setSecureAndKeyboardType();
	}

	[keyboardTypeProperty.setNative]() {
		this.setSecureAndKeyboardType();
	}

	setSecureAndKeyboardType(): void {
		let inputType: number;

		// Password variations are supported only for Text and Number classes.
		if (this.secure) {
			if (this.keyboardType === 'number') {
				inputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
			} else {
				inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD;
			}
		} else {
			// default
			inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;

			// add autocorrect flags
			if (this.autocorrect) {
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
				inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
			}

			// add autocapitalization type
			switch (this.autocapitalizationType) {
				case 'words':
					inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00020000) 14th bit
					break;
				case 'sentences':
					inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00040000) 15th bit
					break;
				case 'allcharacters':
					inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS; //4096 (0x00010000) 13th bit
					break;
				default:
					break;
			}

			// add keyboardType flags.
			// They override previous if set.
			switch (this.keyboardType) {
				case 'datetime':
					inputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
					break;
				case 'phone':
					inputType = android.text.InputType.TYPE_CLASS_PHONE;
					break;
				case 'number':
					inputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
					break;
				case 'url':
					inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
					break;
				case 'email':
					inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
					break;
				case 'integer':
					inputType = android.text.InputType.TYPE_CLASS_NUMBER;
					break;
				default:
					break;
			}
		}

		this._setInputType(inputType);
	}

	[whiteSpaceProperty.getDefault](): WhiteSpace {
		return 'nowrap';
	}
	[whiteSpaceProperty.setNative](value: WhiteSpace) {
		// Don't change it otherwise TextField will go to multiline mode.
	}
}

TextField.prototype._isSingleLine = true;
