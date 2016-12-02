import common = require("./list-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import utils = require("utils/utils")
import * as types from "utils/types";
import { Styler, colorProperty, registerHandler, StylePropertyChangedHandler } from "ui/styling/style";
import { View } from "ui/core/view";

global.moduleMerge(common, exports);

export class ListPicker extends common.ListPicker {
    private _android: android.widget.NumberPicker;
    private _valueChangedListener: android.widget.NumberPicker.OnValueChangeListener;
    private _formatter: android.widget.NumberPicker.Formatter;
    private _editText: android.widget.EditText;

    get android(): android.widget.NumberPicker {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.NumberPicker(this._context);
        this._android.setDescendantFocusability(android.widget.NumberPicker.FOCUS_BLOCK_DESCENDANTS);

        this._android.setMinValue(0);
        this._android.setMaxValue(0);
        this._android.setValue(0);

        var that = new WeakRef(this);

        this._formatter = new android.widget.NumberPicker.Formatter(
            <utils.Owned & android.widget.NumberPicker.IFormatter>{
                get owner(): ListPicker {
                    return that.get();
                },

                format: function (index: number) {
                    if (this.owner) {
                        return this.owner._getItemAsString(index);
                    }

                    return " ";
                }
            });
        this._android.setFormatter(this._formatter);

        this._valueChangedListener = new android.widget.NumberPicker.OnValueChangeListener(<utils.Owned & android.widget.NumberPicker.IOnValueChangeListener>{
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

        //Fix the disappearing selected item.
        //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
        var mInputTextField = java.lang.Class.forName("android.widget.NumberPicker").getDeclaredField("mInputText");
        mInputTextField.setAccessible(true);
        this._editText = <android.widget.EditText>mInputTextField.get(this._android);
        this._editText.setFilters([]);

        //Since the Android NumberPicker has to always have at least one item, i.e. minValue=maxValue=value=0, we don't want this zero showing up when this.items is empty.
        this._editText.setText(" ", android.widget.TextView.BufferType.NORMAL);
    }

    public _onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChanged(data);
        if (this.android && types.isNumber(data.newValue)) {
            this.android.setValue(data.newValue);
        }
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            if (!data.newValue || !data.newValue.length) {
                this.android.setMaxValue(0);
            }
            else {
                this.android.setMaxValue(data.newValue.length - 1);
            }

            this.android.setWrapSelectorWheel(false);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);

        this._fixNumberPickerRendering();
    }

    private _fixNumberPickerRendering() {
        if (!this.android) {
            return;
        }

        //HACK: Force the stubborn NumberPicker to render correctly when we have 0 or 1 items.
        this.android.setFormatter(null);
        this.android.setFormatter(this._formatter); //Force the NumberPicker to call our Formatter 
        if (this._editText) {
            this._editText.setFilters([]);
        }
        this._editText.invalidate(); //Force the EditText to redraw
        this.android.invalidate();
    }
}

export class ListPickerStyler implements Styler {
    // color
    private static setColorProperty(view: View, newValue: any) {
        var picker = <android.widget.NumberPicker>view._nativeView;
        ListPickerStyler._setNumberPickerTextColor(picker, newValue);
    }

    private static resetColorProperty(view: View, nativeValue: any) {
        var picker = <android.widget.NumberPicker>view._nativeView;
        ListPickerStyler._setNumberPickerTextColor(picker, nativeValue);
    }

    public static registerHandlers() {
        registerHandler(colorProperty, new StylePropertyChangedHandler(
            ListPickerStyler.setColorProperty,
            ListPickerStyler.resetColorProperty), "ListPicker");
    }

    private static _setNumberPickerTextColor(picker: android.widget.NumberPicker, newValue: any) {
        let childrenCount = picker.getChildCount();

        for (let i = 0; i < childrenCount; i++) {
            let child = picker.getChildAt(i);
            if (child instanceof android.widget.EditText) {
                let selectorWheelPaintField = picker.getClass().getDeclaredField("mSelectorWheelPaint");
                selectorWheelPaintField.setAccessible(true);

                selectorWheelPaintField.get(picker).setColor(newValue);
                (<android.widget.EditText>picker.getChildAt(i)).setTextColor(newValue);
            }
        }
    }
}

ListPickerStyler.registerHandlers();