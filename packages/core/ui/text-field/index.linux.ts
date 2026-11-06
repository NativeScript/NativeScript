export * from './text-field-common';

import { TextFieldBase } from './text-field-common';

// TODO(linux): placeholder until the GTK implementation lands
export class TextField extends TextFieldBase {
	createNativeView() {
		return gtk_label_new('TextField');
	}
}
