export * from './tab-view-common';

import { TabViewItemBase, TabViewBase } from './tab-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class TabViewItem extends TabViewItemBase {
	public _update(): void {}
}

export class TabView extends TabViewBase {
	createNativeView() {
		return gtk_label_new('TabView');
	}
}
