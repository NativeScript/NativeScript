export * from './switch-common';

import { SwitchBase } from './switch-common';

// TODO(linux): placeholder until the GTK implementation lands
export class Switch extends SwitchBase {
	createNativeView() {
		return gtk_label_new('Switch');
	}
}
