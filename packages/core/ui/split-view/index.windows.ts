export * from './split-view-common';

import { SplitViewBase } from './split-view-common';

export class SplitView extends SplitViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.SplitView;
	private _windows: Windows.UI.Xaml.Controls.SplitView;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.SplitView();
	}

	public createNativeView() {
		return this._windows;
	}
}
