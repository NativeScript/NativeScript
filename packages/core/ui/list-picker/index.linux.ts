export * from './list-picker-common';

import { ListPickerBase } from './list-picker-common';

// TODO(linux): placeholder until the GTK implementation lands
export class ListPicker extends ListPickerBase {
	createNativeView() {
		return gtk_label_new('ListPicker');
	}
}
