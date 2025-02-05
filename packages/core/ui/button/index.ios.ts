import { ControlStateChangeListener } from '../core/control-state-change';
import { ButtonBase } from './button-common';
import { View, PseudoClassHandler } from '../core/view';
import { borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty } from '../styling/style-properties';
import { textAlignmentProperty, whiteSpaceProperty, textOverflowProperty } from '../text-base';
import { layout } from '../../utils';
import { CoreTypes } from '../../core-types';

export * from './button-common';

const observableVisualStates = ['highlighted']; // States like :disabled are handled elsewhere

export class Button extends ButtonBase {
	public nativeViewProtected: UIButton;

	private _tapHandler: NSObject;
	private _stateChangedHandler: ControlStateChangeListener;

	createNativeView() {
		const nativeView = UIButton.buttonWithType(UIButtonType.System);
		// This is the default for both platforms
		nativeView.titleLabel.textAlignment = NSTextAlignment.Center;
		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();
		this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
		this.nativeViewProtected.addTargetActionForControlEvents(this._tapHandler, 'tap', UIControlEvents.TouchUpInside);
	}

	public disposeNativeView(): void {
		this._tapHandler = null;

		if (this._stateChangedHandler) {
			this._stateChangedHandler.stop();
			this._stateChangedHandler = null;
		}

		super.disposeNativeView();
	}

	// @ts-ignore
	get ios() {
		return this.nativeViewProtected;
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		if (subscribe) {
			if (!this._stateChangedHandler) {
				const viewRef = new WeakRef<Button>(this);

				this._stateChangedHandler = new ControlStateChangeListener(this.nativeViewProtected, observableVisualStates, (state: string, add: boolean) => {
					const view = viewRef?.deref?.();

					if (view) {
						if (add) {
							view._addVisualState(state);
						} else {
							view._removeVisualState(state);
						}
					}
				});
			}
			this._stateChangedHandler.start();
		} else {
			this._stateChangedHandler.stop();

			// Remove any possible pseudo-class leftovers
			for (const state of observableVisualStates) {
				this._removeVisualState(state);
			}
		}
	}

	[borderTopWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.top,
			unit: 'px',
		};
	}
	[borderTopWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[borderRightWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.right,
			unit: 'px',
		};
	}
	[borderRightWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[borderBottomWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.bottom,
			unit: 'px',
		};
	}
	[borderBottomWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}

	[borderLeftWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.left,
			unit: 'px',
		};
	}
	[borderLeftWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.top,
			unit: 'px',
		};
	}
	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.right,
			unit: 'px',
		};
	}
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.bottom,
			unit: 'px',
		};
	}
	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeViewProtected.contentEdgeInsets.left,
			unit: 'px',
		};
	}
	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeViewProtected.contentEdgeInsets;
		const left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeViewProtected.contentEdgeInsets = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		switch (value) {
			case 'left':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Left;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left;
				break;
			case 'right':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Right;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Right;
				break;
			case 'justify':
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Justified;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Center;
				break;
			default:
				// initial | center
				this.nativeViewProtected.titleLabel.textAlignment = NSTextAlignment.Center;
				this.nativeViewProtected.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Center;
				break;
		}
	}

	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		this.adjustLineBreak();
	}

	[textOverflowProperty.setNative](value: CoreTypes.TextOverflowType) {
		this.adjustLineBreak();
	}

	private adjustLineBreak() {
		const whiteSpace = this.whiteSpace;
		const textOverflow = this.textOverflow;
		const nativeView = this.nativeViewProtected.titleLabel;
		switch (whiteSpace) {
			case 'normal':
				nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
				nativeView.numberOfLines = this.maxLines;
				break;
			case 'initial':
				nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingMiddle;
				nativeView.numberOfLines = 1;
				break;
			case 'nowrap':
				switch (textOverflow) {
					case 'clip':
						nativeView.lineBreakMode = NSLineBreakMode.ByClipping;
						nativeView.numberOfLines = this.maxLines;
						break;
					case 'ellipsis':
						nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
						nativeView.numberOfLines = 1;
						break;
					default:
						nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingMiddle;
						nativeView.numberOfLines = 1;
						break;
				}
				break;
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// If there is text-wrap UIButton.sizeThatFits will return wrong result (not respecting the text wrap).
		// So fallback to original onMeasure if there is no text-wrap and use custom measure otherwise.
		if (!this.textWrap) {
			return super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		}

		const nativeView = this.nativeViewProtected;
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
		const handler = <TapHandlerImpl>TapHandlerImpl.new();
		handler._owner = owner;
		return handler;
	}

	public tap(args) {
		// _owner is a {N} view which could get destroyed when a tap initiates (protect!)
		if (this._owner) {
			const owner = this._owner?.deref();
			if (owner) {
				owner._emit(ButtonBase.tapEvent);
			}
		}
	}

	public static ObjCExposedMethods = {
		tap: { returns: interop.types.void, params: [interop.types.id] },
	};
}
