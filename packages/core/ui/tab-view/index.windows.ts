export * from './tab-view-common';

import { TabViewBase, TabViewItemBase } from './tab-view-common';

export class TabViewItem extends TabViewItemBase {}

export class TabView extends TabViewBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Pivot;
	private _windows: Windows.UI.Xaml.Controls.Pivot;
	private _isPivotAvailable: boolean = true;
	private _selectionHandler: any = null;
	private _selectionHandlerUsedAddListener: boolean = false;

	constructor() {
		super();
		try {
			this._windows = new Windows.UI.Xaml.Controls.Pivot();
			this._isPivotAvailable = true;
		} catch (e) {
			// Pivot not available on this Windows host - use a simple Grid fallback
			console.log('[TabView] Pivot not available, using Grid fallback:', e);
			try {
				this._windows = new Windows.UI.Xaml.Controls.Grid() as any;
			} catch (_e) {
				// last resort: null - createNativeView should still return something
				this._windows = null as any;
			}
			this._isPivotAvailable = false;
		}
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
		// Only wire selection handling if Pivot is present
		if (this._isPivotAvailable) {
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
		}
		this._selectionHandlerUsedAddListener = usedAdd;
	}

	public disposeNativeView(): void {
		try {
			if (this._selectionHandler && this.nativeViewProtected && this._isPivotAvailable) {
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
		if (!newItems) {
			return;
		}

		// If Pivot is available, use Pivot API
		if (this._isPivotAvailable && this.nativeViewProtected && (this.nativeViewProtected as any).Items) {
			try { (this.nativeViewProtected as any).Items.Clear(); } catch (_e) {}

			for (let i = 0; i < newItems.length; i++) {
				const item = newItems[i];
				const pivotItem = new Windows.UI.Xaml.Controls.PivotItem();
				pivotItem.Header = item.title ?? '';
				try {
					if (item.view && (item.view as any).nativeViewProtected) {
						pivotItem.Content = (item.view as any).nativeViewProtected;
					}
				} catch (_e) {}
				try { (this.nativeViewProtected as any).Items.Append(pivotItem); } catch (_e) {}
			}

			// Coerce selected index
			try {
				this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, newItems.length - 1));
				if (this.nativeViewProtected && this.selectedIndex >= 0) {
					try { (this.nativeViewProtected as any).SelectedIndex = this.selectedIndex; } catch (_e) {}
				}
			} catch (_e) {}
			return;
		}

		// Fallback for hosts without Pivot: show only the selected item's native content inside the Grid
		try {
			const children = (this.nativeViewProtected as any)?.Children;
			if (children) {
				const count = children.Size || 0;
				for (let i = count - 1; i >= 0; i--) {
					try { children.RemoveAt(i); } catch (_e) {}
				}
			} else if ((this.nativeViewProtected as any)?.Content !== undefined) {
				try { (this.nativeViewProtected as any).Content = null; } catch (_e) {}
			}
		} catch (_e) {}

		const sel = Math.max(0, Math.min(this.selectedIndex ?? 0, newItems.length - 1));
		const selected = newItems[sel];
		if (selected && selected.view && (selected.view as any).nativeViewProtected) {
			try {
				const nativeChild = (selected.view as any).nativeViewProtected;
				const children = (this.nativeViewProtected as any)?.Children;
				if (children) {
					try { children.Append(nativeChild); } catch (_e) {}
				} else if ((this.nativeViewProtected as any)?.Content !== undefined) {
					try { (this.nativeViewProtected as any).Content = nativeChild; } catch (_e) {}
				}
			} catch (_e) {}
		}
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		super.onSelectedIndexChanged(oldIndex, newIndex);
		try {
			if (this._isPivotAvailable) {
				if (this.nativeViewProtected && newIndex >= 0) {
					try { (this.nativeViewProtected as any).SelectedIndex = newIndex; } catch (_e) {}
				}
			} else {
				// Fallback: replace Grid content with the selected item's native view
				try {
					const children = (this.nativeViewProtected as any)?.Children;
					if (children) {
						const count = children.Size || 0;
						for (let i = count - 1; i >= 0; i--) {
							try { children.RemoveAt(i); } catch (_e) {}
						}
					} else if ((this.nativeViewProtected as any)?.Content !== undefined) {
						try { (this.nativeViewProtected as any).Content = null; } catch (_e) {}
					}
				} catch (_e) {}

				const items = (this.items || []);
				const sel = newIndex >= 0 && newIndex < items.length ? newIndex : 0;
				const selected = items[sel];
				if (selected && selected.view && (selected.view as any).nativeViewProtected) {
					try {
						const nativeChild = (selected.view as any).nativeViewProtected;
						const children = (this.nativeViewProtected as any)?.Children;
						if (children) {
							try { children.Append(nativeChild); } catch (_e) {}
						} else if ((this.nativeViewProtected as any)?.Content !== undefined) {
							try { (this.nativeViewProtected as any).Content = nativeChild; } catch (_e) {}
						}
					} catch (_e) {}
				}
			}
		} catch (_e) {}
	}
}
