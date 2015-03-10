import common = require("ui/editable-text-base/editable-text-base-common");
import textBase = require("ui/text-base");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");

export class EditableTextBase extends common.EditableTextBase {
    private _android: android.widget.EditText;
    /* tslint:disable */
    private _dirtyTextAccumulator: string;
    /* tslint:enable */
    private _imm: android.view.inputmethod.InputMethodManager;

    constructor(options?: textBase.Options) {
        super(options);
    }

    get android(): android.widget.EditText {
        return this._android;
    }

    public _createUI() {
        this._imm = <android.view.inputmethod.InputMethodManager>this._context.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
        
        this._android = new android.widget.EditText(this._context);
        this.android.setTag(this.android.getKeyListener());

        var that = new WeakRef(this);
        
        var textWatcher = new android.text.TextWatcher({
            beforeTextChanged: function (text: string, start: number, count: number, after: number) {
                //
            },
            onTextChanged: function (text: string, start: number, before: number, count: number) {
                //
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
                        owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, editable.toString());
                        break;
                    default:
                        throw new Error("Invalid updateTextTrigger: " + owner.updateTextTrigger);
                        break;
                }
            }
        });
        this._android.addTextChangedListener(textWatcher);

        var focusChangeListener = new android.view.View.OnFocusChangeListener({
            onFocusChange: function (view: android.view.View, hasFocus: boolean) {
                var owner = that.get();
                if (!owner) {
                    return;
                }

                if (!hasFocus) {
                    if (owner._dirtyTextAccumulator) {
                        owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, owner._dirtyTextAccumulator);
                        owner._dirtyTextAccumulator = undefined;
                    }

                    owner.dismissSoftInput();
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
                        actionId === android.view.inputmethod.EditorInfo.IME_ACTION_SEND) {
                        owner.dismissSoftInput();
                    }
                }

                return false;
            }
        });
        this._android.setOnEditorActionListener(editorActionListener);
    }

    public _onDetached(force?: boolean) {
        this._imm = undefined;
        this._android = undefined;

        super._onDetached(force);
    }

    public dismissSoftInput() {
        if (this._imm) {
            this._imm.hideSoftInputFromWindow(this._android.getWindowToken(), 0);
        }
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this._android) {
            this.android.setText(data.newValue + "", android.widget.TextView.BufferType.EDITABLE);
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

        this._android.setInputType(newInputType);
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
            this.android.setKeyListener(<android.text.method.IKeyListener>this.android.getTag());
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
        inputType = inputType & ~28762; //28762 (0x00007000) 13,14,15bits

        switch (data.newValue) {
            case enums.AutocapitalizationType.none:
                //Do nothing, we have lowered the three bits above.
                break;
            case enums.AutocapitalizationType.words:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS; //8192 (0x00002000) 14th bit
                break;
            case enums.AutocapitalizationType.sentences:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES; //16384(0x00004000) 15th bit
                break;
            case enums.AutocapitalizationType.allCharacters:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS; //4096 (0x00001000) 13th bit
                break;
            default:
                inputType = inputType | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES;
                break;
        }

        editableTextBase.android.setInputType(inputType);
    }

    public _onAutocorrectPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var editableTextBase = <EditableTextBase>data.object;
        if (!editableTextBase.android) {
            return;
        }


        var inputType = editableTextBase.android.getInputType();
        console.log("BEFORE: " + inputType);

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

        editableTextBase.android.setInputType(inputType);
        console.log("AFTER: " + inputType);
    }
}  