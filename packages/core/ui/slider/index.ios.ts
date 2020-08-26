import { Background } from '../styling/background';

import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';

export * from './slider-common';

@NativeClass
class SliderChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<Slider>;

	public static initWithOwner(owner: WeakRef<Slider>): SliderChangeHandlerImpl {
		let handler = <SliderChangeHandlerImpl>SliderChangeHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public sliderValueChanged(sender: UISlider) {
		let owner = this._owner.get();
		if (owner) {
			valueProperty.nativeValueChange(owner, sender.value);
		}
	}

	public static ObjCExposedMethods = {
		sliderValueChanged: { returns: interop.types.void, params: [UISlider] },
	};
}

export class Slider extends SliderBase {
	nativeViewProtected: UISlider;
	private _changeHandler: NSObject;

	public createNativeView() {
		return UISlider.new();
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		// default values
		nativeView.minimumValue = 0;
		nativeView.maximumValue = this.maxValue;
		this._changeHandler = SliderChangeHandlerImpl.initWithOwner(new WeakRef(this));
		nativeView.addTargetActionForControlEvents(this._changeHandler, 'sliderValueChanged', UIControlEvents.ValueChanged);
	}

	public disposeNativeView() {
		this._changeHandler = null;
		super.disposeNativeView();
	}

	get ios(): UISlider {
		return this.nativeViewProtected;
	}

	[valueProperty.getDefault](): number {
		return 0;
	}
	[valueProperty.setNative](value: number) {
		this.ios.value = value;
	}
	[minValueProperty.getDefault](): number {
		return 0;
	}
	[minValueProperty.setNative](value: number) {
		this.ios.minimumValue = value;
	}
	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.ios.maximumValue = value;
	}

	[colorProperty.getDefault](): UIColor {
		return this.ios.thumbTintColor;
	}
	[colorProperty.setNative](value: UIColor | Color) {
		let color = value instanceof Color ? value.ios : value;
		this.ios.thumbTintColor = color;
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.ios.minimumTrackTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		let color = value instanceof Color ? value.ios : value;
		this.ios.minimumTrackTintColor = color;
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Background) {
		//
	}
}
