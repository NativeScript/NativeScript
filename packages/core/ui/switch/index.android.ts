import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AndroidHelper } from '../core/view';

export * from './switch-common';

interface CheckedChangeListener {
	new (owner: Switch): android.widget.CompoundButton.OnCheckedChangeListener;
}

let CheckedChangeListener: CheckedChangeListener;

function initializeCheckedChangeListener(): void {
	if (CheckedChangeListener) {
		return;
	}

	@NativeClass
	@Interfaces([android.widget.CompoundButton.OnCheckedChangeListener])
	class CheckedChangeListenerImpl extends java.lang.Object implements android.widget.CompoundButton.OnCheckedChangeListener {
		constructor(private owner: Switch) {
			super();

			return global.__native(this);
		}

		onCheckedChanged(buttonView: android.widget.CompoundButton, isChecked: boolean): void {
			const owner = this.owner;
			checkedProperty.nativeValueChange(owner, isChecked);
		}
	}

	CheckedChangeListener = CheckedChangeListenerImpl;
}

export class Switch extends SwitchBase {
	declare nativeViewProtected: android.widget.Switch;
	declare checked: boolean;

	public createNativeView() {
		return new android.widget.Switch(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		initializeCheckedChangeListener();
		const listener = new CheckedChangeListener(this);
		nativeView.setOnCheckedChangeListener(listener);
		(<any>nativeView).listener = listener;
	}

	public disposeNativeView() {
		const nativeView: any = this.nativeViewProtected;
		if (nativeView.listener) {
			nativeView.listener.owner = null;
		}
		super.disposeNativeView();
	}

	private setNativeBackgroundColor(value: string | number | Color) {
		if (this.nativeViewProtected) {
			const drawable = this.nativeViewProtected.getTrackDrawable();
			if (value instanceof Color) {
				AndroidHelper.setDrawableColor(value.android, drawable, androidx.core.graphics.BlendModeCompat.SRC_OVER);
			} else {
				AndroidHelper.clearDrawableColor(drawable);
			}
		}
	}

	_onCheckedPropertyChanged(newValue: boolean) {
		super._onCheckedPropertyChanged(newValue);

		if (this.offBackgroundColor) {
			if (!newValue) {
				this.setNativeBackgroundColor(this.offBackgroundColor);
			} else {
				this.setNativeBackgroundColor(this.backgroundColor);
			}
		}
	}

	[checkedProperty.getDefault](): boolean {
		return false;
	}
	[checkedProperty.setNative](value: boolean) {
		this.nativeViewProtected.setChecked(value);
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		const drawable = this.nativeViewProtected.getThumbDrawable();
		if (value instanceof Color) {
			AndroidHelper.setDrawableColor(value.android, drawable, androidx.core.graphics.BlendModeCompat.SRC_ATOP);
		} else {
			AndroidHelper.clearDrawableColor(drawable);
		}
	}

	[backgroundColorProperty.getDefault](): number {
		return -1;
	}
	[backgroundColorProperty.setNative](value: number | Color) {
		if (!this.offBackgroundColor || this.checked) {
			this.setNativeBackgroundColor(value);
		}
	}

	[backgroundInternalProperty.getDefault](): any {
		return null;
	}
	[backgroundInternalProperty.setNative](value: any) {
		//
	}

	[offBackgroundColorProperty.getDefault](): number {
		return -1;
	}
	[offBackgroundColorProperty.setNative](value: number | Color) {
		if (!this.checked) {
			this.setNativeBackgroundColor(value);
		}
	}
}
