import { RootLayoutBase } from './root-layout-common';
import { View } from '../../core/view';

export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	constructor() {
		super();
	}

	protected _bringToFront(view: View) {
		(<android.view.View>view.nativeViewProtected).bringToFront();
	}
}
