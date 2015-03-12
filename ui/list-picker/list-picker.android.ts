import common = require("ui/list-picker/list-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <ListPicker>data.object;

    if (picker.android && types.isNumber(data.newValue)) {
        if (types.isDefined(picker.items) && types.isNumber(picker.items.length)) {
            picker.android.setMaxValue(picker.items.length - 1);
        }

        picker.android.setValue(data.newValue);
    }
}

(<proxy.PropertyMetadata>common.ListPicker.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <ListPicker>data.object;

    if (picker.android && types.isNumber(data.newValue.length)) {
        picker.android.setMaxValue(data.newValue.length - 1);
        picker.android.setWrapSelectorWheel(false);
    }
}

(<proxy.PropertyMetadata>common.ListPicker.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class ListPicker extends common.ListPicker {
    private _android: android.widget.NumberPicker;

    get android(): android.widget.NumberPicker {
        return this._android;
    }

    constructor() {
        super();
    }

    public _createUI() {
        this._android = new android.widget.NumberPicker(this._context);
        this._android.setMinValue(0);
        this._android.setDescendantFocusability(android.widget.NumberPicker.FOCUS_BLOCK_DESCENDANTS);

        var that = new WeakRef(this);

        this._android.setFormatter(new android.widget.NumberPicker.Formatter({
            get owner(): ListPicker {
                return that.get();
            },

            format: function (index: number) {
                console.log("format(" + index + ")");
                if (this.owner) {
                    return this.owner._getItemAsString(index);
                }

                return index.toString();
            }
        }));

        this._android.setOnValueChangedListener(new android.widget.NumberPicker.OnValueChangeListener({
            get owner() {
                return that.get();
            },

            onValueChange: function (picker: android.widget.NumberPicker, oldVal: number, newVal: number) {
                console.log("onValueChange("+oldVal+", "+newVal+")");
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.ListPicker.selectedIndexProperty, newVal);
                }
            }
        }));

        this._fixDisappearingSelectedItem();        
    }

    private _fixDisappearingSelectedItem() {
        //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
        //dgel's solution doesn't work for me: when I tap on the picker, formatting disappears again.This bug is caused by input filter set on EditText inside NumberPicker when setDisplayValues isn't used. So I came up with this workaround:
        var mInputTextField = java.lang.Class.forName("android.widget.NumberPicker").getDeclaredField("mInputText");
        mInputTextField.setAccessible(true);
        var mInputText = <android.widget.EditText>mInputTextField.get(this._android);
        mInputText.setFilters([]);
    }
} 