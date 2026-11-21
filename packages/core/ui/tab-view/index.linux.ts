export * from './tab-view-common';

import { TabViewBase, TabViewItemBase, selectedIndexProperty, itemsProperty, tabTextColorProperty, tabBackgroundColorProperty, selectedTabTextColorProperty, tabTextFontSizeProperty } from './tab-view-common';
import type { TabViewItem as TabViewItemDefinition } from '.';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetScopedCss } from '../styling/gtk-style.linux';

export class TabViewItem extends TabViewItemBase {
	public _update(): void {
		(this.parent as TabView)?._updateTab(this);
	}
}

/** GtkNotebook; each item's view is a hosted page laid out by NativeScript. */
export class TabView extends TabViewBase {
	private _disconnect: () => void;
	private _changeFromCode = false;

	createNativeView() {
		const notebook: any = gtk_notebook_new();
		gtk_notebook_set_scrollable(notebook, 1);
		return notebook;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		this._disconnect = connect(
			this.nativeViewProtected,
			'switch-page',
			(_nb: any, _page: any, index: number) => {
				const view = owner.deref();
				if (view && !view._changeFromCode) {
					selectedIndexProperty.nativeValueChange(view, index);
				}
			},
			{ types: ['pointer', 'uint'] },
		);
	}

	disposeNativeView(): void {
		this._disconnect?.();
		super.disposeNativeView();
	}

	onLoaded(): void {
		super.onLoaded();
		this._loadItems();
		this._syncPages();
	}

	// items only load once the TabView allows it (as on iOS)
	private _loadItems(): void {
		for (const item of this.items ?? []) {
			(item as any).canBeLoaded = true;
			this.loadView(item);
		}
	}

	/** Rebuilds the notebook pages from the items. */
	_syncPages(): void {
		const notebook = this.nativeViewProtected;
		if (!notebook) {
			return;
		}
		this._changeFromCode = true;
		try {
			while (gtk_notebook_get_n_pages(notebook) > 0) {
				gtk_notebook_remove_page(notebook, -1);
			}
			for (const item of this.items ?? []) {
				const page = item.view?.nativeViewProtected;
				if (!page) {
					continue;
				}
				(item.view as any)._linuxHosted = true;
				if (gtk_widget_get_parent(page)) {
					gtk_widget_unparent(page);
				}
				gtk_notebook_append_page(notebook, page, gtk_label_new(item.title || ''));
			}
			if (this.selectedIndex >= 0) {
				gtk_notebook_set_current_page(notebook, this.selectedIndex);
			}
		} finally {
			this._changeFromCode = false;
		}
	}

	_updateTab(item: TabViewItemBase): void {
		const notebook = this.nativeViewProtected;
		const page = item.view?.nativeViewProtected;
		if (notebook && page && gtk_widget_get_parent(page)) {
			gtk_notebook_set_tab_label_text(notebook, page, item.title || '');
		}
	}

	// pages are added by _syncPages
	public _addViewToNativeVisualTree(): boolean {
		return true;
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		super.onSelectedIndexChanged(oldIndex, newIndex);
	}

	[itemsProperty.setNative](value: TabViewItemDefinition[]) {
		if (this.isLoaded) {
			this._loadItems();
		}
		this._syncPages();
		selectedIndexProperty.coerce(this);
	}

	[selectedIndexProperty.setNative](value: number) {
		if (this.nativeViewProtected && value >= 0) {
			this._changeFromCode = true;
			gtk_notebook_set_current_page(this.nativeViewProtected, value);
			this._changeFromCode = false;
		}
	}

	[tabTextColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'tabText', value instanceof Color ? `& > header tab{color:${value.linux};}` : '');
	}

	[selectedTabTextColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'selectedTabText', value instanceof Color ? `& > header tab:checked{color:${value.linux};}` : '');
	}

	[tabBackgroundColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'tabBackground', value instanceof Color ? `& > header{background-color:${value.linux};background-image:none;}` : '');
	}

	[tabTextFontSizeProperty.setNative](value: number) {
		setWidgetScopedCss(this.nativeViewProtected, 'tabFont', value ? `& > header tab label{font-size:${value}px;}` : '');
	}
}
