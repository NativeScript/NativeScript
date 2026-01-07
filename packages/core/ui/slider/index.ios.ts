import { Background } from '../styling/background';

import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AccessibilityDecrementEventData, AccessibilityIncrementEventData } from '.';
import { LinearGradient } from '../styling/linear-gradient';
import { Screen } from '../../platform/screen';

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
		const owner = this.owner?.deref();
		if (!owner) {
			this.value += 10;
		} else {
			this.value = owner._handlerAccessibilityIncrementEvent();
		}

		this.sendActionsForControlEvents(UIControlEvents.ValueChanged);
	}

	public accessibilityDecrement() {
		const owner = this.owner?.deref();
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
		const owner = this._owner?.deref();
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
		if (value && value.image instanceof LinearGradient) {
			this._applyGradientToTrack(value.image);
		}
	}

	private _applyGradientToTrack(gradient: LinearGradient): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		// Create a gradient layer
		const gradientLayer = CAGradientLayer.new();

		// Set up colors from the gradient stops
		const iosColors = NSMutableArray.alloc().initWithCapacity(gradient.colorStops.length);
		const iosStops = NSMutableArray.alloc<number>().initWithCapacity(gradient.colorStops.length);
		let hasStops = false;

		gradient.colorStops.forEach((stop, index) => {
			iosColors.addObject(stop.color.ios.CGColor);
			if (stop.offset) {
				iosStops.addObject(stop.offset.value);
				hasStops = true;
			} else {
				// Default evenly distributed positions
				iosStops.addObject(index / (gradient.colorStops.length - 1));
			}
		});

		gradientLayer.colors = iosColors;
		if (hasStops) {
			gradientLayer.locations = iosStops;
		}

		// Calculate gradient direction based on angle
		const alpha = gradient.angle / (Math.PI * 2);
		const startX = Math.pow(Math.sin(Math.PI * (alpha + 0.75)), 2);
		const startY = Math.pow(Math.sin(Math.PI * (alpha + 0.5)), 2);
		const endX = Math.pow(Math.sin(Math.PI * (alpha + 0.25)), 2);
		const endY = Math.pow(Math.sin(Math.PI * alpha), 2);

		gradientLayer.startPoint = { x: startX, y: startY };
		gradientLayer.endPoint = { x: endX, y: endY };

		// Create track image from gradient
		// Use a reasonable default size for the track
		const trackWidth = 200;
		const trackHeight = 4;

		gradientLayer.frame = CGRectMake(0, 0, trackWidth, trackHeight);
		gradientLayer.cornerRadius = trackHeight / 2;

		// Create renderer format with proper scale
		const format = UIGraphicsImageRendererFormat.defaultFormat();
		format.scale = Screen.mainScreen.scale;
		format.opaque = false;

		const size = CGSizeMake(trackWidth, trackHeight);
		const renderer = UIGraphicsImageRenderer.alloc().initWithSizeFormat(size, format);

		// Render gradient to image
		const gradientImage = renderer.imageWithActions((rendererContext) => {
			gradientLayer.renderInContext(rendererContext.CGContext);
		});

		if (gradientImage) {
			// Create stretchable image for the track
			const capInsets = new UIEdgeInsets({
				top: 0,
				left: trackHeight / 2,
				bottom: 0,
				right: trackHeight / 2,
			});
			const stretchableImage = gradientImage.resizableImageWithCapInsetsResizingMode(capInsets, UIImageResizingMode.Stretch);

			// Set the gradient image for minimum track (filled portion)
			nativeView.setMinimumTrackImageForState(stretchableImage, UIControlState.Normal);

			// For maximum track, create a semi-transparent version
			const maxTrackImage = renderer.imageWithActions((rendererContext) => {
				CGContextSetAlpha(rendererContext.CGContext, 0.3);
				gradientLayer.renderInContext(rendererContext.CGContext);
			});

			if (maxTrackImage) {
				const maxCapInsets = new UIEdgeInsets({
					top: 0,
					left: trackHeight / 2,
					bottom: 0,
					right: trackHeight / 2,
				});
				const maxStretchableImage = maxTrackImage.resizableImageWithCapInsetsResizingMode(maxCapInsets, UIImageResizingMode.Stretch);
				nativeView.setMaximumTrackImageForState(maxStretchableImage, UIControlState.Normal);
			}
		}
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
