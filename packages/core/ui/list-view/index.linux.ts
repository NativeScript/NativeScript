export * from './list-view-common';

import { ListViewBase } from './list-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class ListView extends ListViewBase {
	createNativeView() {
		return gtk_label_new('ListView');
	}
}
