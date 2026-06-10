export * from './tab-view-common';

import { TabViewBase, TabViewItemBase } from './tab-view-common';
import { ImageSource } from '../../image-source';
import { knownFolders, path as fsPath } from '../../file-system';

const TAB_HEIGHT = 48;

// Resolves a tab `iconSource` (res://, ~/, file/abs path, http(s)) to a native bitmap and applies it.
function resolveIconBitmap(src: string, apply: (bmp: any) => void): void {
	if (!src) return;
	try {
		if (src.indexOf('res://') === 0) {
			const imgSrc = ImageSource.fromResourceSync(src.substring('res://'.length)) as any;
			if (imgSrc?.windows) apply(imgSrc.windows);
		} else if (src.indexOf('~/') === 0) {
			const filePath = fsPath.join(knownFolders.currentApp().path, src.replace('~/', ''));
			const imgSrc = ImageSource.fromFileSync(filePath) as any;
			if (imgSrc?.windows) apply(imgSrc.windows);
		} else if (src.indexOf('http') === 0) {
			ImageSource.fromUrl(src).then((imgSrc: any) => { if (imgSrc?.windows) apply(imgSrc.windows); }).catch(() => {});
		} else {
			const imgSrc = ImageSource.fromFileSync(src) as any;
			if (imgSrc?.windows) apply(imgSrc.windows);
		}
	} catch (_e) {}
}

export class TabViewItem extends TabViewItemBase {
	public _update(): void {
		const parent = this.parent as TabView;
		if (!parent) return;
		parent._updateTabButton(this as any);
	}
}

export class TabView extends TabViewBase {
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.Grid;

	private _outerGrid: Microsoft.UI.Xaml.Controls.Grid;
	private _tabStrip: Microsoft.UI.Xaml.Controls.StackPanel;
	private _contentArea: Microsoft.UI.Xaml.Controls.Grid;
	private _tabButtons: Microsoft.UI.Xaml.Controls.Button[] = [];
	// Held to prevent V8 from GC'ing the JS wrappers (a collected delegate goes dead on click).
	private _tabButtonDelegates: any[] = [];

	public createNativeView(): Microsoft.UI.Xaml.Controls.Grid {
		this._outerGrid = new Microsoft.UI.Xaml.Controls.Grid();

		const r0 = new Microsoft.UI.Xaml.Controls.RowDefinition();
		r0.Height = new Microsoft.UI.Xaml.GridLength(1, Microsoft.UI.Xaml.GridUnitType.Auto);
		const r1 = new Microsoft.UI.Xaml.Controls.RowDefinition();
		r1.Height = new Microsoft.UI.Xaml.GridLength(1, Microsoft.UI.Xaml.GridUnitType.Star);
		this._outerGrid.RowDefinitions.Append(r0);
		this._outerGrid.RowDefinitions.Append(r1);

		this._tabStrip = new Microsoft.UI.Xaml.Controls.StackPanel();
		this._tabStrip.Orientation = Microsoft.UI.Xaml.Controls.Orientation.Horizontal;
		Microsoft.UI.Xaml.Controls.Grid.SetRow(this._tabStrip, 0);
		this._outerGrid.Children.Append(this._tabStrip);

		this._contentArea = new Microsoft.UI.Xaml.Controls.Grid();
		Microsoft.UI.Xaml.Controls.Grid.SetRow(this._contentArea, 1);
		this._outerGrid.Children.Append(this._contentArea);

		return this._outerGrid;
	}

	get windows(): Microsoft.UI.Xaml.Controls.Grid {
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

	public initNativeView(): void {
		super.initNativeView();
		this._rebuildTabStrip();
	}

	public onItemsChanged(oldItems: any[], newItems: any[]): void {
		this._clearTabButtons();
		if (this._tabStrip) this._tabStrip.Children.Clear();
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
			this._tabButtons[idx].Content = this._buildButtonContent(item);
		}
	}

