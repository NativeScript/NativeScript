import * as listPickerModule from "tns-core-modules/ui/list-picker";

export function getNativeItemsCount(listPicker: listPickerModule.ListPicker): number {
    var maxValue = listPicker.nativeView.getMaxValue();

    if (listPicker.items.length === 0 && maxValue === 0) {
        return 0;
    }

    return maxValue + 1;
}

export function selectNativeItem(listPicker: listPickerModule.ListPicker, index: number): void {
    var oldIndex = listPicker.selectedIndex;
    listPicker.nativeView.setValue(index);
    listPicker.nativeView.valueChangedListener.onValueChange(listPicker.android, oldIndex, index);
}