import {
    EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty,
    returnKeyTypeProperty, editableProperty,
    autocapitalizationTypeProperty, autocorrectProperty, hintProperty,
    textProperty, placeholderColorProperty, Color
} from "./editable-text-base-common";

import { ad } from "utils/utils";

export * from "./editable-text-base-common";

//https://github.com/NativeScript/NativeScript/issues/2942
let dismissKeyboardTimeoutId: any;

interface EditTextListeners extends android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener {
}

interface EditTextListenersClass {
    prototype: EditTextListeners;
    new (owner: EditableTextBase): EditTextListeners;
}

let EditTextListeners: EditTextListenersClass;

function initializeEditTextListeners(): void {
    if (EditTextListeners) {
        return;
    }

    @Interfaces([android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener])
    class EditTextListenersImpl extends java.lang.Object implements android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener {
        constructor(private owner: EditableTextBase) {
            super();
            return global.__native(this);
        }

        public beforeTextChanged(text: string, start: number, count: number, after: number) {
            //
        }

        public onTextChanged(text: string, start: number, before: number, count: number) {
            const owner = this.owner;
            let selectionStart = owner.android.getSelectionStart();
            owner.android.removeTextChangedListener(owner._editTextListeners);
            owner.android.addTextChangedListener(owner._editTextListeners);
            owner.android.setSelection(selectionStart);
        }

        public afterTextChanged(editable: android.text.IEditable) {
            const owner = this.owner;
            switch (owner.updateTextTrigger) {
                case "focusLost":
                    owner._dirtyTextAccumulator = editable.toString();
                    break;
                case "textChanged":
                    textProperty.nativeValueChange(owner, editable.toString());
                    break;
                default:
                    throw new Error("Invalid updateTextTrigger: " + owner.updateTextTrigger);
            }
        }

        public onFocusChange(view: android.view.View, hasFocus: boolean) {
            const owner = this.owner;

            if (hasFocus) {
                if (dismissKeyboardTimeoutId) {
                    // https://github.com/NativeScript/NativeScript/issues/2942
                    // Don't hide the keyboard since another (or the same) EditText has gained focus.
                    clearTimeout(dismissKeyboardTimeoutId);
                    dismissKeyboardTimeoutId = undefined;
                }
            }
            else {
                if (owner._dirtyTextAccumulator) {
                    textProperty.nativeValueChange(owner, owner._dirtyTextAccumulator);
                    owner._dirtyTextAccumulator = undefined;
                }

                dismissKeyboardTimeoutId = setTimeout(() => {
                    // https://github.com/NativeScript/NativeScript/issues/2942
                    // Dismiss the keyboard if focus goes to something different from EditText.
                    owner.dismissSoftInput();
                    dismissKeyboardTimeoutId = null;
                }, 1);
            }
        }

        public onEditorAction(textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
            const owner = this.owner;

            if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_GO ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEND ||
                (event && event.getKeyCode() === android.view.KeyEvent.KEYCODE_ENTER)) {
                // If it is TextField, close the keyboard. If it is TextView, do not close it since the TextView is multiline
                // https://github.com/NativeScript/NativeScript/issues/3111
                if (textView.getMaxLines() === 1) {
                    owner.dismissSoftInput();
                }
                owner._onReturnPress();
            }

            // If action is ACTION_NEXT then do not close keyboard
            if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_NEXT) {
                owner._onReturnPress();
            }

            return false;
        }
    }

    EditTextListeners = EditTextListenersImpl;
}

export abstract class EditableTextBase extends EditableTextBaseCommon {
    /* tslint:disable */
    _dirtyTextAccumulator: string;
    /* tslint:enable */
    
    _editTextListeners: EditTextListeners;

    private _android: android.widget.EditText;
    private _keyListenerCache: android.text.method.KeyListener;

    get android(): android.widget.EditText {
        return this._android;
    }

    public abstract _configureEditText(): void;

    public abstract _onReturnPress(): void;

    public _createNativeView() {
        initializeEditTextListeners();
        this._android = new android.widget.EditText(this._context);
        this._configureEditText();
        this._keyListenerCache = this.android.getKeyListener();

        this._editTextListeners = this._editTextListeners || new EditTextListeners(this);
        this._android.addTextChangedListener(this._editTextListeners);
        this._android.setOnFocusChangeListener(this._editTextListeners);
        this._android.setOnEditorActionListener(this._editTextListeners);
    }

    public _resetNativeView(force?: boolean) {
        if (this._android) {
            this._android.setOnFocusChangeListener(null);
            this._android.setOnEditorActionListener(null);

            if (this._editTextListeners) {
                this._android.removeTextChangedListener(this._editTextListeners);
            }
        }
        super._resetNativeView();
    }

    public _disposeNativeView(force?: boolean) {
        this._android = undefined;
        super._disposeNativeView();
    }

    public dismissSoftInput() {
        ad.dismissSoftInput(this._android);
    }

    public focus(): boolean {
        let result = super.focus();

        if (result) {
            ad.showSoftInput(this._android);
        }

        return result;
    }

