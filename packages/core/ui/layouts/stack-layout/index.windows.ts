export * from './stack-layout-common';

import { StackLayoutBase, orientationProperty } from './stack-layout-common';

export class StackLayout extends StackLayoutBase {
    nativeViewProtected: Windows.UI.Xaml.Controls.StackPanel;
    private _windows: Windows.UI.Xaml.Controls.StackPanel;

    constructor() {
        super();
        this._windows = new Windows.UI.Xaml.Controls.StackPanel();
        this._windows.Orientation = Windows.UI.Xaml.Controls.Orientation.Vertical;
    }

    public createNativeView() {
        return this._windows;
    }

    [orientationProperty.setNative](value: 'horizontal' | 'vertical') {
        this._windows.Orientation = value === 'vertical' ? Windows.UI.Xaml.Controls.Orientation.Vertical : Windows.UI.Xaml.Controls.Orientation.Horizontal;
    }
}
