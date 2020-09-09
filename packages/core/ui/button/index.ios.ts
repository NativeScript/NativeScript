import { ControlStateChangeListener } from '../core/control-state-change';
import { ButtonBase } from './button-common';
import { View, PseudoClassHandler } from '../core/view';
import { borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length, zIndexProperty, minWidthProperty, minHeightProperty } from '../styling/style-properties';
import { textAlignmentProperty, whiteSpaceProperty, WhiteSpace } from '../text-base';
import { TextAlignment } from '../enums';
import { profile } from '../../profiling';
import { TouchGestureEventData, GestureTypes, TouchAction } from '../gestures';
import { Device } from '../../platform';
import { layout } from '../../utils';

export * from './button-common';

export class Button extends ButtonBase {
	public nativeViewProtected: UIButton;

	private _tapHandler: NSObject;
	private _stateChangedHandler: ControlStateChangeListener;

	createNativeView() {
		return UIButton.buttonWithType(UIButtonType.System);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
		nativeView.addTargetActionForControlEvents(this._tapHandler, 'tap', UIControlEvents.TouchUpInside);
	}

	public disposeNativeView(): void {
		this._tapHandler = null;
		super.disposeNativeView();
	}

	get ios() {
		return this.nativeViewProtected;
	}

	public onUnloaded() {
		super.onUnloaded();
		if (this._stateChangedHandler) {
			this._stateChangedHandler.stop();
		}
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		if (subscribe) {
			if (!this._stateChangedHandler) {
				this._stateChangedHandler = new ControlStateChangeListener(this.nativeViewProtected, (s: string) => {
					this._goToVisualState(s);
				});
			}
			this._stateChangedHandler.start();
		} else {
			this._stateChangedHandler.stop();
		}
	}

	[borderTopWidthProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.top,
			unit: 'px',
		};
	}
	[borderTopWidthProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[borderRightWidthProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.right,
			unit: 'px',
		};
	}
	[borderRightWidthProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[borderBottomWidthProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.bottom,
			unit: 'px',
		};
	}
	[borderBottomWidthProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}

	[borderLeftWidthProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.left,
			unit: 'px',
		};
	}
	[borderLeftWidthProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingTopProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.top,
			unit: 'px',
		};
	}
	[paddingTopProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingRightProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.right,
			unit: 'px',
		};
	}
	[paddingRightProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[paddingBottomProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.bottom,
			unit: 'px',
		};
	}
	[paddingBottomProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}

	[paddingLeftProperty.getDefault](): Length {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.left,
			unit: 'px',
		};
	}
	[paddingLeftProperty.setNative](value: Length) {
		let inset = this.nativeViewProtected.contentEdgeInsets;
		let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[textAlignmentProperty.setNative](value: TextAlignment) {
		switch (value) {
			case 'left':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Left;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left;
				break;
			case 'initial':
			case 'center':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Center;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Center;
				break;
			case 'right':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Right;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Right;
				break;
		}
	}

	[whiteSpaceProperty.setNative](value: WhiteSpace) {
		const nativeView = this.nativeViewProtected.titleLabel;
		switch (value) {
			case 'normal':
				nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
				nativeView.numberOfLines = 0;
				break;
			case 'nowrap':
			case 'initial':
				nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingMiddle;
				nativeView.numberOfLines = 1;
				break;
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// If there is text-wrap UIButton.sizeThatFits will return wrong result (not respecting the text wrap).
		// So fallback to original onMeasure if there is no text-wrap and use custom measure otherwise.
		if (!this.textWrap) {
			return super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		}

		let nativeView = this.nativeViewProtected;
		if (nativeView) {
			const width = layout.getMeasureSpecSize(widthMeasureSpec);
			const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
			const height = layout.getMeasureSpecSize(heightMeasureSpec);
			const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

			const horizontalPadding = this.effectivePaddingLeft + this.effectiveBorderLeftWidth + this.effectivePaddingRight + this.effectiveBorderRightWidth;
			let verticalPadding = this.effectivePaddingTop + this.effectiveBorderTopWidth + this.effectivePaddingBottom + this.effectiveBorderBottomWidth;

			// The default button padding for UIButton - 6dip top and bottom.
			if (verticalPadding === 0) {
				verticalPadding = layout.toDevicePixels(12);
			}

			const desiredSize = layout.measureNativeView(nativeView.titleLabel, width - horizontalPadding, widthMode, height - verticalPadding, heightMode);

			desiredSize.width = desiredSize.width + horizontalPadding;
			desiredSize.height = desiredSize.height + verticalPadding;

			const measureWidth = Math.max(desiredSize.width, this.effectiveMinWidth);
			const measureHeight = Math.max(desiredSize.height, this.effectiveMinHeight);

			const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
			const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

			this.setMeasuredDimension(widthAndState, heightAndState);
		}
	}
}

@NativeClass
class TapHandlerImpl extends NSObject {
	private _owner: WeakRef<Button>;

	public static initWithOwner(owner: WeakRef<Button>): TapHandlerImpl {
		let handler = <TapHandlerImpl>TapHandlerImpl.new();
		handler._owner = owner;
		return handler;
	}

	public tap(args) {
		// _owner is a {N} view which could get destroyed when a tap initiates (protect!)
		if (this._owner) {
			let owner = this._owner.get();
			if (owner) {
				owner._emit(ButtonBase.tapEvent);
			}
		}
	}

	public static ObjCExposedMethods = {
		tap: { returns: interop.types.void, params: [interop.types.id] },
	};
}
