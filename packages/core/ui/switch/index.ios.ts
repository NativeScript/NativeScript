import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { layout } from '../../utils';

export * from './switch-common';

@NativeClass
class SwitchChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<Switch>;

	public static initWithOwner(owner: WeakRef<Switch>): SwitchChangeHandlerImpl {
		let handler = <SwitchChangeHandlerImpl>SwitchChangeHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public valueChanged(sender: UISwitch) {
		let owner = this._owner.get();
		if (owner) {
			checkedProperty.nativeValueChange(owner, sender.on);
		}
	}

	public static ObjCExposedMethods = {
		valueChanged: { returns: interop.types.void, params: [UISwitch] },
	};
}

const zeroSize = { width: 0, height: 0 };
export class Switch extends SwitchBase {
	nativeViewProtected: UISwitch;
	private _handler: NSObject;

	constructor() {
		super();
		this.width = 51;
		this.height = 31;
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

	get ios(): UISwitch {
		return this.nativeViewProtected;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// It can't be anything different from 51x31
		let nativeSize = this.nativeViewProtected.sizeThatFits(zeroSize);
		this.width = nativeSize.width;
		this.height = nativeSize.height;

		const widthAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.width), layout.toDevicePixels(51), layout.EXACTLY, 0);
		const heightAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.height), layout.toDevicePixels(31), layout.EXACTLY, 0);
		this.setMeasuredDimension(widthAndState, heightAndState);
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
		this.nativeViewProtected.thumbTintColor = value instanceof Color ? value.ios : value;
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.onTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		this.nativeViewProtected.onTintColor = value instanceof Color ? value.ios : value;
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
		const nativeValue = value instanceof Color ? value.ios : value;

		this.nativeViewProtected.tintColor = nativeValue;
		this.nativeViewProtected.backgroundColor = nativeValue;
		this.nativeViewProtected.layer.cornerRadius = this.nativeViewProtected.frame.size.height / 2;
	}
}
