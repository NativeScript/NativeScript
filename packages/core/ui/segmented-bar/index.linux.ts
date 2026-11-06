export * from './segmented-bar-common';

import { SegmentedBarItemBase, SegmentedBarBase } from './segmented-bar-common';

// TODO(linux): placeholder until the GTK implementation lands
export class SegmentedBarItem extends SegmentedBarItemBase {
	public _update(): void {}
}

export class SegmentedBar extends SegmentedBarBase {
	createNativeView() {
		return gtk_label_new('SegmentedBar');
	}
}