	// WinUI Button shows only its string Content unless given a UIElement, so an icon-only tab
	// needs an Image element; if both title and icon are present they are stacked vertically.
	private _buildButtonContent(item: any): any {
		const title: string = item?.title ?? '';
		const iconSrc: string = item?.iconSource;
		if (!iconSrc) {
			return title;
		}
		const img = new Microsoft.UI.Xaml.Controls.Image();
		img.Width = 24;
		img.Height = 24;
		img.Stretch = 2 as never; // Uniform
		resolveIconBitmap(iconSrc, (bmp) => { try { img.Source = bmp; } catch (_e) {} });
		if (!title) {
			return img;
		}
		const stack = new Microsoft.UI.Xaml.Controls.StackPanel();
		stack.Orientation = Microsoft.UI.Xaml.Controls.Orientation.Vertical;
		stack.HorizontalAlignment = 1 as never; // Center
		const tb = new Microsoft.UI.Xaml.Controls.TextBlock();
		tb.Text = title;
		tb.FontSize = 12;
		tb.HorizontalAlignment = 1 as never; // Center
		stack.Children.Append(img);
		stack.Children.Append(tb);
		return stack;
	}

	private _rebuildTabStrip(): void {
		if (!this._tabStrip) return;
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
		const btn = new Microsoft.UI.Xaml.Controls.Button();
		btn.Content = this._buildButtonContent(item);
		btn.MinWidth = 80;
		btn.Height = TAB_HEIGHT;

		const that = new WeakRef(this);
		const fn = () => {
			const owner = that.deref();
			if (owner) owner.selectedIndex = index;
		};
		const del = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', fn);
		btn.Click = del as never;
		this._tabButtonDelegates[index] = del;

		this._tabButtons[index] = btn;
		this._tabStrip.Children.Append(btn);
	}

	private _clearTabButtons(): void {
		for (const btn of this._tabButtons) {
			if (btn) btn.Click = null as never;
		}
		this._tabButtons = [];
		this._tabButtonDelegates = [];
	}

	private _clearContent(): void {
		if (!this._contentArea) return;
		const children = this._contentArea.Children;
		for (let i = children.Size - 1; i >= 0; i--) {
			try { children.RemoveAt(i); } catch (_e) {}
		}
	}

	private _showContent(index: number): void {
		if (!this._contentArea) return;
		const items = this.items;
		if (!items || index < 0 || index >= items.length) return;
		const item = items[index] as any;
		const view = item?.view;
		const native = view?.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
		if (native) {
			try {
				native.HorizontalAlignment = 3 as never; // Stretch
				native.VerticalAlignment = 3 as never; // Stretch
				this._contentArea.Children.Append(native);
			} catch (_e) {
				console.error('[TabView] _showContent: failed to append native view for tab', index, _e);
			}
			// Ensure the NS view is marked loaded so Repeaters flush _isDirty and bindings
			// propagate. super.onLoaded() loads all tabs, but if something races (e.g. items
			// set after the first load), this guarantees the shown view is always live.
			if (view && !view.isLoaded) {
				try { view.callLoaded?.(); } catch (_e) {}
			}
		} else if (!native) {
			// nativeViewProtected not yet created — defer until after the layout pass.
			setTimeout(() => {
				if (!this._contentArea) return;
				const deferred = (this.items?.[index] as any)?.view;
				const n = deferred?.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
				if (n) {
					try {
						n.HorizontalAlignment = 3 as never;
						n.VerticalAlignment = 3 as never;
						this._clearContent();
						this._contentArea.Children.Append(n);
					} catch (_e) {}
					if (deferred && !deferred.isLoaded) {
						try { deferred.callLoaded?.(); } catch (_e) {}
					}
				}
			}, 0);
		}
	}

	private _highlightTab(selectedIndex: number): void {
		for (let i = 0; i < this._tabButtons.length; i++) {
			const btn = this._tabButtons[i];
			if (!btn) continue;
			(btn as any).FontWeight = i === selectedIndex
				? Microsoft.UI.Text.FontWeights.Bold
				: Microsoft.UI.Text.FontWeights.Normal;
		}
	}
}
