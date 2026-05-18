export * from './page-common';

import { PageBase } from './page-common';
import type { View } from '../core/view';

export class Page extends PageBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.Grid;
	private _grid: Windows.UI.Xaml.Controls.Grid;

	constructor() {
		super();
		this._grid = new Windows.UI.Xaml.Controls.Grid();
	}

	public createNativeView() {
		return this._grid;
	}

	public disposeNativeView(): void {
		this._grid = null;
		super.disposeNativeView();
	}

	get windows(): Windows.UI.Xaml.Controls.Grid {
		return this._grid;
	}

	public _addViewToNativeVisualTree(child: View, _atIndex: number): boolean {
		if (this.actionBar && child === (this.actionBar as any)) {
			return true;
		}

		const nativeGrid = this._grid;
		const nativeChild = (child as any).nativeViewProtected as any;

		if (nativeGrid && nativeChild) {
			(nativeGrid as any).Children.Append(nativeChild);
			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		if (this.actionBar && child === (this.actionBar as any)) {
			return;
		}

		if (this._grid) {
			const children = (this._grid as any).Children;
			const count = children?.Size ?? 0;
			for (let i = count - 1; i >= 0; i--) {
				try { children.RemoveAt(i); } catch (_e) {}
			}
		}

		super._removeViewFromNativeVisualTree(child);
	}
}
