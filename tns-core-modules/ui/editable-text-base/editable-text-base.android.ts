import common = require("./editable-text-base-common");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import utils = require("utils/utils");
import types = require("utils/types");

//https://github.com/NativeScript/NativeScript/issues/2942
let dismissKeyboardTimeoutId: number;

export class EditableTextBase extends common.EditableTextBase {
    private _android: android.widget.EditText;
    private _textWatcher: android.text.TextWatcher;
    private _keyListenerCache: android.text.method.IKeyListener;
    /* tslint:disable */
    private _dirtyTextAccumulator: string;
    /* tslint:enable */

    get android(): android.widget.EditText {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.EditText(this._context);
        this._configureEditText();
        this._keyListenerCache = this.android.getKeyListener();

        var that = new WeakRef(this);

        this._textWatcher = new android.text.TextWatcher({
            beforeTextChanged: function (text: string, start: number, count: number, after: number) {
                //
            },
            onTextChanged: function (text: string, start: number, before: number, count: number) {
                var owner = that.get();
                if (!owner) {
                    return;
                }
                var selectionStart = owner.android.getSelectionStart();
                owner.android.removeTextChangedListener(owner._textWatcher);
                
                //RemoveThisDoubleCall
                owner.style._updateTextDecoration();
                owner.style._updateTextTransform();
                
                owner.android.addTextChangedListener(owner._textWatcher);
                owner.android.setSelection(selectionStart);
            },
            afterTextChanged: function (editable: android.text.IEditable) {
                var owner = that.get();
                if (!owner) {
                    return;
                }

                switch (owner.updateTextTrigger) {
                    case enums.UpdateTextTrigger.focusLost:
                        owner._dirtyTextAccumulator = editable.toString();
                        break;
                    case enums.UpdateTextTrigger.textChanged:
                        owner._onPropertyChangedFromNative(EditableTextBase.textProperty, editable.toString());
                        break;
                    default:
                        throw new Error("Invalid updateTextTrigger: " + owner.updateTextTrigger);
                }
            }
        });
        this._android.addTextChangedListener(this._textWatcher);

        var focusChangeListener = new android.view.View.OnFocusChangeListener({
            onFocusChange: function (view: android.view.View, hasFocus: boolean) {
                var owner = that.get();
                if (!owner) {
                    return;
                }

                if (hasFocus) {
                    if (dismissKeyboardTimeoutId){
                        // https://github.com/NativeScript/NativeScript/issues/2942
                        // Don't hide the keyboard since another (or the same) EditText has gained focus.
                        clearTimeout(dismissKeyboardTimeoutId);
                        dismissKeyboardTimeoutId = undefined;
                    }
                }
                else {
                    if (owner._dirtyTextAccumulator) {
                        owner._onPropertyChangedFromNative(EditableTextBase.textProperty, owner._dirtyTextAccumulator);
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
        });
        this._android.setOnFocusChangeListener(focusChangeListener);

        var editorActionListener = new android.widget.TextView.OnEditorActionListener({
            onEditorAction: function (textView: android.widget.TextView, actionId: number, event: android.view.KeyEvent): boolean {
                var owner = that.get();
                if (owner) {
                    if (actionId === android.view.inputmethod.EditorInfo.IME_ACTION_DONE ||
                        actionId === android.view.inputmethod.EditorInfo.IME_ACTION_GO ||
                        actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                        actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEND ||
                        actionId === android.view.inputmethod.EditorInfo.IME_ACTION_NEXT ||
                        (event && event.getKeyCode() === android.view.KeyEvent.KEYCODE_ENTER)) {
                        owner.dismissSoftInput();
                        owner._onReturnPress();
                    }
                }

                return false;
            }
        });
        this._android.setOnEditorActionListener(editorActionListener);
    }

    public _configureEditText() {
        // abstract
    }

    public _onReturnPress() {
        // abstract
    }

    public _onDetached(force?: boolean) {
        if (this._android && this._textWatcher) {
            this._android.removeTextChangedListener(this._textWatcher);
        }

        this._android = undefined;
        super._onDetached(force);
    }

    public dismissSoftInput() {
        utils.ad.dismissSoftInput(this._nativeView);
    }

    public focus(): boolean {
        var result = super.focus();

        if (result) {
            utils.ad.showSoftInput(this._nativeView);
        }

        return result;
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this._android) {
            var newValue = types.toUIString(data.newValue);
            this.android.setText(newValue, android.widget.TextView.BufferType.EDITABLE);
        }
    }

    public _onKeyboardTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (!this._android) {
            return;
        }

        var newInputType;
        switch (data.newValue) {
            case enums.KeyboardType.datetime:
                newInputType = android.text.InputType.TYPE_CLASS_DATETIME | android.text.InputType.TYPE_DATETIME_VARIATION_NORMAL;
                break;
            case enums.KeyboardType.phone:
                newInputType = android.text.InputType.TYPE_CLASS_PHONE;
                break;
            case enums.KeyboardType.number:
                newInputType = android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL | android.text.InputType.TYPE_NUMBER_FLAG_SIGNED | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL;
                break;
            case enums.KeyboardType.url:
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI;
                break;
            case enums.KeyboardType.email:
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;
                break;
            default:
                newInputType = android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;
                break;
        }

        this._setInputType(newInputType);
    }

    public _onReturnKeyTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (!this._android) {
            return;
        }

        var newImeOptions;
        switch (data.newValue) {
            case enums.ReturnKeyType.done:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_DONE;
                break;
            case enums.ReturnKeyType.go:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_GO;
                break;
            case enums.ReturnKeyType.next:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_NEXT;
                break;
            case enums.ReturnKeyType.search:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH;
                break;
            case enums.ReturnKeyType.send:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_SEND;
                break;
            default:
                newImeOptions = android.view.inputmethod.EditorInfo.IME_ACTION_UNSPECIFIED
                break;
        }

        this._android.setImeOptions(newImeOptions);
    }

