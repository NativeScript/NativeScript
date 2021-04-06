import { Background } from '../styling/background';

import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AccessibilityDecrementEventData, AccessibilityIncrementEventData } from '.';

export * from './slider-common';

@NativeClass()
class TNSSlider extends UISlider {
	public owner: WeakRef<Slider>;

	public static initWithOwner(owner: WeakRef<Slider>) {
		const slider = TNSSlider.new() as TNSSlider;
		slider.owner = owner;

		return slider;
	}

	public accessibilityIncrement() {
		const owner = this.owner.get();
		if (!owner) {
			this.value += 10;
		} else {
			this.value = owner._handlerAccessibilityIncrementEvent();
		}

		this.sendActionsForControlEvents(UIControlEvents.ValueChanged);
	}

	public accessibilityDecrement() {
		const owner = this.owner.get();
		if (!owner) {
			this.value += 10;
		} else {
			this.value = owner._handlerAccessibilityDecrementEvent();
		}

		this.sendActionsForControlEvents(UIControlEvents.ValueChanged);
	}
}

@NativeClass
class SliderChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<Slider>;

	public static initWithOwner(owner: WeakRef<Slider>): SliderChangeHandlerImpl {
		const handler = <SliderChangeHandlerImpl>SliderChangeHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public sliderValueChanged(sender: UISlider) {
		const owner = this._owner.get();
		if (owner) {
			valueProperty.nativeValueChange(owner, sender.value);
		}
	}

	public static ObjCExposedMethods = {
		sliderValueChanged: { returns: interop.types.void, params: [UISlider] },
	};
}

export class Slider extends SliderBase {
	nativeViewProtected: TNSSlider;
	private _changeHandler: NSObject;

	public createNativeView(): TNSSlider {
		return TNSSlider.initWithOwner(new WeakRef(this));
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

	public disposeNativeView(): void {
		this._changeHandler = null;
		super.disposeNativeView();
	}

	// @ts-ignore
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
		const color = value instanceof Color ? value.ios : value;
		this.ios.thumbTintColor = color;
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.ios.minimumTrackTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		const color = value instanceof Color ? value.ios : value;
		this.ios.minimumTrackTintColor = color;
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Background) {
		//
	}

	private getAccessibilityStep(): number {
		if (!this.accessibilityStep || this.accessibilityStep <= 0) {
			return 10;
		}

		return this.accessibilityStep;
	}

	public _handlerAccessibilityIncrementEvent(): number {
		const args: AccessibilityIncrementEventData = {
			object: this,
			eventName: SliderBase.accessibilityIncrementEvent,
			value: this.value + this.getAccessibilityStep(),
		};

		this.notify(args);

		return args.value;
	}

	public _handlerAccessibilityDecrementEvent(): number {
		const args: AccessibilityDecrementEventData = {
			object: this,
			eventName: SliderBase.accessibilityIncrementEvent,
			value: this.value - this.getAccessibilityStep(),
		};

		this.notify(args);

		return args.value;
	}
}
