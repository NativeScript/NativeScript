import { Background } from '../styling/background';

import { SliderBase, valueProperty, minValueProperty, maxValueProperty, minTrackGradientProperty, maxTrackGradientProperty } from './index.shared';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Screen } from '../../platform';
import { AccessibilityDecrementEventData, AccessibilityIncrementEventData } from './slider-accessibilityEvents';
import { LinearGradient } from '../styling/linear-gradient';

export * from './index.shared';

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
		//
	}

	[minTrackGradientProperty.setNative](value: LinearGradient | null) {
		if (!this.ios) {
			return;
		}

		if (!value) {
			// Reset to tint color behavior by clearing custom images
			this.ios.setMinimumTrackImageForState(null, UIControlState.Normal);
			return;
		}

		// Calculate optimal size based on screen density and track height
		// Get track rect with proper conversion to CGRect
		const bounds = this.ios.bounds;
		const trackRect = this.ios.trackRectForBounds(bounds as CGRect);
		const height = Math.max(2, trackRect.size.height);
		// Width is set to 3x height to ensure proper gradient quality when scaled
		const size = CGSizeMake(height * 3, height);
		const image = this.gradientToImage(value, size, true);
		this.ios.setMinimumTrackImageForState(image, UIControlState.Normal);
	}

	[maxTrackGradientProperty.setNative](value: LinearGradient | null) {
		if (!this.ios) {
			return;
		}

		if (!value) {
			this.ios.setMaximumTrackImageForState(null, UIControlState.Normal);
			return;
		}

		// Calculate optimal size based on screen density and track height
		// Get track rect with proper conversion to CGRect
		const bounds = this.ios.bounds;
		const trackRect = this.ios.trackRectForBounds(bounds as CGRect);
		const height = Math.max(2, trackRect.size.height);
		// Width is set to 3x height to ensure proper gradient quality when scaled
		const size = CGSizeMake(height * 3, height);
		const image = this.gradientToImage(value, size, false);
		this.ios.setMaximumTrackImageForState(image, UIControlState.Normal);
	}

	private gradientToImage = (gradient: LinearGradient, size: CGSize, isMinTrack: boolean): UIImage => {
		const scale = Screen.mainScreen.scale || 1;
		const rect = CGRectMake(0, 0, size.width, size.height);

		// Begin graphics context with proper scale
		UIGraphicsBeginImageContextWithOptions(rect.size as any, false, scale);
		const context = UIGraphicsGetCurrentContext();

		if (!context) {
			console.error('Failed to create graphics context');
			return UIImage.new();
		}

		// Create CAGradientLayer
		const gradientLayer = CAGradientLayer.layer();
		const colors = NSMutableArray.new();
		const locations = NSMutableArray.new();

		// Process color stops with proper offset handling
		for (let i = 0; i < gradient.colorStops.length; i++) {
			const stop = gradient.colorStops[i];
			colors.addObject(stop.color.ios.CGColor);

			let offset: number;
			if (stop.offset) {
				offset = stop.offset.unit === '%' ? stop.offset.value / 100 : stop.offset.value;
			} else {
				// If no offset specified, distribute evenly
				offset = i / (gradient.colorStops.length - 1);
			}
			locations.addObject(NSNumber.numberWithFloat(offset));
		}

		gradientLayer.colors = colors;
		gradientLayer.locations = locations;

		// Convert angle to start/end points with proper orientation
		const angle = (gradient.angle || 0) * (Math.PI / 180);
		let startPoint: CGPoint;
		let endPoint: CGPoint;

		// Handle vertical gradients specially for better track appearance
		if (Math.abs(Math.sin(angle)) > 0.99) {
			// For vertical gradients (90° or 270°), use full height
			startPoint = CGPointMake(0.5, angle > 0 ? 0 : 1);
			endPoint = CGPointMake(0.5, angle > 0 ? 1 : 0);
		} else {
			// For all other angles, use the standard calculation
			const halfX = Math.cos(angle);
			const halfY = Math.sin(angle);
			startPoint = CGPointMake(0.5 - halfX / 2, 0.5 - halfY / 2);
			endPoint = CGPointMake(0.5 + halfX / 2, 0.5 + halfY / 2);
		}

		gradientLayer.startPoint = startPoint;
		gradientLayer.endPoint = endPoint;
		gradientLayer.frame = rect;

		// Apply corner radius if needed for rounded track appearance
		gradientLayer.cornerRadius = size.height / 2;

		// Render gradient layer
		gradientLayer.renderInContext(context);

		// Get image from context
		const image = UIGraphicsGetImageFromCurrentImageContext();
		UIGraphicsEndImageContext();

		if (!image) {
			console.error('Failed to create gradient image');
			return UIImage.new();
		}

		// Calculate proper insets for resizable image
		// Center portion is 1px wide to ensure clean stretching
		const capWidth = Math.floor(size.width / 3);
		const insets = { top: 0, left: capWidth, bottom: 0, right: capWidth };

		return image.resizableImageWithCapInsets(insets as UIEdgeInsets);
	};

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
			eventName: SliderBase.accessibilityDecrementEvent,
			value: this.value - this.getAccessibilityStep(),
		};

		this.notify(args);

		return args.value;
	}
}
