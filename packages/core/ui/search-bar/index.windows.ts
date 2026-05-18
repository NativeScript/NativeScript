export * from './search-bar-common';

import { SearchBarBase, textProperty, hintProperty, textFieldBackgroundColorProperty, textFieldHintColorProperty, clearButtonColorProperty } from './search-bar-common';
import { Color } from '../../color';

export class SearchBar extends SearchBarBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.AutoSuggestBox;
		private _textHandler: any;
		private _textHandlerUsedAddListener: boolean = false;
		private _queryHandler: any;
		private _queryHandlerUsedAddListener: boolean = false;
	private _windows: Windows.UI.Xaml.Controls.AutoSuggestBox;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.AutoSuggestBox();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.AutoSuggestBox {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		const native = this.nativeViewProtected;

		let textUsedAdd = false;
		let queryUsedAdd = false;
		try {
			this._textHandler = new Windows.Foundation.TypedEventHandler<Windows.UI.Xaml.Controls.AutoSuggestBox, Windows.UI.Xaml.Controls.AutoSuggestBoxTextChangedEventArgs>((s, e) => {
				const owner = that.deref();
				if (!owner) return;
				textProperty.nativeValueChange(owner, native.Text || '');
			});
			native.TextChanged = this._textHandler as never;

			this._queryHandler = new Windows.Foundation.TypedEventHandler<Windows.UI.Xaml.Controls.AutoSuggestBox, Windows.UI.Xaml.Controls.AutoSuggestBoxQuerySubmittedEventArgs>((s, e) => {
				const owner = that.deref();
				if (!owner) return;
				owner.notify({ eventName: SearchBarBase.submitEvent, object: owner });
			});
			native.QuerySubmitted = this._queryHandler as never;
		} catch (_e) {
			// Fallback: use plain functions and attempt property assign or addEventListener
			this._textHandler = (s: any, e: any) => {
				const owner = that.deref();
				if (!owner) return;
				textProperty.nativeValueChange(owner, native.Text || '');
			};
			try {
				native.TextChanged = this._textHandler as never;
			} catch (_e2) {
				try {
					if (typeof (native as any).addEventListener === 'function') {
						(native as any).addEventListener('textchanged', this._textHandler);
						textUsedAdd = true;
					}
				} catch (_e3) {}
			}

			this._queryHandler = (s: any, e: any) => {
				const owner = that.deref();
				if (!owner) return;
				owner.notify({ eventName: SearchBarBase.submitEvent, object: owner });
			};
			try {
				native.QuerySubmitted = this._queryHandler as never;
			} catch (_e2) {
				try {
					if (typeof (native as any).addEventListener === 'function') {
						(native as any).addEventListener('querysubmitted', this._queryHandler);
						queryUsedAdd = true;
					}
				} catch (_e3) {}
			}

			this._textHandlerUsedAddListener = textUsedAdd;
			this._queryHandlerUsedAddListener = queryUsedAdd;
		}
	}

	public disposeNativeView(): void {
		try {
			if (this._textHandler) {
				try { this.nativeViewProtected.TextChanged = null as never; } catch (_e) {}
				if (this._textHandlerUsedAddListener) {
					try { (this.nativeViewProtected as any).removeEventListener('textchanged', this._textHandler); } catch (_e) {}
				}
				this._textHandler = null;
			}
			if (this._queryHandler) {
				try { this.nativeViewProtected.QuerySubmitted = null as never; } catch (_e) {}
				if (this._queryHandlerUsedAddListener) {
					try { (this.nativeViewProtected as any).removeEventListener('querysubmitted', this._queryHandler); } catch (_e) {}
				}
				this._queryHandler = null;
			}
		} catch (_e) {}

		super.disposeNativeView();
	}

	public dismissSoftInput() {
		// No-op for UWP; clearing focus if possible
		try {
			if (this.nativeViewProtected) {
				(this.nativeViewProtected as any).IsEnabled = false;
				(this.nativeViewProtected as any).IsEnabled = true;
			}
		} catch (_e) {}
	}

	[textProperty.setNative](value: string) {
		const native = this.nativeViewProtected;
		if (!native) return;
		native.Text = value ?? '';
	}

	[hintProperty.setNative](value: string) {
		const native = this.nativeViewProtected;
		if (!native) return;
		try {
			native.PlaceholderText = value ?? '';
		} catch (_e) {}
	}

	[textFieldBackgroundColorProperty.setNative](value: Color) {
		try {
			if (this.nativeViewProtected && value instanceof Color) {
				this.nativeViewProtected.Background = new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never;
			}
		} catch (_e) {}
	}

	[textFieldHintColorProperty.setNative](value: Color) {
		try {
			// PlaceholderForeground is available on newer platforms
			if (this.nativeViewProtected && value instanceof Color && typeof (this.nativeViewProtected as any).PlaceholderForeground !== 'undefined') {
				(this.nativeViewProtected as any).PlaceholderForeground = new Windows.UI.Xaml.Media.SolidColorBrush(value.windows);
			}
		} catch (_e) {}
	}

	[clearButtonColorProperty.setNative](_value: Color | string) {
		// No reliable way to style clear button across UWP flavors in a consistent way here.
	}
}

