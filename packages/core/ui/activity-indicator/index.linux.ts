export * from './activity-indicator-common';

import { ActivityIndicatorBase } from './activity-indicator-common';

// TODO(linux): placeholder until the GTK implementation lands
export class ActivityIndicator extends ActivityIndicatorBase {
	createNativeView() {
		return gtk_label_new('ActivityIndicator');
	}
}
