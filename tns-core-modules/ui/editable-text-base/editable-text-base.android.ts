import {
    EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty,
    returnKeyTypeProperty, editableProperty, updateTextTriggerProperty,
    autocapitalizationTypeProperty, autocorrectProperty, hintProperty
} from "./editable-text-base-common";
import { textProperty } from "ui/text-base";

export class EditableTextBase extends common.EditableTextBase {
    private _android: android.widget.EditText;
    private _textWatcher: android.text.TextWatcher;
    private _keyListenerCache: android.text.method.IKeyListener;
    /* tslint:disable */
    private _dirtyTextAccumulator: string;
    /* tslint:enable */

import { UpdateTextTrigger, KeyboardType, ReturnKeyType, AutocapitalizationType } from "ui/enums";
import { toUIString } from "utils/types";
import * as utils from "utils/utils";

@Interfaces([android.text.TextWatcher])
class TextWatcher implements android.text.TextWatcher {
    constructor(private owner: WeakRef<EditableTextBase>) {
        //        
    }

    public beforeTextChanged(text: string, start: number, count: number, after: number) {
        //
    }

    public onTextChanged(text: string, start: number, before: number, count: number) {
        let owner = this.owner.get();
        if (!owner) {
            return;
        }
        let selectionStart = owner.android.getSelectionStart();
        owner.android.removeTextChangedListener(owner._textWatcher);

        // //RemoveThisDoubleCall
        // owner.style._updateTextDecoration();
        // owner.style._updateTextTransform();

        owner.android.addTextChangedListener(owner._textWatcher);
        owner.android.setSelection(selectionStart);
    }

    public afterTextChanged(editable: android.text.IEditable) {
        let owner = this.owner.get();
        if (!owner) {
            return;
        }

        switch (owner.updateTextTrigger) {
            case UpdateTextTrigger.focusLost:
                owner._dirtyTextAccumulator = editable.toString();
                break;
            case UpdateTextTrigger.textChanged:
                owner.nativePropertyChanged(textProperty, editable.toString());
                break;
            default:
                throw new Error("Invalid updateTextTrigger: " + owner.updateTextTrigger);
        }
    }
}

@Interfaces([android.view.View.OnFocusChangeListener])
class FocusChangeListener implements android.view.View.OnFocusChangeListener {
    constructor(private owner: WeakRef<EditableTextBase>) {
        //        
    }

