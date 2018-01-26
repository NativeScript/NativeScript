import {
    EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty,
    returnKeyTypeProperty, editableProperty,
    autocapitalizationTypeProperty, autocorrectProperty, hintProperty,
    textProperty, placeholderColorProperty, Color, textTransformProperty, maxLengthProperty
} from "./editable-text-base-common";

import { ad } from "../../utils/utils";

export * from "./editable-text-base-common";

//https://github.com/NativeScript/NativeScript/issues/2942
export let dismissKeyboardTimeoutId: NodeJS.Timer;
export let dismissKeyboardOwner: WeakRef<EditableTextBase>;

interface EditTextListeners extends android.text.TextWatcher, android.view.View.OnFocusChangeListener, android.widget.TextView.OnEditorActionListener {
}

interface EditTextListenersClass {
    prototype: EditTextListeners;
    new(owner: EditableTextBase): EditTextListeners;
}

let EditTextListeners: EditTextListenersClass;

function clearDismissTimer(): void {
    dismissKeyboardOwner = null;
    if (dismissKeyboardTimeoutId) {
        clearTimeout(dismissKeyboardTimeoutId);
        dismissKeyboardTimeoutId = null;
    }
}

function dismissSoftInput(owner: EditableTextBase): void {
    clearDismissTimer();
    if (!dismissKeyboardTimeoutId) {
        dismissKeyboardTimeoutId = setTimeout(() => {
            const owner = dismissKeyboardOwner && dismissKeyboardOwner.get();
            const activity = (owner && owner._context) as android.app.Activity;
            const nativeView = owner && owner.nativeViewProtected;
            dismissKeyboardTimeoutId = null;
            dismissKeyboardOwner = null;
            const focused = activity && activity.getCurrentFocus();
            if (!focused || !(focused instanceof android.widget.EditText)) {
                ad.dismissSoftInput(nativeView);
            }
        }, 10);
    }
}
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

        public beforeTextChanged(text: string, start: number, count: number, after: number): void {
            //
        }

        public onTextChanged(text: string, start: number, before: number, count: number): void {
            // const owner = this.owner;
            // let selectionStart = owner.android.getSelectionStart();
            // owner.android.removeTextChangedListener(owner._editTextListeners);
            // owner.android.addTextChangedListener(owner._editTextListeners);
            // owner.android.setSelection(selectionStart);
        }

        public afterTextChanged(editable: android.text.IEditable): void {
            const owner = this.owner;
            if (!owner || owner._changeFromCode) {
                return;
            }

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

        public onFocusChange(view: android.view.View, hasFocus: boolean): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }

            if (hasFocus) {
                clearDismissTimer();
                owner.notify({ eventName: EditableTextBase.focusEvent, object: owner });
            } else {
                if (owner._dirtyTextAccumulator || owner._dirtyTextAccumulator === "") {
                    textProperty.nativeValueChange(owner, owner._dirtyTextAccumulator);
                    owner._dirtyTextAccumulator = undefined;
                }

                owner.notify({ eventName: EditableTextBase.blurEvent, object: owner });
                dismissSoftInput(owner);
            }
        }

        public onEditorAction(textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
            const owner = this.owner;
            if (!owner) {
                return false;
            }

            if (actionId === android.view.inputmethod.EditorInfo.IME_NULL ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED ||
                actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE ||
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
            if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_NEXT
                || actionId === android.view.inputmethod.EditorInfo.IME_ACTION_PREVIOUS) {
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

    nativeViewProtected: android.widget.EditText;
    private _keyListenerCache: android.text.method.KeyListener;
    private _inputType: number;

    public _changeFromCode: boolean;

    public abstract _configureEditText(editText: android.widget.EditText): void;

    public _onReturnPress(): void {
        //
    }

    public createNativeView() {
        initializeEditTextListeners();
        const editText = new android.widget.EditText(this._context);
        this._configureEditText(editText);

        const listeners = new EditTextListeners(this);
        editText.addTextChangedListener(listeners);
        editText.setOnFocusChangeListener(listeners);
        editText.setOnEditorActionListener(listeners);
        (<any>editText).listener = listeners;
        return editText;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        (<any>nativeView).listener.owner = this;
        this._inputType = nativeView.getInputType();
    }

    public disposeNativeView(): void {
        super.disposeNativeView();
        (<any>this.nativeViewProtected).listener.owner = null;
        this._keyListenerCache = null;
    }

    public resetNativeView(): void {
        super.resetNativeView();
        this.nativeViewProtected.setInputType(this._inputType);
    }

    public onUnloaded() {
        this.dismissSoftInput();
        super.onUnloaded();
    }

    public dismissSoftInput() {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }

        ad.dismissSoftInput(nativeView);
    }

    public focus(): boolean {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }

        const result = super.focus();
        if (result) {
            ad.showSoftInput(this.nativeViewProtected);
        }

        return result;
    }

    public _setInputType(inputType: number): void {
        const nativeView = this.nativeViewProtected;
        try {
            this._changeFromCode = true;
            nativeView.setInputType(inputType);
        } finally {
            this._changeFromCode = false;
        }

        // setInputType will change the keyListener so we should cache it again
        const listener = nativeView.getKeyListener();
        if (listener) {
            this._keyListenerCache = listener;
        }

        // clear the listener if editable is false
        if (!this.editable) {
            nativeView.setKeyListener(null);
        }
    }

    [textProperty.getDefault](): number {
        return -1;
    }
    [textProperty.setNative](value: string | number) {
        try {
            this._changeFromCode = true;
            this._setNativeText(value === -1);
        } finally {
            this._changeFromCode = false;
        }
    }

    [keyboardTypeProperty.getDefault](): number {
        return this.nativeViewProtected.getInputType();
    }
    [keyboardTypeProperty.setNative](value: "datetime" | "phone" | "number" | "url" | "email" | number) {
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
                newInputType = value;
                break;
        }

        this._setInputType(newInputType);
    }

    [returnKeyTypeProperty.getDefault](): "done" | "next" | "go" | "search" | "send" | string {
        let ime = this.nativeViewProtected.getImeOptions();
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
    [returnKeyTypeProperty.setNative](value: "done" | "next" | "go" | "search" | "send" | string) {
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

        this.nativeViewProtected.setImeOptions(newImeOptions);
    }

    [editableProperty.setNative](value: boolean) {
        const nativeView = this.nativeViewProtected;
        if (value) {
            nativeView.setKeyListener(this._keyListenerCache);
        } else {
            if (!this._keyListenerCache) {
                this._keyListenerCache = nativeView.getKeyListener();
            }
            nativeView.setKeyListener(null);
        }
    }

    [autocapitalizationTypeProperty.getDefault](): "none" | "words" | "sentences" | "allcharacters" | string {
        let inputType = this.nativeViewProtected.getInputType();
        if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) {
            return "words";
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) === android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) {
            return "sentences";
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) {
            return "allcharacters";
        } else {
            return inputType.toString();
        }
    }
    [autocapitalizationTypeProperty.setNative](value: string) {
        let inputType = this.nativeViewProtected.getInputType();
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
            case "allcharacters":
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

    [autocorrectProperty.getDefault](): boolean {
        let autocorrect = this.nativeViewProtected.getInputType();
        if ((autocorrect & android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) === android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) {
            return true;
        }

        return false;
    }
    [autocorrectProperty.setNative](value: boolean) {
        let inputType = this.nativeViewProtected.getInputType();
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
        return this.nativeViewProtected.getHint();
    }
    [hintProperty.setNative](value: string) {
        const text = (value === null || value === undefined) ? null : value.toString();
        this.nativeViewProtected.setHint(text);
    }

    [placeholderColorProperty.getDefault](): android.content.res.ColorStateList {
        return this.nativeViewProtected.getHintTextColors();
    }
    [placeholderColorProperty.setNative](value: Color | android.content.res.ColorStateList) {
        const color = value instanceof Color ? value.android : value;
        this.nativeViewProtected.setHintTextColor(<any>color);
    }

    [textTransformProperty.setNative](value: "default") {
        //
    }

    [maxLengthProperty.setNative](value: number) {
        if (value === Number.POSITIVE_INFINITY) {
            this.nativeViewProtected.setFilters([]);
        } else {
            const lengthFilter = new android.text.InputFilter.LengthFilter(value);
            const filters = this.nativeViewProtected.getFilters();
            const newFilters = [];

            // retain existing filters
            for (let i = 0; i < filters.length; i++) {
                const filter = filters[i];
                if (!(filter instanceof android.text.InputFilter.LengthFilter)) {
                    newFilters.push(filter);
                }
            }

            newFilters.push(lengthFilter);
            this.nativeViewProtected.setFilters(newFilters);
        }
    }
}
