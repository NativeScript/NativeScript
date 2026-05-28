export * from './stack-layout-common';

import { StackLayoutBase, orientationProperty } from './stack-layout-common';
import type { ViewCommon } from '../../core/view/view-common';

export class StackLayout extends StackLayoutBase {
    // nativeViewProtected is the Border wrapper — it carries Padding and stretches to fill its parent.
    nativeViewProtected!: Windows.UI.Xaml.Controls.Border;
    private _border!: Windows.UI.Xaml.Controls.Border;
    private _panel!: Windows.UI.Xaml.Controls.StackPanel;

    constructor() {
        super();
        this._border = new Windows.UI.Xaml.Controls.Border();
        this._panel = new Windows.UI.Xaml.Controls.StackPanel();
        this._panel.Orientation = Windows.UI.Xaml.Controls.Orientation.Vertical;
        (this._border as any).Child = this._panel;
    }

    public createNativeView(): Windows.UI.Xaml.Controls.Border {
        return this._border;
    }

    // Children go into the inner StackPanel, not the Border.
    public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
        super._addViewToNativeVisualTree(child, atIndex);
        const nativeChild = (child as any).nativeViewProtected as any;
        if (!nativeChild) return false;
        const children = (this._panel as any).Children;
        if (!children) return false;
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
        const nativeChild = (child as any).nativeViewProtected as any;
        if (nativeChild) {
            const children = (this._panel as any).Children;
            const count: number = children?.Size ?? 0;
            for (let i = 0; i < count; i++) {
                try {
                    if (children.GetAt(i) === nativeChild) {
                        children.RemoveAt(i);
                        break;
                    }
                } catch (_e) {}
            }
        }
        super._removeViewFromNativeVisualTree(child);
    }

    [orientationProperty.setNative](value: 'horizontal' | 'vertical') {
        this._panel.Orientation = value === 'vertical'
            ? Windows.UI.Xaml.Controls.Orientation.Vertical
            : Windows.UI.Xaml.Controls.Orientation.Horizontal;
    }
}
