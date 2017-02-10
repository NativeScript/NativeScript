import * as listPickerModule from "ui/list-picker";

export function getNativeItemsCount(listPicker: listPickerModule.ListPicker): number {
    var maxValue = listPicker.android.getMaxValue();

    if (listPicker.items.length === 0 && maxValue === 0) {
        return 0;
    }

    return maxValue + 1;
}

export function selectNativeItem(listPicker: listPickerModule.ListPicker, index: number): void {
    var oldIndex = listPicker.selectedIndex;
    listPicker.android.setValue(index);
    (<any>listPicker)._valueChangedListener.onValueChange(listPicker.android, oldIndex, index);
}