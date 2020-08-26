import * as listPickerModule from '@nativescript/core/ui/list-picker';

export function getNativeItemsCount(listPicker: listPickerModule.ListPicker): number {
	return listPicker.ios.numberOfRowsInComponent(0);
}

export function selectNativeItem(listPicker: listPickerModule.ListPicker, index: number): void {
	listPicker.ios.selectRowInComponentAnimated(index, 0, false);
	(<UIPickerViewDelegate>(<any>listPicker)._delegate).pickerViewDidSelectRowInComponent(listPicker.ios, index, 0);
}