    private _setInputType(inputType): void {
        let nativeView = this._android;
        nativeView.setInputType(inputType);

        // setInputType will change the keyListener so we should cache it again
        let listener = nativeView.getKeyListener();
        if (listener) {
            this._keyListenerCache = listener;
        }

        // clear the listener if editable is false
        if (!this.editable) {
            nativeView.setKeyListener(null);
        }
    }

    get [textProperty.native](): string {
        return this._android.getText();
    }
    set [textProperty.native](value: string) {
        const text = (value === null || value === undefined) ? '' : value.toString();
        this._android.setText(text, android.widget.TextView.BufferType.EDITABLE);
    }

    get [keyboardTypeProperty.native](): "datetime" | "phone" | "number" | "url" | "email" | string {
        let inputType = this._android.getInputType();
        switch (inputType) {
            case android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL:
                return "datetime";

            case android.text.InputType.TYPE_CLASS_PHONE:
                return "phone";

            case android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL:
                return "number";

            case android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI:
                return "url";

            case android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS:
                return "email";

            default:
                return inputType.toString();
        }
    }
    set [keyboardTypeProperty.native](value: "datetime" | "phone" | "number" | "url" | "email" | string) {
        let newInputType;
        switch (value) {
            case "datetime":
                newInputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
                break;

            case "phone":
                newInputType = android.text.InputType.TYPE_CLASS_PHONE;
                break;

            case "number":
                newInputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
                break;

            case "url":
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
                break;

            case "email":
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
                break;

            default:
                let inputType = +value;
                if (!isNaN(inputType)) {
                    newInputType = inputType;
                } else {
                    newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;
                }
                break;
        }

        this._setInputType(newInputType);
    }

    get [returnKeyTypeProperty.native](): "done" | "next" | "go" | "search" | "send" | string {
        let ime = this._android.getImeOptions();
        switch (ime) {
            case android.view.inputmethod.EditorInfo.IME_ACTION_DONE:
                return "done";

            case android.view.inputmethod.EditorInfo.IME_ACTION_GO:
                return "go";

            case android.view.inputmethod.EditorInfo.IME_ACTION_NEXT:
                return "next";

            case android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH:
                return "search";

            case android.view.inputmethod.EditorInfo.IME_ACTION_SEND:
                return "send";

            default:
                return ime.toString();
        }
    }
    set [returnKeyTypeProperty.native](value: "done" | "next" | "go" | "search" | "send" | string) {
        let newImeOptions;
        switch (value) {
            case "done":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_DONE;
                break;
            case "go":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_GO;
                break;
            case "next":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_NEXT;
                break;
            case "search":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH;
                break;
            case "send":
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEND;
                break;
            default:
                let ime = +value;
                if (!isNaN(ime)) {
                    newImeOptions = ime;
                } else {
                    newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED;
                }
                break;
        }

        this._android.setImeOptions(newImeOptions);
    }

    get [editableProperty.native](): boolean {
        return !!this._android.getKeyListener();
    }
    set [editableProperty.native](value: boolean) {
        if (value) {
            this._android.setKeyListener(this._keyListenerCache);
        }
        else {
            this._android.setKeyListener(null);
        }
    }

    get [autocapitalizationTypeProperty.native](): "none" | "words" | "sentences" | "allCharacters" | string {
        let inputType = this._android.getInputType();
        if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) {
            return "words";
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) === android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) {
            return "sentences";
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) {
            return "allCharacters";
        } else {
            return inputType.toString();
        }
    }
    set [autocapitalizationTypeProperty.native](value: string) {
        let inputType = this._android.getInputType();
        inputType = inputType & ~28672; //28672 (0x00070000) 13,14,15bits (111 0000 0000 0000)

        switch (value) {
            case "none":
                //Do nothing, we have lowered the three bits above.
                break;
            case "words":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00020000) 14th bit
                break;
            case "sentences":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00040000) 15th bit
                break;
            case "allCharacters":
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS; //4096 (0x00010000) 13th bit
                break;
            default:
                let number = +value;
                // We set the default value.
                if (!isNaN(number)) {
                    inputType = number;
                } else {
                    inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
                }
                break;
        }

        this._setInputType(inputType);
    }

    get [autocorrectProperty.native](): boolean {
        let autocorrect = this._android.getInputType();
        if ((autocorrect & android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) === android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) {
            return true;
        }

        return false;
    }
    set [autocorrectProperty.native](value: boolean) {
        let inputType = this._android.getInputType();
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

    get [hintProperty.native](): string {
        return this._android.getHint();
    }
    set [hintProperty.native](value: string) {
        this._android.setHint(value + '');
    }

    get [placeholderColorProperty.native](): android.content.res.ColorStateList {
        return this._android.getHintTextColors();
    }
    set [placeholderColorProperty.native](value: Color | android.content.res.ColorStateList) {
        if (value instanceof Color) {
            this._android.setHintTextColor(value.android);
        } else {
            this._android.setHintTextColor(value);
        }
    }
}