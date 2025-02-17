import { EditableTextBase as EditableTextBaseCommon, autofillTypeProperty, keyboardTypeProperty, returnKeyTypeProperty, editableProperty, autocapitalizationTypeProperty, autocorrectProperty, hintProperty, placeholderColorProperty, maxLengthProperty } from './editable-text-base-common';
import { textTransformProperty, textProperty, resetSymbol } from '../text-base';
import { Color } from '../../color';
import { ad } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { CoreTypes } from '../../core-types';
import * as timer from '../../timer';

export * from './editable-text-base-common';

//https://github.com/NativeScript/NativeScript/issues/2942
export let dismissKeyboardTimeoutId: number;

interface EditTextListeners extends android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener {}

interface EditTextListenersClass {
	prototype: EditTextListeners;
	new (owner: WeakRef<EditableTextBase>): EditTextListeners;
}

let EditTextListeners: EditTextListenersClass;

function clearDismissTimer(): void {
	if (dismissKeyboardTimeoutId) {
		clearTimeout(dismissKeyboardTimeoutId);
		dismissKeyboardTimeoutId = null;
	}
}

function dismissSoftInput(view: EditableTextBase): void {
	clearDismissTimer();
	if (!dismissKeyboardTimeoutId) {
		dismissKeyboardTimeoutId = timer.setTimeout(() => {
			const activity = view._context as androidx.appcompat.app.AppCompatActivity;
			dismissKeyboardTimeoutId = null;
			const focused = activity && activity.getCurrentFocus();
			if (focused && !(focused instanceof android.widget.EditText)) {
				// warning `ad.dismissSoftInput` will actually focus the next view
				// if we pass a null parameter!!!
				// => focus and show keyboard again
				// the fix was for where there were multiple TextField for which it would work!
				// with this it will still work without breaking for single TextField
				ad.dismissSoftInput(focused);
			}
		}, 10);
	}
}
function initializeEditTextListeners(): void {
	if (EditTextListeners) {
		return;
	}

	@NativeClass
	@Interfaces([android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener])
	class EditTextListenersImpl extends java.lang.Object implements android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener {
		constructor(private owner: WeakRef<EditableTextBase>) {
			super();

			return global.__native(this);
		}

		public beforeTextChanged(text: string, start: number, count: number, after: number): void {
			this.owner?.get()?.beforeTextChanged(text, start, count, after);
		}

		public onTextChanged(text: string, start: number, before: number, count: number): void {
			this.owner?.get()?.onTextChanged(text, start, before, count);
		}

		public afterTextChanged(editable: android.text.Editable): void {
			this.owner?.get()?.afterTextChanged(editable);
		}

		public onFocusChange(view: android.view.View, hasFocus: boolean): void {
			this.owner?.get()?.onFocusChange(view, hasFocus);
		}

		public onEditorAction(textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
			return this.owner?.get()?.onEditorAction(textView, actionId, event) || false;
		}
	}

	EditTextListeners = EditTextListenersImpl;
}

export abstract class EditableTextBase extends EditableTextBaseCommon {
	nativeViewProtected: android.widget.EditText;
	nativeTextViewProtected: android.widget.EditText;

	private _dirtyTextAccumulator: string;
	private _keyListenerCache: android.text.method.KeyListener;
	private _inputType: number;

	public _changeFromCode: boolean;

	public abstract _configureEditText(editText: android.widget.EditText): void;

	public _onReturnPress(): void {
		//
	}

