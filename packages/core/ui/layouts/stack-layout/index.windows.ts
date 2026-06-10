export * from './stack-layout-common';

import { StackLayoutBase, orientationProperty } from './stack-layout-common';
import type { ViewCommon } from '../../core/view/view-common';

export class StackLayout extends StackLayoutBase {
    // Border wrapper carries Padding; the inner NativeScript.Widgets.StackLayout (C++/WinRT, no DotNetBridge)
    // does the actual measure/arrange. The Border can be dropped once the native panel handles padding.
    nativeViewProtected!: Microsoft.UI.Xaml.Controls.Border;
    private _border!: Microsoft.UI.Xaml.Controls.Border;
    private _panel!: NativeScript.Widgets.StackLayout;

    constructor() {
        super();
        // WinRT deferred to createNativeView() — keeps constructor pure-JS.
    }

    public createNativeView(): Microsoft.UI.Xaml.Controls.Border {
        this._border = new Microsoft.UI.Xaml.Controls.Border();
        this._panel = new NativeScript.Widgets.StackLayout();
        this._panel.Orientation = 0; // 0 = Vertical
        this._border.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
        this._border.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Stretch;
        this._panel.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
        this._panel.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Top;
        this._border.Child = this._panel;
        return this._border;
    }

    // Children go into the inner panel, not the Border.
    public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
        super._addViewToNativeVisualTree(child, atIndex);
        const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
        if (!nativeChild) return false;
        const children = this._panel.Children;
        if (!children) return false;
        nativeChild.HorizontalAlignment = Microsoft.UI.Xaml.HorizontalAlignment.Stretch;
        nativeChild.VerticalAlignment = Microsoft.UI.Xaml.VerticalAlignment.Top;
        // InsertAt/Append cross the WinRT collection projection and can throw.
        try {
            const size: number = children.Size;
            if (atIndex >= 0 && atIndex < size && atIndex < Number.MAX_SAFE_INTEGER) {
                children.InsertAt(atIndex, nativeChild);
            } else {
                children.Append(nativeChild);
            }
            return true;
        } catch {
            return false;
        }
    }

    public _removeViewFromNativeVisualTree(child: ViewCommon): void {
        const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
        if (nativeChild) {
            const children = this._panel.Children;
            const count: number = children?.Size ?? 0;
            for (let i = 0; i < count; i++) {
                if (children.GetAt(i) === nativeChild) {
                    children.RemoveAt(i);
                    break;
                }
            }
        }
        super._removeViewFromNativeVisualTree(child);
    }

    [orientationProperty.setNative](value: 'horizontal' | 'vertical') {
        this._panel.Orientation = value === 'vertical' ? 0 : 1;
    }
}
