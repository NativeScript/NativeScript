import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';

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
	nativeViewProtected: android.widget.Switch;
	public checked: boolean;

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
		nativeView.listener.owner = null;
		super.disposeNativeView();
	}

	private setNativeBackgroundColor(value: string | number | Color) {
		if (value instanceof Color) {
			this.nativeViewProtected.getTrackDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
		} else {
			this.nativeViewProtected.getTrackDrawable().clearColorFilter();
		}
	}

	_onCheckedPropertyChanged(newValue: boolean) {
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
		if (value instanceof Color) {
			this.nativeViewProtected.getThumbDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
		} else {
			this.nativeViewProtected.getThumbDrawable().clearColorFilter();
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
