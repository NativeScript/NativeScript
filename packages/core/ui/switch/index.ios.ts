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
	nativeViewProtected: UISwitch;
	private _handler: NSObject;
	// Defer color updates while iOS 26+ "glass" toggle animation runs
	private _toggleColorTimer: NodeJS.Timeout | null = null;

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
		if (this._toggleColorTimer) {
			clearTimeout(this._toggleColorTimer);
			this._toggleColorTimer = null;
		}
		super.disposeNativeView();
	}

	private setNativeBackgroundColor(value: UIColor | Color) {
		const native = this.nativeViewProtected;
		if (value) {
			const nativeValue = value instanceof Color ? value.ios : value;
			// Keep the legacy behavior for on/off colors
			native.onTintColor = nativeValue;
			native.tintColor = nativeValue;
			native.backgroundColor = nativeValue;

			// Since iOS 16+ the control no longer clips its background by default.
			// Ensure the track-shaped background doesn't bleed outside the control bounds.
			if (SDK_VERSION >= 16) {
				native.clipsToBounds = true;
				native.layer.masksToBounds = true;
			}

			// Corner radius must be based on the final laid out size; use bounds first,
			// then fall back to frame. If size isn't known yet, update on the next tick.
			const height = native.bounds?.size?.height || native.frame?.size?.height || 0;
			if (height > 0) {
				native.layer.cornerRadius = height / 2;
			} else {
				// Defer until after layout
				setTimeout(() => {
					const n = this.nativeViewProtected;
					if (!n) {
						return;
					}
					const h = n.bounds?.size?.height || n.frame?.size?.height || 0;
					if (h > 0) {
						n.layer.cornerRadius = h / 2;
					}
				}, 0);
			}
		} else {
			native.onTintColor = null;
			native.tintColor = null;
			native.backgroundColor = null;
			native.layer.cornerRadius = 0;
			if (SDK_VERSION >= 16) {
				// Restore default clipping behavior
				native.clipsToBounds = false;
				native.layer.masksToBounds = false;
			}
		}
	}

	_onCheckedPropertyChanged(newValue: boolean) {
		// only add :checked pseudo handling on supported iOS versions
		// ios <13 works but causes glitchy animations when toggling
		// so we decided to keep the old behavior on older versions.
		if (SDK_VERSION >= 13) {
			super._onCheckedPropertyChanged(newValue);

			if (this.offBackgroundColor) {
				const nextColor = !newValue ? this.offBackgroundColor : this.backgroundColor instanceof Color ? this.backgroundColor : new Color(this.backgroundColor);

				// On iOS 26+, coordinate with the system's switch animation:
				// delay applying track color until the toggle animation finishes to avoid a janky mid-animation recolor.
				if (SDK_VERSION >= 26) {
					if (this._toggleColorTimer) {
						clearTimeout(this._toggleColorTimer);
					}
					this._toggleColorTimer = setTimeout(() => {
						const ANIMATION_DELAY_MS = 0.26; // approx. system toggle duration
						UIView.animateWithDurationAnimations(ANIMATION_DELAY_MS, () => {
							this._toggleColorTimer = null;
							this.setNativeBackgroundColor(nextColor);
						});
					}, 0);
				} else {
					this.setNativeBackgroundColor(nextColor);
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
