export * from './search-bar-common';

import { SearchBarBase, textProperty, hintProperty, textFieldBackgroundColorProperty, textFieldHintColorProperty, clearButtonColorProperty } from './search-bar-common';
import { Color } from '../../color';

export class SearchBar extends SearchBarBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.AutoSuggestBox;
	private _textHandler: any = null;
	private _queryHandler: any = null;
	private _windows: Microsoft.UI.Xaml.Controls.AutoSuggestBox;

	public createNativeView(): Microsoft.UI.Xaml.Controls.AutoSuggestBox {
		this._windows = new Microsoft.UI.Xaml.Controls.AutoSuggestBox();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.AutoSuggestBox {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		const native = this.nativeViewProtected;

		this._textHandler = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.AutoSuggestBox,Microsoft.UI.Xaml.Controls.AutoSuggestBoxTextChangedEventArgs>',
			() => {
				const owner = that.deref();
				if (owner) textProperty.nativeValueChange(owner, native.Text || '');
			}
		);
		native.TextChanged = this._textHandler as never;

		this._queryHandler = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.AutoSuggestBox,Microsoft.UI.Xaml.Controls.AutoSuggestBoxQuerySubmittedEventArgs>',
			() => {
				const owner = that.deref();
				if (owner) owner.notify({ eventName: SearchBarBase.submitEvent, object: owner });
			}
		);
		native.QuerySubmitted = this._queryHandler as never;
	}

	public disposeNativeView(): void {
		if (this._textHandler) {
			this.nativeViewProtected.TextChanged = null;
			this._textHandler = null;
		}
		if (this._queryHandler) {
			this.nativeViewProtected.QuerySubmitted = null;
			this._queryHandler = null;
		}
		super.disposeNativeView();
	}

	public dismissSoftInput(): void {}

	[textProperty.setNative](value: string) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.Text = value ?? '';
		}
	}

	[hintProperty.setNative](value: string) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.PlaceholderText = value ?? '';
		}
	}

	[textFieldBackgroundColorProperty.setNative](value: Color) {
		if (!this.nativeViewProtected || !(value instanceof Color)) return;
		this.nativeViewProtected.Background = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows) as never;
	}

	[textFieldHintColorProperty.setNative](value: Color) {
		const native = this.nativeViewProtected;
		if (!native || !(value instanceof Color)) return;
		// AutoSuggestBox has no PlaceholderForeground — override inner TextBox theme brushes via Resources.
		const brush = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
		try { (native as any).Resources.Insert('TextControlPlaceholderForeground', brush); } catch (_e) {}
		try { (native as any).Resources.Insert('TextControlPlaceholderForegroundPointerOver', brush); } catch (_e) {}
		try { (native as any).Resources.Insert('TextControlPlaceholderForegroundFocused', brush); } catch (_e) {}
		try { (native as any).Resources.Insert('TextControlPlaceholderForegroundDisabled', brush); } catch (_e) {}
	}

	[clearButtonColorProperty.setNative](_value: Color | string): void {}
}
