import { ButtonBase } from './button-common';
import { PseudoClassHandler } from '../core/view';
import { zIndexProperty, minWidthProperty, minHeightProperty, paddingInternalProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, _hasPaddingSetNativeOverrides } from '../styling/style-properties';
import { Length } from '../styling/length-shared';
import { textAlignmentProperty } from '../text-base';
import { CoreTypes } from '../../core-types';
import { profile } from '../../profiling';
import { TouchGestureEventData, TouchAction, GestureTypes } from '../gestures';
import { SDK_VERSION } from '../../utils/constants';

export * from './button-common';

interface ClickListener {
	new (owner: Button): android.view.View.OnClickListener;
}

let ClickListener: ClickListener;
let AndroidButton: typeof android.widget.Button;

function initializeClickListener(): void {
	if (ClickListener) {
		return;
	}

	@NativeClass
	@Interfaces([android.view.View.OnClickListener])
	class ClickListenerImpl extends java.lang.Object implements android.view.View.OnClickListener {
		constructor(public owner: Button) {
			super();

			return global.__native(this);
		}

		public onClick(v: android.view.View): void {
			const owner = this.owner;
			if (owner) {
				owner._emit(ButtonBase.tapEvent);
			}
		}
	}

	ClickListener = ClickListenerImpl;
}

function onButtonStateChange(args: TouchGestureEventData) {
	const button = args.object as Button;

	switch (args.action) {
		case TouchAction.up:
		case TouchAction.cancel:
			button._removeVisualState('highlighted');
			break;
		case TouchAction.down:
			button._addVisualState('highlighted');
			break;
	}
}

export class Button extends ButtonBase {
	nativeViewProtected: android.widget.Button;

	private _stateListAnimator: any;

	@profile
	public createNativeView() {
		if (!AndroidButton) {
			AndroidButton = android.widget.Button;
		}

		return new AndroidButton(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		// make consistent with iOS, easier on users given css styling
		nativeView.setAllCaps(false);
		initializeClickListener();
		const clickListener = new ClickListener(this);
		nativeView.setOnClickListener(clickListener);
		(<any>nativeView).clickListener = clickListener;
	}

	public disposeNativeView() {
		if ((<any>this.nativeViewProtected)?.clickListener) {
			(<any>this.nativeViewProtected).clickListener.owner = null;
		}
		super.disposeNativeView();
	}

	public resetNativeView(): void {
		super.resetNativeView();

		if (this._stateListAnimator && SDK_VERSION >= 21) {
			this.nativeViewProtected.setStateListAnimator(this._stateListAnimator);
			this._stateListAnimator = undefined;
		}
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		if (subscribe) {
			this.on(GestureTypes[GestureTypes.touch], onButtonStateChange);
		} else {
			this.off(GestureTypes[GestureTypes.touch], onButtonStateChange);
			this._removeVisualState('highlighted');
		}
	}

	override get needsNativeDrawableFill(): boolean {
		return true;
	}

	[minWidthProperty.getDefault](): CoreTypes.LengthType {
		const dips = org.nativescript.widgets.ViewHelper.getMinWidth(this.nativeViewProtected);

		return { value: dips, unit: 'px' };
	}

	[minHeightProperty.getDefault](): CoreTypes.LengthType {
		const dips = org.nativescript.widgets.ViewHelper.getMinHeight(this.nativeViewProtected);

		return { value: dips, unit: 'px' };
	}

	// When no subclass overrides the per-side handlers, they stage into
	// _pendingPadding - which only exists while [paddingInternalProperty.setNative]
	// runs - and all sides commit in one native write. An override takes ownership:
	// the consolidated write stands down and each side applies individually, so an
	// override that does not chain to super suppresses that side entirely.
	private _pendingPadding: { top: number; right: number; bottom: number; left: number };

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}

	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		const padding = Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0);
		if (this._pendingPadding) {
			this._pendingPadding.top = padding;
		} else if (_hasPaddingSetNativeOverrides(this, Button.prototype)) {
			org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeViewProtected, padding);
		}
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}

	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		const padding = Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0);
		if (this._pendingPadding) {
			this._pendingPadding.right = padding;
		} else if (_hasPaddingSetNativeOverrides(this, Button.prototype)) {
			org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeViewProtected, padding);
		}
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}

	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		const padding = Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0);
		if (this._pendingPadding) {
			this._pendingPadding.bottom = padding;
		} else if (_hasPaddingSetNativeOverrides(this, Button.prototype)) {
			org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeViewProtected, padding);
		}
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}

	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		const padding = Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0);
		if (this._pendingPadding) {
			this._pendingPadding.left = padding;
		} else if (_hasPaddingSetNativeOverrides(this, Button.prototype)) {
			org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeViewProtected, padding);
		}
	}

	[paddingInternalProperty.setNative](_value: string) {
		if (_hasPaddingSetNativeOverrides(this, Button.prototype)) {
			// An override owns padding application; each side applies through its own handler.
			return;
		}
		const nativeView = this.nativeViewProtected;
		this._pendingPadding = { top: nativeView.getPaddingTop(), right: nativeView.getPaddingRight(), bottom: nativeView.getPaddingBottom(), left: nativeView.getPaddingLeft() };
		(<any>this)[paddingTopProperty.setNative](this.style.paddingTop);
		(<any>this)[paddingRightProperty.setNative](this.style.paddingRight);
		(<any>this)[paddingBottomProperty.setNative](this.style.paddingBottom);
		(<any>this)[paddingLeftProperty.setNative](this.style.paddingLeft);
		nativeView.setPadding(this._pendingPadding.left, this._pendingPadding.top, this._pendingPadding.right, this._pendingPadding.bottom);
		this._pendingPadding = null;
	}

	[zIndexProperty.setNative](value: number) {
		if (SDK_VERSION >= 21) {
			const nativeView = this.nativeViewProtected;
			if (!this._stateListAnimator) {
				this._stateListAnimator = (<any>nativeView).getStateListAnimator();
			}
			(<any>nativeView).setStateListAnimator(null);
		}

		org.nativescript.widgets.ViewHelper.setZIndex(this.nativeViewProtected, value);
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		// Button initial value is center
		const newValue = value === 'initial' ? 'center' : value;
		super[textAlignmentProperty.setNative](newValue);
	}

	protected getDefaultElevation(): number {
		if (SDK_VERSION < 21) {
			return 0;
		}

		// NOTE: Button widget has StateListAnimator that defines the elevation value and
		// at the time of the getDefault() query the animator is not applied yet so we
		// return the hardcoded @dimen/button_elevation_material value 2dp here instead
		return 2;
	}

	protected getDefaultDynamicElevationOffset(): number {
		if (SDK_VERSION < 21) {
			return 0;
		}

		return 4; // 4dp @dimen/button_pressed_z_material
	}
}

Button.prototype._ignoreFlexMinWidthHeightReset = true;
