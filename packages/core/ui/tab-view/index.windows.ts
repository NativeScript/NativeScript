export * from './tab-view-common';

import { TabViewBase, TabViewItemBase } from './tab-view-common';

const TAB_HEIGHT = 48;

export class TabViewItem extends TabViewItemBase {
	public _update(): void {
		const parent = this.parent as TabView;
		if (!parent) return;
		parent._updateTabButton(this as any);
	}
}

export class TabView extends TabViewBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.Grid;

	private _outerGrid: Windows.UI.Xaml.Controls.Grid;
	private _tabStrip: Windows.UI.Xaml.Controls.StackPanel;
	private _contentArea: Windows.UI.Xaml.Controls.Grid;
	private _tabButtons: Windows.UI.Xaml.Controls.Button[] = [];

	constructor() {
		super();

		this._outerGrid = new Windows.UI.Xaml.Controls.Grid();

		const r0 = new Windows.UI.Xaml.Controls.RowDefinition();
		r0.Height = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.Auto);
		const r1 = new Windows.UI.Xaml.Controls.RowDefinition();
		r1.Height = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.Star);
		this._outerGrid.RowDefinitions.Append(r0);
		this._outerGrid.RowDefinitions.Append(r1);

		this._tabStrip = new Windows.UI.Xaml.Controls.StackPanel();
		this._tabStrip.Orientation = Windows.UI.Xaml.Controls.Orientation.Horizontal;
		Windows.UI.Xaml.Controls.Grid.SetRow(this._tabStrip, 0);
		this._outerGrid.Children.Append(this._tabStrip);

		this._contentArea = new Windows.UI.Xaml.Controls.Grid();
		Windows.UI.Xaml.Controls.Grid.SetRow(this._contentArea, 1);
		this._outerGrid.Children.Append(this._contentArea);
	}

	public createNativeView() {
		return this._outerGrid;
	}

	get windows(): Windows.UI.Xaml.Controls.Grid {
		return this._outerGrid;
	}


	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof TabViewItemBase) {
			(value as any).canBeLoaded = true;
		}
		super._addChildFromBuilder(name, value);
		if (value instanceof TabViewItemBase) {
			this._rebuildTabStrip();
		}
	}

	// 
	public onItemsChanged(oldItems: any[], newItems: any[]): void {
		this._clearTabButtons();
		this._tabStrip.Children.Clear();
		this._clearContent();

		if (newItems) {
			for (const item of newItems) {
				(item as any).canBeLoaded = true;
			}
		}

		super.onItemsChanged(oldItems, newItems);

		if (!newItems) return;

		this._rebuildTabStrip();

		if (this.isLoaded) {
			this._showContent(Math.max(0, this.selectedIndex ?? 0));
		}
	}

	public onLoaded(): void {
		super.onLoaded();
		this._clearContent();
		const idx = Math.max(0, this.selectedIndex ?? 0);
		this._showContent(idx);
		this._highlightTab(idx);
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		super.onSelectedIndexChanged(oldIndex, newIndex);
		this._clearContent();
		this._showContent(newIndex);
		this._highlightTab(newIndex);
	}

	public disposeNativeView(): void {
		this._clearTabButtons();
		super.disposeNativeView();
	}

	public _updateTabButton(item: TabViewItemBase): void {
		if (!this.items) return;
		const idx = this.items.indexOf(item as any);
		if (idx >= 0 && idx < this._tabButtons.length) {
			try { (this._tabButtons[idx] as any).Content = item.title ?? ''; } catch (_e) { }
		}
	}

	private _rebuildTabStrip(): void {
		this._clearTabButtons();
		this._tabStrip.Children.Clear();
		const items = this.items;
		if (!items) return;
		for (let i = 0; i < items.length; i++) {
			this._createTabButton(items[i], i);
		}
		this._highlightTab(Math.max(0, this.selectedIndex ?? 0));
	}

	private _createTabButton(item: any, index: number): void {
		try {
			const btn = new Windows.UI.Xaml.Controls.Button();
			btn.Content = item.title ?? '';
			btn.MinWidth = 80;
			btn.Height = TAB_HEIGHT;

			const that = new WeakRef(this);
			const fn = () => {
				const owner = that.deref();
				if (owner) owner.selectedIndex = index;
			};
			let handler: any;
			try {
				handler = new Windows.UI.Xaml.RoutedEventHandler(fn);
			} catch (_e) {
				handler = fn;
			}
			try { btn.Click = handler as never; } catch (_e) { }

			this._tabButtons[index] = btn;
			this._tabStrip.Children.Append(btn);
		} catch (_e) { }
	}

	private _clearTabButtons(): void {
		for (const btn of this._tabButtons) {
			try { if (btn) btn.Click = null as never; } catch (_e) { }
		}
		this._tabButtons = [];
	}

	private _clearContent(): void {
		try {
			const count = (this._contentArea as any).Children.Size;
			for (let i = count - 1; i >= 0; i--) {
				try { (this._contentArea as any).Children.RemoveAt(i); } catch (_e) { }
			}
		} catch (_e) { }
	}

	private _showContent(index: number): void {
		const items = this.items;
		if (!items || index < 0 || index >= items.length) return;
		const native = (items[index] as any)?.view?.nativeViewProtected;
		if (native) {
			try { (this._contentArea as any).Children.Append(native); } catch (_e) { }
		}
	}

	private _highlightTab(selectedIndex: number): void {
		for (let i = 0; i < this._tabButtons.length; i++) {
			const btn = this._tabButtons[i];
			if (!btn) continue;
			try {
				(btn as any).FontWeight = i === selectedIndex
					? Windows.UI.Text.FontWeights.Bold
					: Windows.UI.Text.FontWeights.Normal;
			} catch (_e) { }
		}
	}
}
