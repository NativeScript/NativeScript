export * from './search-bar-common';

import { SearchBarBase, textProperty, hintProperty, textFieldBackgroundColorProperty } from './search-bar-common';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Font } from '../styling/font';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss } from '../styling/gtk-style.linux';

/** GtkSearchEntry: `submit` on Enter, `clear` when emptied. */
export class SearchBar extends SearchBarBase {
	private _disconnect: (() => void)[] = [];
	private _changeFromCode = false;

	createNativeView() {
		return gtk_search_entry_new();
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const entry = this.nativeViewProtected;
		this._disconnect.push(
			connect(entry, 'search-changed', () => {
				const view = owner.deref();
				if (!view || view._changeFromCode) return;
				const text = gtk_editable_get_text(entry) ?? '';
				textProperty.nativeValueChange(view, text);
				if (text === '') {
					view._emit(SearchBarBase.clearEvent);
				}
			}),
			connect(entry, 'activate', () => owner.deref()?._emit(SearchBarBase.submitEvent)),
		);
	}

	disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		super.disposeNativeView();
	}

	public dismissSoftInput() {
		const root: any = gtk_widget_get_root(this.nativeViewProtected);
		if (root) {
			gtk_root_set_focus(root, null);
		}
	}

	[textProperty.setNative](value: string) {
		const text = value == null ? '' : `${value}`;
		if ((gtk_editable_get_text(this.nativeViewProtected) ?? '') !== text) {
			this._changeFromCode = true;
			gtk_editable_set_text(this.nativeViewProtected, text);
			this._changeFromCode = false;
		}
	}

	[hintProperty.setNative](value: string) {
		g_object_set(this.nativeViewProtected, 'placeholder-text', value ? `${value}` : null, null);
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}

	[textFieldBackgroundColorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'field', value instanceof Color ? `background-color:${value.linux};background-image:none;` : '');
	}

	[fontInternalProperty.setNative](value: Font) {
		setWidgetCss(this.nativeViewProtected, 'font', value instanceof Font ? (value as any).linuxCss : '');
	}
}
