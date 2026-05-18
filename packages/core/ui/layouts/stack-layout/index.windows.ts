export * from './stack-layout-common';

import { StackLayoutBase, orientationProperty } from './stack-layout-common';

export class StackLayout extends StackLayoutBase {
    nativeViewProtected: Windows.UI.Xaml.Controls.StackPanel;
    private _windows: Windows.UI.Xaml.Controls.StackPanel;

    constructor() {
        super();
        this._windows = new Windows.UI.Xaml.Controls.StackPanel();
        // apply default orientation
        try {
            this._windows.Orientation = Windows.UI.Xaml.Controls.Orientation.vertical;
        } catch (_e) {}
    }

    public createNativeView() {
        return this._windows;
    }

    [orientationProperty.setNative](value: 'horizontal' | 'vertical') {
        try {
            this._windows.Orientation = value === 'vertical' ? Windows.UI.Xaml.Controls.Orientation.vertical : Windows.UI.Xaml.Controls.Orientation.horizontal;
        } catch (_e) {}
    }
}
