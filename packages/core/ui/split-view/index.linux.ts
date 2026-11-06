export * from './split-view-common';

import { SplitViewBase } from './split-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class SplitView extends SplitViewBase {
	createNativeView() {
		return gtk_label_new('SplitView');
	}
}
