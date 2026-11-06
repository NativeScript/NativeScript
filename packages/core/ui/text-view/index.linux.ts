export * from './text-view-common';

import { TextViewBase } from './text-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class TextView extends TextViewBase {
	createNativeView() {
		return gtk_label_new('TextView');
	}
}
