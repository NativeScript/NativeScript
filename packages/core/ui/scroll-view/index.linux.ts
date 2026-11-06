export * from './scroll-view-common';

import { ScrollViewBase } from './scroll-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class ScrollView extends ScrollViewBase {
	createNativeView() {
		return gtk_label_new('ScrollView');
	}

	public scrollToVerticalOffset(value: number, animated: boolean) {}

	public scrollToHorizontalOffset(value: number, animated: boolean) {}

	public _onOrientationChanged() {}
}
