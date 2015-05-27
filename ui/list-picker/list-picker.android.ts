import common = require("ui/list-picker/list-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class ListPicker extends common.ListPicker {
    private _android: android.widget.NumberPicker;
    private _valueChangedListener: android.widget.NumberPicker.OnValueChangeListener;
    private _formatter: android.widget.NumberPicker.Formatter;
    private _editText: android.widget.EditText;

    get android(): android.widget.NumberPicker {
        return this._android;
    }

    constructor() {
        super();
    }

    public _createUI() {
        this._android = new android.widget.NumberPicker(this._context);
        this._android.setDescendantFocusability(android.widget.NumberPicker.FOCUS_BLOCK_DESCENDANTS);

        var that = new WeakRef(this);

        this._formatter = new android.widget.NumberPicker.Formatter({
            get owner(): ListPicker {
                return that.get();
            },

            format: function (index: number) {
                if (this.owner) {
                    return this.owner._getItemAsString(index);
                }

                return "";
            }
        });
        this._android.setFormatter(this._formatter);

        this._valueChangedListener = new android.widget.NumberPicker.OnValueChangeListener({
            get owner() {
                return that.get();
            },

            onValueChange: function (picker: android.widget.NumberPicker, oldVal: number, newVal: number) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.ListPicker.selectedIndexProperty, newVal);
                }
            }
        });
        this._android.setOnValueChangedListener(this._valueChangedListener);

        //Fix disappearing selected item.
        //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
        var mInputTextField = java.lang.Class.forName("android.widget.NumberPicker").getDeclaredField("mInputText");
        mInputTextField.setAccessible(true);
        this._editText = <android.widget.EditText>mInputTextField.get(this._android);
        this._editText.setFilters([]);

        // Since the Android NumberPicker has to always have at least one item, i.e. minValue=maxValue=value=0, we don't want this zero showing up when this.items is empty.
        this._editText.setText(" ");
    }

    public _onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChanged(data);
        
        if (this.android && types.isNumber(data.newValue)) {
            
            if (types.isDefined(this.items) && types.isNumber(this.items.length)) {
                this.android.setMaxValue(this.items.length - 1);
            }

            this.android.setValue(data.newValue);
        }
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            var maxValue;
            if (!data.newValue || !data.newValue.length) {
                maxValue = 0;
            }
            else {
                maxValue = data.newValue.length - 1;
            }

            this.android.setMaxValue(maxValue);
            this.android.setWrapSelectorWheel(false);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);
        
        //Fix disappearing selected item.
        //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
        if (this._editText) {
            this._editText.setFilters([]);
        }
    }
} 