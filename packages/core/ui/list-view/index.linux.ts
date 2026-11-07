export * from './list-view-common';

import type { ItemEventData } from '.';
import { ListViewBase, separatorColorProperty, itemTemplatesProperty } from './list-view-common';
import { View, type KeyedTemplate } from '../core/view';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { Color } from '../../color';
import { connect, addressOf } from '../../utils/gtk.linux';
import { setWidgetScopedCss } from '../styling/gtk-style.linux';

interface Row {
	view: View;
	template: string;
}

/**
 * GtkListView (virtualized, rows are recycled) in a GtkScrolledWindow. The
 * model is a GtkStringList of placeholders; each bound row hosts a NativeScript
 * view created from the item template and bound to the data item.
 */
export class ListView extends ListViewBase {
	private _listView: any;
	private _model: any;
	private _rows = new Map<number, Row>();
	private _disconnect: (() => void)[] = [];
	private _count = 0;
	private _loadMoreAt = -1;

	createNativeView() {
		const scroll: any = gtk_scrolled_window_new();
		this._model = gtk_string_list_new(null);
		const factory: any = gtk_signal_list_item_factory_new();
		this._listView = gtk_list_view_new(gtk_no_selection_new(this._model), factory);
		gtk_list_view_set_single_click_activate(this._listView, 1);
		gtk_scrolled_window_set_policy(scroll, GtkPolicyType.NEVER, GtkPolicyType.AUTOMATIC);
		gtk_scrolled_window_set_child(scroll, this._listView);

		const owner = new WeakRef(this);
		this._disconnect.push(
			connect(factory, 'bind', (_f: any, item: any) => owner.deref()?._bind(item), { args: 1 }),
			connect(factory, 'teardown', (_f: any, item: any) => owner.deref()?._teardown(item), { args: 1 }),
			connect(this._listView, 'activate', (_lv: any, position: number) => owner.deref()?._onActivate(position), { types: ['uint'] }),
			connect(gtk_scrolled_window_get_vadjustment(scroll), 'value-changed', (adjustment: any) => owner.deref()?._onScroll(adjustment)),
		);
		return scroll;
	}

	get linux(): any {
		return this._listView;
	}

	initNativeView(): void {
		super.initNativeView();
		this.refresh();
	}

	disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		this._clearRows();
		this._listView = this._model = null;
		super.disposeNativeView();
	}

	get _childrenCount(): number {
		return this._rows.size;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		for (const row of this._rows.values()) {
			if (!callback(row.view)) {
				break;
			}
		}
	}

	// rows live in GtkListItems, not in our native view
	public _addViewToNativeVisualTree(child: View): boolean {
		return true;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		child._isAddedToNativeVisualTree = false;
	}

	private _itemCount(): number {
		const items: any = this.items;
		return items ? items.length : 0;
	}

	public refresh() {
		if (!this._model) {
			return;
		}
		const count = this._itemCount();
		if (count > this._count) {
			for (let i = this._count; i < count; i++) {
				gtk_string_list_append(this._model, '');
			}
		} else if (count < this._count) {
			gtk_string_list_splice(this._model, count, this._count - count, null);
		}
		this._count = count;
		this._loadMoreAt = -1;
		// rebind the visible rows to the current data
		if (count) {
			g_list_model_items_changed(this._model, 0, count, count);
		}
	}

	public scrollToIndex(index: number) {
		if (this._listView && index >= 0 && index < this._count) {
			gtk_widget_activate_action(this._listView, 'list.scroll-to-item', 'u', index);
		}
	}

	public scrollToIndexAnimated(index: number) {
		this.scrollToIndex(index);
	}

	public isItemAtIndexVisible(index: number): boolean {
		for (const row of this._rows.values()) {
			if ((row.view as any)._listViewItemIndex === index) {
				return !!row.view.nativeViewProtected && !!gtk_widget_get_mapped(row.view.nativeViewProtected);
			}
		}
		return false;
	}

	_bind(item: any): void {
		const index = gtk_list_item_get_position(item);
		const key = addressOf(item);
		const template: KeyedTemplate = this._getItemTemplate(index);
		let row = this._rows.get(key);
		if (row && row.template !== template.key) {
			this._removeRow(key);
			row = null;
		}
		let view = row?.view ?? template.createView();
		const args = <ItemEventData>{ eventName: ListViewBase.itemLoadingEvent, object: this, index, view, ios: undefined, android: undefined };
		this.notify(args);
		view = args.view || this._getDefaultItemContent(index);
		if (view instanceof ProxyViewContainer) {
			const stack = new StackLayout();
			stack.addChild(view);
			view = stack;
		}
		if (row && row.view !== view) {
			this._removeRow(key);
			row = null;
		}
		this._prepareItem(view, index);
		(view as any)._listViewItemIndex = index;
		if (!row) {
			(view as any)._linuxHosted = true;
			if (this._effectiveRowHeight > 0) {
				view.height = this._effectiveRowHeight;
			}
			this._rows.set(key, { view, template: template.key });
			this._addView(view);
			gtk_list_item_set_child(item, view.nativeViewProtected);
		}
		view.requestLayout();
	}

	_teardown(item: any): void {
		this._removeRow(addressOf(item));
	}

	private _removeRow(key: number): void {
		const row = this._rows.get(key);
		if (row) {
			this._rows.delete(key);
			if (row.view.parent === this) {
				this._removeView(row.view);
			}
		}
	}

	private _clearRows(): void {
		for (const key of [...this._rows.keys()]) {
			this._removeRow(key);
		}
	}

	_onActivate(position: number): void {
		let view: View;
		for (const row of this._rows.values()) {
			if ((row.view as any)._listViewItemIndex === position) {
				view = row.view;
			}
		}
		this.notify(<ItemEventData>{ eventName: ListViewBase.itemTapEvent, object: this, index: position, view, ios: undefined, android: undefined });
	}

	_onScroll(adjustment: any): void {
		const value = gtk_adjustment_get_value(adjustment);
		const page = gtk_adjustment_get_page_size(adjustment);
		const upper = gtk_adjustment_get_upper(adjustment);
		// once per item count, when the end comes into view
		if (upper > page && value + page >= upper - 1 && this._loadMoreAt !== this._count) {
			this._loadMoreAt = this._count;
			this.notify({ eventName: ListViewBase.loadMoreItemsEvent, object: this });
		}
	}

	public _onRowHeightPropertyChanged(oldValue: any, newValue: any) {
		for (const row of this._rows.values()) {
			row.view.height = this._effectiveRowHeight > 0 ? this._effectiveRowHeight : 'auto';
		}
		this.refresh();
	}

	[separatorColorProperty.setNative](value: Color) {
		gtk_list_view_set_show_separators(this._listView, value ? 1 : 0);
		setWidgetScopedCss(this._listView, 'separator', value instanceof Color ? `& > row{border-bottom:1px solid ${value.linux};}` : '');
	}

	[itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
		this._itemTemplatesInternal = [this._defaultTemplate, ...(value ?? [])];
		this._clearRows();
		this.refresh();
	}
}
