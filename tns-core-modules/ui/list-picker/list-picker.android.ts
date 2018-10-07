import { ListPickerBase, selectedIndexProperty, itemsProperty, colorProperty, Color } from "./list-picker-common";
import { ItemsSource } from ".";

export * from "./list-picker-common";

interface Formatter {
    new (owner: ListPicker): android.widget.NumberPicker.Formatter;
}

interface ValueChangeListener {
    new (owner: ListPicker): android.widget.NumberPicker.OnValueChangeListener;
}

let Formatter: Formatter;
let ValueChangeListener: ValueChangeListener;

function initializeNativeClasses(): void {
    if (Formatter) {
        return;
    }

    @Interfaces([android.widget.NumberPicker.Formatter])
    class FormatterImpl extends java.lang.Object implements android.widget.NumberPicker.Formatter {
        constructor(private owner: ListPicker) {
            super();
            return global.__native(this);
        }

        format(index: number): string {
            return this.owner._getItemAsString(index);
        }
    }

    @Interfaces([android.widget.NumberPicker.OnValueChangeListener])
    class ValueChangeListenerImpl extends java.lang.Object implements android.widget.NumberPicker.OnValueChangeListener {
        constructor(private owner: ListPicker) {
            super();
            return global.__native(this);
        }

        onValueChange(picker: android.widget.NumberPicker, oldValue: number, newValue: number): void {
            selectedIndexProperty.nativeValueChange(this.owner, newValue);
            this.owner.updateSelectedValue(newValue);
        }
    }

    Formatter = FormatterImpl;
    ValueChangeListener = ValueChangeListenerImpl;
}

function getEditText(picker: android.widget.NumberPicker): android.widget.EditText {
    for (let i = 0, count = picker.getChildCount(); i < count; i++) {
        let child = picker.getChildAt(i);
        if (child instanceof android.widget.EditText) {
            return child;
        }
    }

    return null;
}

let selectorWheelPaintField: java.lang.reflect.Field;
function getSelectorWheelPaint(picker: android.widget.NumberPicker): android.graphics.Paint {
    if (!selectorWheelPaintField) {
        selectorWheelPaintField = picker.getClass().getDeclaredField("mSelectorWheelPaint");
        selectorWheelPaintField.setAccessible(true);
    }

    return selectorWheelPaintField.get(picker);
}

export class ListPicker extends ListPickerBase {
    nativeViewProtected: android.widget.NumberPicker;
    private _selectorWheelPaint: android.graphics.Paint;

    public createNativeView() {
        const picker = new android.widget.NumberPicker(this._context);
        picker.setDescendantFocusability(android.widget.NumberPicker.FOCUS_BLOCK_DESCENDANTS);
        picker.setMinValue(0);
        picker.setMaxValue(0);
        picker.setValue(0);
        picker.setWrapSelectorWheel(false);
        return picker;
    }

    public initNativeView(): void {
        super.initNativeView();
        initializeNativeClasses();
        const nativeView = this.nativeViewProtected;
        this._selectorWheelPaint = getSelectorWheelPaint(nativeView);
        const formatter = new Formatter(this);
        nativeView.setFormatter(formatter);
        (<any>nativeView).formatter = formatter;

        const valueChangedListener = new ValueChangeListener(this);
        nativeView.setOnValueChangedListener(valueChangedListener);
        (<any>nativeView).valueChangedListener = valueChangedListener;

        const editText = getEditText(nativeView);
        if (editText) {
            (<any>nativeView).editText = editText;
            //Fix the disappearing selected item.
            //HACK: http://stackoverflow.com/questions/17708325/android-numberpicker-with-formatter-does-not-format-on-first-rendering/26797732
            editText.setFilters([]);

            //Since the Android NumberPicker has to always have at least one item, i.e. minValue=maxValue=value=0, we don't want this zero showing up when this.items is empty.
            editText.setText(" ", android.widget.TextView.BufferType.NORMAL);
        }
    }

    public disposeNativeView() {
        const nativeView = this.nativeViewProtected;
        (<any>nativeView).formatter.owner = null;
        (<any>nativeView).valueChangedListener.owner = null;
        super.disposeNativeView();
    }

    private _fixNumberPickerRendering() {
        const nativeView = this.nativeViewProtected;
        //HACK: Force the stubborn NumberPicker to render correctly when we have 0 or 1 items.
        nativeView.setFormatter(null);
        nativeView.setFormatter((<any>nativeView).formatter); //Force the NumberPicker to call our Formatter 

        const editText = (<any>nativeView).editText;
        if (editText) {
            editText.setFilters([]);
            editText.invalidate(); //Force the EditText to redraw
        }
        nativeView.invalidate();
    }

    [selectedIndexProperty.getDefault](): number {
        return -1;
    }
    [selectedIndexProperty.setNative](value: number) {
        if (value >= 0) {
            this.nativeViewProtected.setValue(value);
        }
    }

    [itemsProperty.getDefault](): any[] {
        return null;
    }
    [itemsProperty.setNative](value: any[] | ItemsSource) {
        let maxValue = value && value.length > 0 ? value.length - 1 : 0;
        this.nativeViewProtected.setMaxValue(maxValue);
        this._fixNumberPickerRendering();

        // Coerce selected index after we have set items to native view.
        selectedIndexProperty.coerce(this);
    }

    [colorProperty.getDefault](): { wheelColor: number, textColor: number } {
    const editText = (<any>this.nativeViewProtected).editText;
        return {
            wheelColor: this._selectorWheelPaint.getColor(),
            textColor: editText ? editText.getTextColors().getDefaultColor() : -1
        }
    }
    [colorProperty.setNative](value: { wheelColor: number, textColor: number } | Color) {
        let color: number;
        let wheelColor: number;
        if (value instanceof Color) {
            color = wheelColor = value.android;
        } else {
            color = value.textColor;
            wheelColor = value.wheelColor;
        }

        this._selectorWheelPaint.setColor(wheelColor);
        const editText = (<any>this.nativeViewProtected).editText;
        if (editText) {
            editText.setTextColor(color);
        }
    }
}
