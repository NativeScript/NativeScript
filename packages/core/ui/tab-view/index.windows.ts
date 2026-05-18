export * from './tab-view-common';

import { TabViewBase, TabViewItemBase } from './tab-view-common';

export class TabViewItem extends TabViewItemBase {}

export class TabView extends TabViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Pivot;
	private _windows: Windows.UI.Xaml.Controls.Pivot;
	private _selectionHandler: any = null;
	private _selectionHandlerUsedAddListener: boolean = false;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Pivot();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.Pivot {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		let usedAdd = false;
		try {
			this._selectionHandler = new Windows.UI.Xaml.Controls.SelectionChangedEventHandler((s, e) => {
				const owner = that.deref();
				if (!owner) return;
				try {
					const native = owner.nativeViewProtected as any;
					const idx = native.SelectedIndex;
					owner.selectedIndex = idx;
				} catch (_e) {}
			});
			try {
				this.nativeViewProtected.SelectionChanged = this._selectionHandler as never;
			} catch (_e) {}
		} catch (_e) {
			this._selectionHandler = (s: any, e: any) => {
				const owner = that.deref();
				if (!owner) return;
				try {
					const native = owner.nativeViewProtected as any;
					const idx = native.SelectedIndex;
					owner.selectedIndex = idx;
				} catch (_e) {}
			};
			try {
				this.nativeViewProtected.SelectionChanged = this._selectionHandler as never;
			} catch (_e2) {
				try {
					if (typeof (this.nativeViewProtected as any).addEventListener === 'function') {
						(this.nativeViewProtected as any).addEventListener('selectionchanged', this._selectionHandler);
						usedAdd = true;
					}
				} catch (_e3) {}
			}
		}
		this._selectionHandlerUsedAddListener = usedAdd;
	}

	public disposeNativeView(): void {
		try {
			if (this._selectionHandler && this.nativeViewProtected) {
				try { this.nativeViewProtected.SelectionChanged = null as never; } catch (_e) {}
				if (this._selectionHandlerUsedAddListener) {
					try { (this.nativeViewProtected as any).removeEventListener('selectionchanged', this._selectionHandler); } catch (_e) {}
				}
				this._selectionHandler = null;
				this._selectionHandlerUsedAddListener = false;
			}
		} catch (_e) {}

		super.disposeNativeView();
	}

	public onItemsChanged(oldItems: any[], newItems: any[]): void {
		// remove old
		if (this.nativeViewProtected) {
			try {
				this.nativeViewProtected.Items.Clear();
			} catch (_e) {}
		}

		if (!newItems) {
			return;
		}

		for (let i = 0; i < newItems.length; i++) {
			const item = newItems[i];
			const pivotItem = new Windows.UI.Xaml.Controls.PivotItem();
			pivotItem.Header = item.title ?? '';

			// Attach view's native element if present
			try {
				if (item.view && (item.view as any).nativeViewProtected) {
					pivotItem.Content = (item.view as any).nativeViewProtected;
				}
			} catch (_e) {}

			this.nativeViewProtected.Items.Append(pivotItem);
		}

		// Coerce selected index
		try {
			this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, newItems.length - 1));
			if (this.nativeViewProtected && this.selectedIndex >= 0) {
				this.nativeViewProtected.SelectedIndex = this.selectedIndex;
			}
		} catch (_e) {}
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		super.onSelectedIndexChanged(oldIndex, newIndex);
		try {
			if (this.nativeViewProtected && newIndex >= 0) {
				this.nativeViewProtected.SelectedIndex = newIndex;
			}
		} catch (_e) {}
	}
}
