export * from './switch-common';

import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';


/* other states to handle
//hover
ToggleSwitchFillOnPointerOver
ToggleSwitchFillOffPointerOver

// thumb
ToggleSwitchKnobFillOnPointerOver
ToggleSwitchKnobFillOffPointerOver


// Pressed
ToggleSwitchFillOnPressed
ToggleSwitchFillOffPressed

// Disabled
ToggleSwitchFillOnDisabled
ToggleSwitchFillOffDisabled
*/

export class Switch extends SwitchBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ToggleSwitch;
	private _toggledHandler: any = null;
	private _toggledHandlerUsedAddListener: boolean = false;
	private _windows: Windows.UI.Xaml.Controls.ToggleSwitch;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.ToggleSwitch();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.ToggleSwitch {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();

		const that = new WeakRef(this);
		const native = this.nativeViewProtected;

		let usedAddListener = false;
		try {
			this._toggledHandler = new Windows.Foundation.TypedEventHandler<Windows.UI.Xaml.Controls.ToggleSwitch, any>((s) => {
				const owner = that.deref();
				if (!owner) return;
				checkedProperty.nativeValueChange(owner, (s as any).isOn || (s as any).IsOn || false);
			});

			(native as any).Toggled = this._toggledHandler as never;
		} catch (_e) {
			this._toggledHandler = (s: any) => {
				const owner = that.deref();
				if (!owner) return;
				checkedProperty.nativeValueChange(owner, (s as any).isOn || (s as any).IsOn || false);
			};

			try {
				(native as any).Toggled = this._toggledHandler as never;
			} catch (_e2) {
				try {
					if (typeof (native as any).addEventListener === 'function') {
						(native as any).addEventListener('toggled', this._toggledHandler);
						usedAddListener = true;
					}
				} catch (_e3) { }
			}
		}

		this._toggledHandlerUsedAddListener = usedAddListener;
	}

	public disposeNativeView(): void {
		const native = this.nativeViewProtected;
		if (native && this._toggledHandler) {
			try { (native as any).Toggled = null as never; } catch (_e) { }
			if (this._toggledHandlerUsedAddListener) {
				try { (native as any).removeEventListener('toggled', this._toggledHandler); } catch (_e) { }
			}
			this._toggledHandler = null;
			this._toggledHandlerUsedAddListener = false;
		}

		super.disposeNativeView();
	}

	[checkedProperty.getDefault](): boolean {
		return false;
	}
	[checkedProperty.setNative](value: boolean) {
		if (this.nativeViewProtected) {
			(this.nativeViewProtected as any).IsOn = !!value;
		}
	}

	[colorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		const resources = this.nativeViewProtected.Resources;

		if (value instanceof Color) {
			const color = new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never;
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
				resources.Insert('ToggleSwitchFillOn', new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never);
			} else {
				resources.Remove('ToggleSwitchFillOn');
			}
		}
	}

	[backgroundInternalProperty.setNative](_value: any) {
		// No-op for now
	}

	[offBackgroundColorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		if (!this.checked) {
			const resources = this.nativeViewProtected.Resources;
			if (value instanceof Color) {
				resources.Insert('ToggleSwitchFillOff', new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never);
			} else {
				resources.Remove('ToggleSwitchFillOff');
			}
		}
	}
}