    public _onEditablePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (!this._android) {
            return;
        }

        if (data.newValue) {
            this.android.setKeyListener(this._keyListenerCache);
        }
        else {
            this.android.setKeyListener(null);
        }
    }

    public _onAutocapitalizationTypePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var editableTextBase = <EditableTextBase>data.object;
        if (!editableTextBase.android) {
            return;
        }

        var inputType = editableTextBase.android.getInputType();
        inputType = inputType & ~28672; //28672 (0x00070000) 13,14,15bits (111 0000 0000 0000)

        switch (data.newValue) {
            case enums.AutocapitalizationType.none:
                //Do nothing, we have lowered the three bits above.
                break;
            case enums.AutocapitalizationType.words:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00020000) 14th bit
                break;
            case enums.AutocapitalizationType.sentences:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00040000) 15th bit
                break;
            case enums.AutocapitalizationType.allCharacters:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS; //4096 (0x00010000) 13th bit
                break;
            default:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
                break;
        }

        editableTextBase._setInputType(inputType);
    }

    public _onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var editableTextBase = <EditableTextBase>data.object;
        if (!editableTextBase.android) {
            return;
        }

        var inputType = editableTextBase.android.getInputType();
        switch (data.newValue) {
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

        editableTextBase._setInputType(inputType);
    }

    public _onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var editableTextBase = <EditableTextBase>data.object;
        if (!editableTextBase.android) {
            return;
        }

        editableTextBase.android.setHint(data.newValue + "");
    }

    private _setInputType(inputType): void {
        this.android.setInputType(inputType);

        // setInputType will change the keyListener so we should cache it again
        let listener = this.android.getKeyListener();
        if (listener) {
            this._keyListenerCache = listener;
        }

        // clear the listener if editable is false
        if (!this.editable) {
            this.android.setKeyListener(null);
        }
    }
}  
