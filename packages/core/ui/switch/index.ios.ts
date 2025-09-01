import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { SDK_VERSION } from '../../utils/constants';

export * from './switch-common';

@NativeClass
class SwitchChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<Switch>;

	public static initWithOwner(owner: WeakRef<Switch>): SwitchChangeHandlerImpl {
		const handler = <SwitchChangeHandlerImpl>SwitchChangeHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public valueChanged(sender: UISwitch) {
		const owner = this._owner?.deref();
		if (owner) {
			checkedProperty.nativeValueChange(owner, sender.on);
		}
	}

	public static ObjCExposedMethods = {
		valueChanged: { returns: interop.types.void, params: [UISwitch] },
	};
}

export class Switch extends SwitchBase {
	declare nativeViewProtected: UISwitch;
	private _handler: NSObject;

	constructor() {
		super();
	}

	public createNativeView() {
		return UISwitch.new();
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		this._handler = SwitchChangeHandlerImpl.initWithOwner(new WeakRef(this));
		nativeView.addTargetActionForControlEvents(this._handler, 'valueChanged', UIControlEvents.ValueChanged);
	}

	public disposeNativeView() {
		this._handler = null;
		super.disposeNativeView();
	}

	private setNativeBackgroundColor(value: UIColor | Color) {
		if (value) {
			this.nativeViewProtected.onTintColor = value instanceof Color ? value.ios : value;
			this.nativeViewProtected.tintColor = value instanceof Color ? value.ios : value;
			this.nativeViewProtected.backgroundColor = value instanceof Color ? value.ios : value;
			this.nativeViewProtected.layer.cornerRadius = this.nativeViewProtected.frame.size.height / 2;
		} else {
			this.nativeViewProtected.onTintColor = null;
			this.nativeViewProtected.tintColor = null;
			this.nativeViewProtected.backgroundColor = null;
			this.nativeViewProtected.layer.cornerRadius = 0;
		}
	}

	_onCheckedPropertyChanged(newValue: boolean) {
		// only add :checked pseudo handling on supported iOS versions
		// ios <13 works but causes glitchy animations when toggling
		// so we decided to keep the old behavior on older versions.
		if (SDK_VERSION >= 13) {
			super._onCheckedPropertyChanged(newValue);

			if (this.offBackgroundColor) {
				if (!newValue) {
					this.setNativeBackgroundColor(this.offBackgroundColor);
				} else {
					this.setNativeBackgroundColor(this.backgroundColor instanceof Color ? this.backgroundColor : new Color(this.backgroundColor));
				}
			}
		}
	}

	// @ts-ignore
	get ios(): UISwitch {
		return this.nativeViewProtected;
	}

	[checkedProperty.getDefault](): boolean {
		return false;
	}
	[checkedProperty.setNative](value: boolean) {
		this.nativeViewProtected.on = value;
	}

	[colorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.thumbTintColor;
	}
	[colorProperty.setNative](value: UIColor | Color) {
		const color: UIColor = value instanceof Color ? value.ios : value;
		this.nativeViewProtected.thumbTintColor = color;

		if (color && this.nativeViewProtected.subviews.count > 0) {
			const alpha = new interop.Reference(1.0);
			const res = color.getRedGreenBlueAlpha(null, null, null, alpha);

			this.nativeViewProtected.subviews[0].alpha = (res && alpha.value) ?? 1;
		}
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.onTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		if (SDK_VERSION >= 13) {
			if (!this.offBackgroundColor || this.checked) {
				this.setNativeBackgroundColor(value);
			}
		} else {
			// old behavior on unsupported iOS versions
			this.nativeViewProtected.onTintColor = value instanceof Color ? value.ios : value;
		}
	}

	[backgroundInternalProperty.getDefault](): any {
		return null;
	}
	[backgroundInternalProperty.setNative](value: any) {
		//
	}

	[offBackgroundColorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.backgroundColor;
	}
	[offBackgroundColorProperty.setNative](value: Color | UIColor) {
		if (SDK_VERSION >= 13) {
			if (!this.checked) {
				this.setNativeBackgroundColor(value);
			}
		} else {
			// old behavior on unsupported iOS versions...
			const nativeValue = value instanceof Color ? value.ios : value;

			this.nativeViewProtected.tintColor = nativeValue;
			this.nativeViewProtected.backgroundColor = nativeValue;
			this.nativeViewProtected.layer.cornerRadius = this.nativeViewProtected.frame.size.height / 2;
		}
	}
}
