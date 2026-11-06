export * from './action-bar-common';

import { ActionBarBase, ActionItemBase } from './action-bar-common';
import { View } from '../core/view';
import { connect } from '../../utils/gtk.linux';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Font } from '../styling/font';
import { setWidgetCss } from '../styling/gtk-style.linux';

export class ActionItem extends ActionItemBase {}

export class NavigationButton extends ActionItem {}

/** A header bar (back button, title or titleView, action items) at the top of the Page. */
export class ActionBar extends ActionBarBase {
	private _back: any;
	private _title: any;
	private _items: any;
	private _disconnect: (() => void)[] = [];
	private _itemDisconnect: (() => void)[] = [];

	createNativeView() {
		const bar = gtk_center_box_new();
		gtk_widget_add_css_class(bar, 'toolbar');
		this._back = gtk_button_new_from_icon_name('go-previous-symbolic');
		gtk_widget_add_css_class(this._back, 'flat');
		this._title = gtk_label_new(null);
		gtk_widget_add_css_class(this._title, 'title');
		gtk_label_set_ellipsize(this._title, PangoEllipsizeMode.END);
		this._items = gtk_box_new(GtkOrientation.HORIZONTAL, 4);
		gtk_center_box_set_start_widget(bar, this._back);
		gtk_center_box_set_center_widget(bar, this._title);
		gtk_center_box_set_end_widget(bar, this._items);
		return bar;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		this._disconnect.push(
			connect(this._back, 'clicked', () => {
				const bar = owner.deref();
				const navigation = bar?.navigationButton;
				if (navigation && (navigation as any).hasListeners?.(ActionItemBase.tapEvent)) {
					navigation._raiseTap();
				} else {
					((bar?.parent as any)?.frame as any)?.goBack();
				}
			}),
		);
		this.update();
	}

	disposeNativeView(): void {
		for (const disconnect of [...this._disconnect.splice(0), ...this._itemDisconnect.splice(0)]) {
			disconnect();
		}
		this._back = this._title = this._items = null;
		super.disposeNativeView();
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof NavigationButton) {
			this.navigationButton = value;
		} else if (value instanceof ActionItemBase) {
			this.actionItems?.addItem(value);
		} else if (value instanceof View) {
			this.titleView = value;
		}
	}

	public _addViewToNativeVisualTree(child: View): boolean {
		if (child === this.titleView && child.nativeViewProtected && this.nativeViewProtected) {
			gtk_center_box_set_center_widget(this.nativeViewProtected, child.nativeViewProtected);
			return true;
		}
		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		if (child === this.titleView && this.nativeViewProtected) {
			gtk_center_box_set_center_widget(this.nativeViewProtected, this._title);
		}
		super._removeViewFromNativeVisualTree(child);
	}

	public update(): void {
		if (!this.nativeViewProtected) {
			return;
		}
		gtk_label_set_text(this._title, this.title || '');
		const frame = (this.parent as any)?.frame;
		const navigation = this.navigationButton;
		const showBack = navigation ? navigation.visibility !== 'collapse' : !!frame?.canGoBack?.();
		gtk_widget_set_visible(this._back, showBack ? 1 : 0);
		if (navigation?.text) {
			gtk_button_set_label(this._back, navigation.text);
		}
		this._rebuildItems();
		this.requestLayout();
	}

	private _rebuildItems(): void {
		for (const disconnect of this._itemDisconnect.splice(0)) {
			disconnect();
		}
		for (let child = gtk_widget_get_first_child(this._items); child; child = gtk_widget_get_first_child(this._items)) {
			gtk_box_remove(this._items, child);
		}
		for (const item of this.actionItems?.getVisibleItems() ?? []) {
			const button = item.icon && !item.text ? gtk_button_new_from_icon_name(item.icon.replace(/^res:\/\//, '')) : gtk_button_new_with_label(item.text || '');
			gtk_widget_add_css_class(button, 'flat');
			const ref = new WeakRef(item);
			this._itemDisconnect.push(connect(button, 'clicked', () => ref.deref()?._raiseTap()));
			gtk_box_append(this._items, button);
		}
	}

	public _onTitlePropertyChanged(): void {
		if (this._title) {
			gtk_label_set_text(this._title, this.title || '');
		}
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}

	[fontInternalProperty.setNative](value: Font) {
		setWidgetCss(this._title, 'font', value instanceof Font ? (value as any).linuxCss : '');
	}
}
