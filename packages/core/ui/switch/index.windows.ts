export * from './switch-common';

import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';

export class Switch extends SwitchBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.ToggleSwitch;
	private _toggledHandler: ((sender: Microsoft.UI.Xaml.Controls.ToggleSwitch) => void) | null = null;
	private _windows: Microsoft.UI.Xaml.Controls.ToggleSwitch;

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	public createNativeView() {
		this._windows = new Microsoft.UI.Xaml.Controls.ToggleSwitch();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.ToggleSwitch {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();

		const that = new WeakRef(this);
		const native = this.nativeViewProtected;

		// Toggled is a generic TypedEventHandler<ToggleSwitch, RoutedEventArgs> — the runtime can't derive
		// the parameterized GUID from a plain assignment, so build via asDelegate (can throw; keep guarded).
		const handler = (s: Microsoft.UI.Xaml.Controls.ToggleSwitch) => {
			const owner = that.deref();
			if (!owner) return;
			checkedProperty.nativeValueChange(owner, s.IsOn ?? false);
		};
		this._toggledHandler = handler;
		try {
			const typeName = 'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.ToggleSwitch,Microsoft.UI.Xaml.RoutedEventArgs>';
			native.Toggled = NSWinRT.asDelegate(typeName, handler);
		} catch (_e) {
			native.Toggled = handler as unknown as Microsoft.UI.Xaml.RoutedEventHandler;
		}
	}

	public disposeNativeView(): void {
		const native = this.nativeViewProtected;
		if (native && this._toggledHandler) {
			native.Toggled = null;
			this._toggledHandler = null;
		}

		super.disposeNativeView();
	}

	[checkedProperty.getDefault](): boolean {
		return false;
	}
	[checkedProperty.setNative](value: boolean) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.IsOn = !!value;
		}
	}

	[colorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		const resources = this.nativeViewProtected.Resources;

		if (value instanceof Color) {
			const color = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
			resources.Insert('ToggleSwitchKnobFillOn', color);
			resources.Insert('ToggleSwitchKnobFillOff', color);
		} else {
			resources.Remove('ToggleSwitchKnobFillOn');
			resources.Remove('ToggleSwitchKnobFillOff');
		}
	}

	[backgroundColorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		if (!this.offBackgroundColor || this.checked) {
			const resources = this.nativeViewProtected.Resources;
			if (value instanceof Color) {
				resources.Insert('ToggleSwitchFillOn', new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows));
			} else {
				resources.Remove('ToggleSwitchFillOn');
			}
		}
	}

	[backgroundInternalProperty.setNative](_value: any) {}


	[offBackgroundColorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		if (!this.checked) {
			const resources = this.nativeViewProtected.Resources;
			if (value instanceof Color) {
				resources.Insert('ToggleSwitchFillOff', new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows));
			} else {
				resources.Remove('ToggleSwitchFillOff');
			}
		}
	}
}