    public onFocusChange(view: android.view.View, hasFocus: boolean) {
        let owner = this.owner.get();
        if (!owner) {
            return;
        }

        if (!hasFocus) {
             if (dismissKeyboardTimeoutId){
                 // https://github.com/NativeScript/NativeScript/issues/2942
                 // Don't hide the keyboard since another (or the same) EditText has gained focus.
                 clearTimeout(dismissKeyboardTimeoutId);
                 dismissKeyboardTimeoutId = undefined;
             }
        }
        else {
            if (owner._dirtyTextAccumulator) {
                owner.nativePropertyChanged(textProperty, owner._dirtyTextAccumulator);
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
}

@Interfaces([android.widget.TextView.OnEditorActionListener])
class EditorActionListener implements android.widget.TextView.OnEditorActionListener {
    constructor(private owner: WeakRef<EditableTextBase>) {
        //        
    }

    public onEditorAction(textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
        let owner = this.owner.get();
        if (owner) {
	    if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE ||
           	actionId === android.view.inputmethod.EditorInfo.IME_ACTION_GO ||
            	actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
            	actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEND ||
            	(event && event.getKeyCode() === android.view.KeyEvent.KEYCODE_ENTER)) {
                 // If it is TextField, close the keyboard. If it is TextView, do not close it since the TextView is multiline
                 // https://github.com/NativeScript/NativeScript/issues/3111
                 if (textView.getMaxLines() === 1){
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

export abstract class EditableTextBase extends EditableTextBaseCommon {
    _textWatcher: android.text.TextWatcher;
    /* tslint:disable */
    _dirtyTextAccumulator: string;
    /* tslint:enable */

    private _android: android.widget.EditText;
    private _keyListenerCache: android.text.method.KeyListener;
    private _focusChangeListener: android.view.View.OnFocusChangeListener;
    private _editorActionListener: android.widget.TextView.OnEditorActionListener;
    public nativeView: android.widget.EditText;

    get android(): android.widget.EditText {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.EditText(this._context);
        this._configureEditText();
        this._keyListenerCache = this.android.getKeyListener();

        let weakRef = new WeakRef(this);

        this._textWatcher = this._textWatcher || new TextWatcher(weakRef);
        this._android.addTextChangedListener(this._textWatcher);

        this._focusChangeListener = this._focusChangeListener || new FocusChangeListener(weakRef);
        this._android.setOnFocusChangeListener(this._focusChangeListener);

        this._editorActionListener = this._editorActionListener || new EditorActionListener(weakRef);
        this._android.setOnEditorActionListener(this._editorActionListener);
    }

    public abstract _configureEditText(): void;

    public abstract _onReturnPress(): void;

    public _onDetached(force?: boolean) {
        if (this._android) {
            if (this._textWatcher) {
                this._android.removeTextChangedListener(this._textWatcher);
            }

            if (this._focusChangeListener) {
                this._android.setOnFocusChangeListener(null);
            }

            if (this._editorActionListener) {
                this._android.setOnEditorActionListener(null);
            }
        }

        this._android = undefined;
        super._onDetached(force);
    }

    public dismissSoftInput() {
        utils.ad.dismissSoftInput(this._nativeView);
    }

    public focus(): boolean {
        let result = super.focus();

        if (result) {
            utils.ad.showSoftInput(this._nativeView);
        }

        return result;
    }

    private _setInputType(inputType): void {
        let nativeView = this.nativeView;
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
        return this.nativeView.getText();
    }
    set [textProperty.native](value: string) {
        let newValue = toUIString(value);
        this.nativeView.setText(newValue, android.widget.TextView.BufferType.EDITABLE);
    }

    get [keyboardTypeProperty.native](): string {
        let inputType = this.nativeView.getInputType();
        switch (inputType) {
            case android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL:
                return KeyboardType.datetime;

            case android.text.InputType.TYPE_CLASS_PHONE:
                return KeyboardType.phone;

            case android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL:
                return KeyboardType.number;

            case android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI:
                return KeyboardType.url;

            case android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS:
                return KeyboardType.email;

            default:
                return inputType.toString();
        }
    }
    set [keyboardTypeProperty.native](value: string) {
        let newInputType;
        switch (value) {
            case KeyboardType.datetime:
                newInputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
                break;
            case KeyboardType.phone:
                newInputType = android.text.InputType.TYPE_CLASS_PHONE;
                break;
            case KeyboardType.number:
                newInputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
                break;
            case KeyboardType.url:
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
                break;
            case KeyboardType.email:
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

    get [returnKeyTypeProperty.native](): string {
        let ime = this.nativeView.getImeOptions();
        switch (ime) {
            case android.view.inputmethod.EditorInfo.IME_ACTION_DONE:
                return ReturnKeyType.done;

            case android.view.inputmethod.EditorInfo.IME_ACTION_GO:
                return ReturnKeyType.go;

            case android.view.inputmethod.EditorInfo.IME_ACTION_NEXT:
                return ReturnKeyType.next;

            case android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH:
                return ReturnKeyType.search;

            case android.view.inputmethod.EditorInfo.IME_ACTION_SEND:
                return ReturnKeyType.send;

            default:
                return ime.toString();
        }
    }
    set [returnKeyTypeProperty.native](value: string) {
        let newImeOptions;
        switch (value) {
            case ReturnKeyType.done:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_DONE;
                break;
            case ReturnKeyType.go:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_GO;
                break;
            case ReturnKeyType.next:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_NEXT;
                break;
            case ReturnKeyType.search:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH;
                break;
            case ReturnKeyType.send:
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
        return !!this.nativeView.getKeyListener();
    }
    set [editableProperty.native](value: boolean) {
        if (value) {
            this.nativeView.setKeyListener(this._keyListenerCache);
        }
        else {
            this.nativeView.setKeyListener(null);
        }
    }

    get [autocapitalizationTypeProperty.native](): string {
        let inputType = this.nativeView.getInputType();
        if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS) {
            return AutocapitalizationType.words;
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) === android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES) {
            return AutocapitalizationType.sentences;
        } else if ((inputType & android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) === android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS) {
            return AutocapitalizationType.allCharacters;
        } else {
            return inputType.toString();
        }
    }
    set [autocapitalizationTypeProperty.native](value: string) {
        let inputType = this.nativeView.getInputType();
        inputType = inputType & ~28672; //28672 (0x00070000) 13,14,15bits (111 0000 0000 0000)

        switch (value) {
            case AutocapitalizationType.none:
                //Do nothing, we have lowered the three bits above.
                break;
            case AutocapitalizationType.words:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00020000) 14th bit
                break;
            case AutocapitalizationType.sentences:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00040000) 15th bit
                break;
            case AutocapitalizationType.allCharacters:
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
        let autocorrect = this.nativeView.getInputType();
        if ((autocorrect & android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) === android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT) {
            return true;
        }

        return false;
    }
    set [autocorrectProperty.native](value: boolean) {
        let inputType = this.nativeView.getInputType();
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
        return this.nativeView.getHint();
    }
    set [hintProperty.native](value: string) {
        this.nativeView.setHint(toUIString(value));
    }
}  
