export * from './html-view-common';

import { HtmlViewBase } from './html-view-common';

// TODO(linux): placeholder until the GTK implementation lands
export class HtmlView extends HtmlViewBase {
	createNativeView() {
		return gtk_label_new('HtmlView');
	}
}
