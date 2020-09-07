import * as listPickerModule from '@nativescript/core/ui/list-picker';

export function getNativeItemsCount(listPicker: listPickerModule.ListPicker): number {
	var maxValue = listPicker.nativeViewProtected.getMaxValue();

	if (listPicker.items.length === 0 && maxValue === 0) {
		return 0;
	}

	return maxValue + 1;
}

export function selectNativeItem(listPicker: listPickerModule.ListPicker, index: number): void {
	var oldIndex = listPicker.selectedIndex;
	listPicker.nativeViewProtected.setValue(index);
	listPicker.nativeViewProtected.valueChangedListener.onValueChange(listPicker.android, oldIndex, index);
}
