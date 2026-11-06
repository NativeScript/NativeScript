export * from './progress-common';

import { ProgressBase } from './progress-common';

// TODO(linux): placeholder until the GTK implementation lands
export class Progress extends ProgressBase {
	createNativeView() {
		return gtk_label_new('Progress');
	}
}