	public createNativeView() {
		return new android.widget.EditText(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const editText = this.nativeTextViewProtected;
		this._configureEditText(editText);
		initializeEditTextListeners();
		const listeners = new EditTextListeners(new WeakRef(this));
		editText.addTextChangedListener(listeners);
		editText.setOnFocusChangeListener(listeners);
		editText.setOnEditorActionListener(listeners);
		(<any>editText).listener = listeners;
		this._inputType = editText.getInputType();
	}

	public disposeNativeView(): void {
		const editText = this.nativeTextViewProtected;

		editText.removeTextChangedListener((<any>editText).listener);
		editText.setOnFocusChangeListener(null);
		editText.setOnEditorActionListener(null);
		(<any>editText).listener.owner = null;
		(<any>editText).listener = null;
		this._keyListenerCache = null;
		this._dirtyTextAccumulator = undefined;
		this._inputType = 0;

		super.disposeNativeView();
	}

	public resetNativeView(): void {
		super.resetNativeView();
		this.nativeTextViewProtected.setInputType(this._inputType);
	}

	public onUnloaded() {
		this.dismissSoftInput();
		super.onUnloaded();
	}

	public dismissSoftInput() {
		const nativeView = this.nativeTextViewProtected;
		if (!nativeView) {
			return;
		}

		ad.dismissSoftInput(nativeView);
	}

	public focus(): boolean {
		const nativeView = this.nativeTextViewProtected;
		if (!nativeView) {
			return;
		}

		const result = super.focus();
		if (result) {
			ad.showSoftInput(this.nativeTextViewProtected);
		}

		return result;
	}

	public _setInputType(inputType: number): void {
		const nativeView = this.nativeTextViewProtected;
		try {
			this._changeFromCode = true;
			nativeView.setInputType(parseInt(<any>inputType, 10));
		} finally {
			this._changeFromCode = false;
		}

		// setInputType will change the keyListener so we should cache it again
		const listener = nativeView.getKeyListener();
		if (listener) {
			this._keyListenerCache = listener;
		}

		// clear these fields instead of clearing listener.
		// this allows input Type to be changed even after editable is false.
		if (!this.editable) {
			nativeView.setFocusable(false);
			nativeView.setFocusableInTouchMode(false);
			nativeView.setLongClickable(false);
			nativeView.setClickable(false);
		}
	}

	[textProperty.getDefault](): number | symbol {
		return resetSymbol;
	}
	[textProperty.setNative](value: string | number | symbol) {
		try {
			this._changeFromCode = true;
			this._setNativeText(value === resetSymbol);
		} finally {
			this._changeFromCode = false;
		}
	}

	[keyboardTypeProperty.getDefault](): number {
		return this.nativeTextViewProtected.getInputType();
	}
	[keyboardTypeProperty.setNative](value: 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer' | number) {
		let newInputType;

		switch (value) {
			case 'datetime':
				newInputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
				break;

			case 'phone':
				newInputType = android.text.InputType.TYPE_CLASS_PHONE;
				break;

			case 'number':
				newInputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
				break;

			case 'url':
				newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
				break;

			case 'email':
				newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
				break;

			case 'integer':
				newInputType = android.text.InputType.TYPE_CLASS_NUMBER;
				break;

			default: {
				const inputType = +value;
				if (!isNaN(inputType)) {
					newInputType = inputType;
				} else {
					newInputType = android.text.InputType.TYPE_CLASS_TEXT;
				}
				break;
			}
		}

		this._setInputType(newInputType);
	}

	[autofillTypeProperty.setNative](value: CoreTypes.AutofillType) {
		if (SDK_VERSION < 26) {
			return;
		}
		let newOptions;
		switch (value) {
			case 'phone':
				newOptions = 'phone'; // android.view.View.AUTOFILL_HINT_PHONE
				break;
			case 'postalCode':
				newOptions = 'postalCode'; // android.view.View.AUTOFILL_HINT_POSTAL_CODE
				break;
			case 'creditCardNumber':
				newOptions = 'creditCardNumber'; // android.view.View.AUTOFILL_HINT_CREDIT_CARD_NUMBER
				break;
			case 'email':
				newOptions = 'emailAddress'; // android.view.View.AUTOFILL_HINT_EMAIL_ADDRESS
				break;
			case 'name':
				newOptions = 'name'; // android.view.View.AUTOFILL_HINT_NAME
				break;
			case 'username':
				newOptions = 'username'; // android.view.View.AUTOFILL_HINT_USERNAME
				break;
			case 'password':
				newOptions = 'password'; // android.view.View.AUTOFILL_HINT_PASSWORD
				break;
			case 'newPassword':
				newOptions = 'newPassword'; // android.view.View.AUTOFILL_HINT_NEW_PASSWORD
				break;
			case 'newUsername':
				newOptions = 'newUsername'; // android.view.View.AUTOFILL_HINT_NEW_USERNAME
				break;
			case 'oneTimeCode':
				newOptions = '2faAppOTPCode'; // android.view.View.AUTOFILL_HINT_2FA_APP_OTP
				break;
			case 'none':
				newOptions = null;
				break;
			default: {
				newOptions = value;
				break;
			}
		}
		if (newOptions) {
			const array = Array.create(java.lang.String, 1);
			array[0] = newOptions;
			this.nativeTextViewProtected.setAutofillHints(array);
		} else {
			this.nativeTextViewProtected.setAutofillHints(null);
		}
	}

	[returnKeyTypeProperty.getDefault](): 'done' | 'next' | 'go' | 'search' | 'send' | string {
		const ime = this.nativeTextViewProtected.getImeOptions();
		switch (ime) {
			case android.view.inputmethod.EditorInfo.IME_ACTION_DONE:
				return 'done';

			case android.view.inputmethod.EditorInfo.IME_ACTION_GO:
				return 'go';

			case android.view.inputmethod.EditorInfo.IME_ACTION_NEXT:
				return 'next';

			case android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH:
				return 'search';

			case android.view.inputmethod.EditorInfo.IME_ACTION_SEND:
				return 'send';

			default:
				return ime.toString();
		}
	}
	[returnKeyTypeProperty.setNative](value: 'done' | 'next' | 'go' | 'search' | 'send' | string) {
		let newImeOptions;
		switch (value) {
			case 'done':
				newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_DONE;
				break;
			case 'go':
				newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_GO;
				break;
			case 'next':
				newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_NEXT;
				break;
			case 'search':
				newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH;
				break;
			case 'send':
				newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEND;
				break;
			default: {
				const ime = +value;
				if (!isNaN(ime)) {
					newImeOptions = ime;
				} else {
					newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED;
				}
				break;
			}
		}

		this.nativeTextViewProtected.setImeOptions(newImeOptions);
	}

	[editableProperty.setNative](value: boolean) {
		const nativeView = this.nativeTextViewProtected;
		if (value) {
			nativeView.setKeyListener(this._keyListenerCache);
		} else {
			if (!this._keyListenerCache) {
				this._keyListenerCache = nativeView.getKeyListener();
			}
			nativeView.setKeyListener(null);
		}
	}

	[autocapitalizationTypeProperty.getDefault](): 'none' | 'words' | 'sentences' | 'allcharacters' | string {
		const inputType = this.nativeTextViewProtected.getInputType();
		if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) {
			return 'words';
		} else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) === android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) {
			return 'sentences';
		} else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) {
			return 'allcharacters';
		} else {
			return inputType.toString();
		}
	}
	[autocapitalizationTypeProperty.setNative](value: string) {
		let inputType = this.nativeTextViewProtected.getInputType();
		inputType = inputType & ~28672; //28672 (0x00070000) 13,14,15bits (111 0000 0000 0000)

		switch (value) {
			case 'none':
				//Do nothing, we have lowered the three bits above.
				break;
			case 'words':
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00020000) 14th bit
				break;
			case 'sentences':
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00040000) 15th bit
				break;
			case 'allcharacters':
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS; //4096 (0x00010000) 13th bit
				break;
			default: {
				const number = +value;
				// We set the default value.
				if (!isNaN(number)) {
					inputType = number;
				} else {
					inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
				}
				break;
			}
		}

		this._setInputType(inputType);
	}

	[autocorrectProperty.getDefault](): boolean {
		const autocorrect = this.nativeTextViewProtected.getInputType();
		if ((autocorrect & android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) === android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) {
			return true;
		}

		return false;
	}
	[autocorrectProperty.setNative](value: boolean) {
		let inputType = this.nativeTextViewProtected.getInputType();
		switch (value) {
			case true:
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
				inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
				break;
			case false:
				inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE;
				inputType = inputType & ~android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
				inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
				break;
			default:
				// We can't do anything.
				break;
		}

		this._setInputType(inputType);
	}

	[hintProperty.getDefault](): string {
		return this.nativeTextViewProtected.getHint();
	}
	[hintProperty.setNative](value: string) {
		const text = value === null || value === undefined ? null : value.toString();
		this.nativeTextViewProtected.setHint(text);
	}

	[placeholderColorProperty.getDefault](): android.content.res.ColorStateList {
		return this.nativeTextViewProtected.getHintTextColors();
	}
	[placeholderColorProperty.setNative](value: Color | android.content.res.ColorStateList) {
		const color = value instanceof Color ? value.android : value;
		this.nativeTextViewProtected.setHintTextColor(<any>color);
	}

	[textTransformProperty.setNative](value: 'default') {
		//
	}

	[maxLengthProperty.setNative](value: number) {
		if (value === Number.POSITIVE_INFINITY) {
			this.nativeTextViewProtected.setFilters([]);
		} else {
			const lengthFilter = new android.text.InputFilter.LengthFilter(value);
			const filters = this.nativeTextViewProtected.getFilters();
			const newFilters = [];

			// retain existing filters
			for (let i = 0; i < filters.length; i++) {
				const filter = filters[i];
				if (!(filter instanceof android.text.InputFilter.LengthFilter)) {
					newFilters.push(filter);
				}
			}

			newFilters.push(lengthFilter);
			this.nativeTextViewProtected.setFilters(newFilters);
		}
	}

	public setSelection(start: number, stop?: number) {
		const view = this.nativeTextViewProtected;
		if (view) {
			if (stop !== undefined) {
				view.setSelection(start, stop);
			} else {
				view.setSelection(start);
			}
		}
	}

	public beforeTextChanged(text: string, start: number, count: number, after: number): void {
		// called by android.text.TextWatcher
	}

	public onTextChanged(text: string, start: number, before: number, count: number): void {
		// called by android.text.TextWatcher
		if (this.valueFormatter) {
			this.text = this.valueFormatter(text.toString());
			this.android.setSelection((this.text || '').length);
		}
		// const owner = this.owner;
		// let selectionStart = owner.android.getSelectionStart();
		// owner.android.removeTextChangedListener(owner._editTextListeners);
		// owner.android.addTextChangedListener(owner._editTextListeners);
		// owner.android.setSelection(selectionStart);
	}

	public afterTextChanged(editable: android.text.Editable): void {
		// called by android.text.TextWatcher
		if (this._changeFromCode) {
			return;
		}

		switch (this.updateTextTrigger) {
			case 'focusLost':
				this._dirtyTextAccumulator = editable.toString();
				break;
			case 'textChanged':
				textProperty.nativeValueChange(this, editable.toString());
				break;
			default:
				throw new Error('Invalid updateTextTrigger: ' + this.updateTextTrigger);
		}
	}

	public onFocusChange(view: android.view.View, hasFocus: boolean): void {
		if (hasFocus) {
			clearDismissTimer();
			this.notify({ eventName: EditableTextBase.focusEvent });
		} else {
			if (this._dirtyTextAccumulator || this._dirtyTextAccumulator === '') {
				textProperty.nativeValueChange(this, this._dirtyTextAccumulator);
				this._dirtyTextAccumulator = undefined;
			}

			this.notify({ eventName: EditableTextBase.blurEvent });
			dismissSoftInput(this);
		}
	}

	public onEditorAction(textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
		if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE || actionId === android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED || (event && event.getKeyCode() === android.view.KeyEvent.KEYCODE_ENTER)) {
			// If it is TextField, close the keyboard. If it is TextView, do not close it since the TextView is multiline
			// https://github.com/NativeScript/NativeScript/issues/3111
			if (textView.getMaxLines() === 1) {
				this.dismissSoftInput();
			}

			this._onReturnPress();
		} else if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_NEXT || actionId === android.view.inputmethod.EditorInfo.IME_ACTION_PREVIOUS) {
			// do not close keyboard for ACTION_NEXT or ACTION_PREVIOUS
			this._onReturnPress();
		}

		return false;
	}
}
