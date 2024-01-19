import { TextFieldBase, secureProperty } from './text-field-common';
import { whiteSpaceProperty } from '../text-base';
import { keyboardTypeProperty } from '../editable-text-base';
import { CoreTypes } from '../../core-types';

export * from './text-field-common';

export class TextField extends TextFieldBase {
	nativeViewProtected: android.widget.EditText;

	private _pendingTransformationMethod: android.text.method.TransformationMethod;

	public _configureEditText(editText: android.widget.EditText) {
		editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
		editText.setLines(1);
		editText.setMaxLines(1);
		editText.setHorizontallyScrolling(true);
	}

	public _onReturnPress() {
		this.notify({ eventName: TextField.returnPressEvent, object: this });
	}

	public disposeNativeView(): void {
		this._pendingTransformationMethod = null;
		super.disposeNativeView();
	}

	_getNativeTextTransform(value: CoreTypes.TextTransformType): android.text.method.TransformationMethod {
		const transformationMethod = super._getNativeTextTransform(value);

		if (this.secure) {
			this._pendingTransformationMethod = transformationMethod;
			return null;
		}

		return transformationMethod;
	}

	setSecureAndKeyboardType(): void {
		let inputType: number;

		const nativeView = this.nativeTextViewProtected;
		const numericKeyboardType = +this.keyboardType;

		// Check for a passed in numeric value
		if (typeof this.keyboardType !== 'boolean' && !isNaN(numericKeyboardType)) {
			inputType = numericKeyboardType;
		} else if (this.secure) {
			// Password variations are supported only for Text and Number classes
			if (this.keyboardType === 'number') {
				inputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
			} else {
				inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD;
			}

			this._pendingTransformationMethod = nativeView.getTransformationMethod();
		} else {
			// Default
			inputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;

			// Add autocorrect flags
			if (this.autocorrect) {
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
				inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
			}

			// Add autocapitalization type
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

			// Add keyboardType flags (they override previous if set)
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

		// Restore text transformation when secure is set back to false
		// This also takes care of transformation issues when toggling secure while view is not editable
		if (!this.secure && this._pendingTransformationMethod) {
			if (this._pendingTransformationMethod != nativeView.getTransformationMethod()) {
				nativeView.setTransformationMethod(this._pendingTransformationMethod);
			}
			this._pendingTransformationMethod = null;
		}
	}

	[secureProperty.setNative]() {
		this.setSecureAndKeyboardType();
	}

	[keyboardTypeProperty.setNative]() {
		this.setSecureAndKeyboardType();
	}

	[whiteSpaceProperty.getDefault](): CoreTypes.WhiteSpaceType {
		return 'nowrap';
	}
	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		// Don't change it otherwise TextField will go to multiline mode.
	}
}

TextField.prototype._isSingleLine = true;
