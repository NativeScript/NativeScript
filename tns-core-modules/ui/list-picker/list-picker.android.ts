import { ListPickerBase, selectedIndexProperty, itemsProperty } from "./list-picker-common";
import { ItemsSource } from "ui/list-picker";

export * from "./list-picker-common";

@Interfaces([android.widget.NumberPicker.Formatter])
class Formatter implements android.widget.NumberPicker.Formatter {
    constructor(private owner: WeakRef<ListPicker>) {
        return global.__native(this);
    }

    format(index: number): string {
        let owner = this.owner.get();
        if (owner) {
            return owner._getItemAsString(index);
        }

        return " ";
    }
}

@Interfaces([android.widget.NumberPicker.OnValueChangeListener])
class ValueChangeListener implements android.widget.NumberPicker.OnValueChangeListener {
    constructor(private owner: WeakRef<ListPicker>) {
        return global.__native(this);
    }

    onValueChange(picker: android.widget.NumberPicker, oldVal: number, newVal: number): void {
        let owner = this.owner.get();
        if (owner) {
            owner.nativePropertyChanged(selectedIndexProperty, newVal);
        }
    }
}

export class ListPicker extends ListPickerBase {
    private _android: android.widget.NumberPicker;
    private _valueChangedListener: android.widget.NumberPicker.OnValueChangeListener;
    private _formatter: android.widget.NumberPicker.Formatter;
    private _editText: android.widget.EditText;
    private itemsSet: boolean;

    get android(): android.widget.NumberPicker {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.NumberPicker(this._context);
        this._android.setDescendantFocusability(android.widget.NumberPicker.FOCUS_BLOCK_DESCENDANTS);

        this._android.setMinValue(0);
        this._android.setMaxValue(0);
        this._android.setValue(0);

        let formatter = this._formatter || new Formatter(new WeakRef(this));
        this._android.setFormatter(this._formatter);

        let valueChangedListener = this._valueChangedListener || new ValueChangeListener(new WeakRef(this));
        this._android.setOnValueChangedListener(this._valueChangedListener);

        //Fix the disappearing selected item.
        //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
        var mInputTextField = java.lang.Class.forName("android.widget.NumberPicker").getDeclaredField("mInputText");
        mInputTextField.setAccessible(true);
        this._editText = <android.widget.EditText>mInputTextField.get(this._android);
        this._editText.setFilters([]);

        //Since the Android NumberPicker has to always have at least one item, i.e. minValue=maxValue=value=0, we don't want this zero showing up when this.items is empty.
        this._editText.setText(" ", android.widget.TextView.BufferType.NORMAL);

        this.android.setWrapSelectorWheel(false);
    }

    private updateSelectedValue(): void {
        let selectedIndex = this.getSelectedIndex(this.items);
        this.android.setValue(selectedIndex);
    }

    private onItemsPropertyChanged(items: any[] | ItemsSource) {
        let maxValue = items && items.length > 0 ? items.length - 1 : 0;

        this.android.setMaxValue(maxValue);
        this.updateSelectedValue();

        this._fixNumberPickerRendering();
    }

    private _fixNumberPickerRendering() {
        //HACK: Force the stubborn NumberPicker to render correctly when we have 0 or 1 items.
        this.android.setFormatter(null);
        this.android.setFormatter(this._formatter); //Force the NumberPicker to call our Formatter 
        if (this._editText) {
            this._editText.setFilters([]);
        }
        this._editText.invalidate(); //Force the EditText to redraw
        this.android.invalidate();
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        if (this.itemsSet) {
            this.updateSelectedValue();
        }
    }

    get [itemsProperty.native](): any[] {
        return null;
    }
    set [itemsProperty.native](value: any[] | ItemsSource) {
        this.onItemsPropertyChanged(value);
        // items are cleared - set selectedIndex to -1
        if (!value) {
            this.itemsSet = false;
            this.selectedIndex = -1;
        } else if (this.selectedIndex < 0) {
            // items are set and selectedIndex is set - update maxValue & value.
            this.selectedIndex = 0;
            // set this flag later so no native call happens
            this.itemsSet = true;
        }
    }
}
