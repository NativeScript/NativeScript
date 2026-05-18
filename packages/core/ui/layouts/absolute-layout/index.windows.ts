export * from './absolute-layout-common';

import { AbsoluteLayoutBase, leftProperty, topProperty } from './absolute-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

function setCanvasAttachedProperty(setterName: string, native: any, value: number) {
	try {
		const Canvas = Windows.UI.Xaml.Controls.Canvas as any;
		if (Canvas && typeof Canvas[setterName] === 'function') {
			Canvas[setterName](native, value);
		}
	} catch (_e) {}
}

// Attach native setters on View so Canvas attached properties apply to native elements
(View.prototype as any)[leftProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('SetLeft', native, value);
	}
};

(View.prototype as any)[topProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('SetTop', native, value);
	}
};

export class AbsoluteLayout extends AbsoluteLayoutBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Canvas;
	private _windows: Windows.UI.Xaml.Controls.Canvas;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Canvas();
	}

	public createNativeView() {
		return this._windows;
	}

	public onLeftChanged(view: View, oldValue: any, newValue: any) {
		this.requestLayout();
	}

	public onTopChanged(view: View, oldValue: any, newValue: any) {
		this.requestLayout();
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		let measureWidth = 0;
		let measureHeight = 0;

		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const childMeasureSpec = layout.makeMeasureSpec(0, layout.UNSPECIFIED);

		this.eachLayoutChild((child, last) => {
			const childSize = View.measureChild(this, child, childMeasureSpec, childMeasureSpec);
			measureWidth = Math.max(measureWidth, child.effectiveLeft + childSize.measuredWidth);
			measureHeight = Math.max(measureHeight, child.effectiveTop + childSize.measuredHeight);
		});

		measureWidth += this.effectiveBorderLeftWidth + this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderRightWidth;
		measureHeight += this.effectiveBorderTopWidth + this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderBottomWidth;

		measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
		measureHeight = Math.max(measureHeight, this.effectiveMinHeight);

		const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		const insets = this.getSafeAreaInsets();
		this.eachLayoutChild((child, last) => {
			const childWidth = child.getMeasuredWidth();
			const childHeight = child.getMeasuredHeight();

			const childLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + child.effectiveLeft + insets.left;
			const childTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + child.effectiveTop + insets.top;
			const childRight = childLeft + childWidth + child.effectiveMarginLeft + child.effectiveMarginRight;
			const childBottom = childTop + childHeight + child.effectiveMarginTop + child.effectiveMarginBottom;

			View.layoutChild(this, child, childLeft, childTop, childRight, childBottom);
		});
	}
}
