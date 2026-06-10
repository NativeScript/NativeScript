export * from './page-common';

import { PageBase } from './page-common';
import type { View } from '../core/view';

export class Page extends PageBase {
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.Grid;
	private _grid: Microsoft.UI.Xaml.Controls.Grid;

	public createNativeView(): Microsoft.UI.Xaml.Controls.Grid {
		this._grid = new Microsoft.UI.Xaml.Controls.Grid();
		return this._grid;
	}

	public disposeNativeView(): void {
		this._grid = null;
		super.disposeNativeView();
	}

	get windows(): Microsoft.UI.Xaml.Controls.Grid {
		return this._grid;
	}

	public _addViewToNativeVisualTree(child: View, _atIndex: number): boolean {
		if (this.actionBar && child === (this.actionBar as unknown as View)) {
			return true;
		}

		const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
		if (this._grid && nativeChild) {
			this._grid.Children.Append(nativeChild);
			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		if (this.actionBar && child === (this.actionBar as unknown as View)) {
			return;
		}

		if (this._grid) {
			const children = this._grid.Children;
			for (let i = children.Size - 1; i >= 0; i--) {
				try { children.RemoveAt(i); } catch (_e) {}
			}
		}

		super._removeViewFromNativeVisualTree(child);
	}
}
