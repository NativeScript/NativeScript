export * from './dock-layout-common';

import { DockLayoutBase, dockProperty, stretchLastChildProperty } from './dock-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

export class DockLayout extends DockLayoutBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Canvas;
	private _windows: Windows.UI.Xaml.Controls.Canvas;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Canvas();
	}

	public createNativeView() {
		return this._windows;
	}

	[stretchLastChildProperty.getDefault](): boolean {
		return true;
	}

	[stretchLastChildProperty.setNative](value: boolean) {
		// keep property in sync and request layout
		this.stretchLastChild = value;
		this.requestLayout();
	}

	public onDockChanged(view: View, oldValue: any, newValue: any) {
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

		const horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
		const verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

		let remainingWidth = widthMode === layout.UNSPECIFIED ? Number.MAX_VALUE : width - horizontalPaddingsAndMargins;
		let remainingHeight = heightMode === layout.UNSPECIFIED ? Number.MAX_VALUE : height - verticalPaddingsAndMargins;

		let tempHeight = 0;
		let tempWidth = 0;
		let childWidthMeasureSpec: number;
		let childHeightMeasureSpec: number;

		this.eachLayoutChild((child, last) => {
			if (this.stretchLastChild && last) {
				childWidthMeasureSpec = layout.makeMeasureSpec(remainingWidth, widthMode);
				childHeightMeasureSpec = layout.makeMeasureSpec(remainingHeight, heightMode);
			} else {
				childWidthMeasureSpec = layout.makeMeasureSpec(remainingWidth, widthMode === layout.EXACTLY ? layout.AT_MOST : widthMode);
				childHeightMeasureSpec = layout.makeMeasureSpec(remainingHeight, heightMode === layout.EXACTLY ? layout.AT_MOST : heightMode);
			}

			const childSize = View.measureChild(this, child, childWidthMeasureSpec, childHeightMeasureSpec);

			switch (child.dock) {
				case 'top':
				case 'bottom':
					remainingHeight = Math.max(0, remainingHeight - childSize.measuredHeight);
					tempHeight += childSize.measuredHeight;
					measureWidth = Math.max(measureWidth, tempWidth + childSize.measuredWidth);
					measureHeight = Math.max(measureHeight, tempHeight);
					break;

				case 'left':
				case 'right':
				default:
					remainingWidth = Math.max(0, remainingWidth - childSize.measuredWidth);
					tempWidth += childSize.measuredWidth;
					measureWidth = Math.max(measureWidth, tempWidth);
					measureHeight = Math.max(measureHeight, tempHeight + childSize.measuredHeight);
					break;
			}
		});

		measureWidth += horizontalPaddingsAndMargins;
		measureHeight += verticalPaddingsAndMargins;

		measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
		measureHeight = Math.max(measureHeight, this.effectiveMinHeight);

		const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		const insets = this.getSafeAreaInsets();
		const horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth + insets.left + insets.right;
		const verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth + insets.top + insets.bottom;

		let childLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		let childTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;

		let x = childLeft;
		let y = childTop;

		let remainingWidth = Math.max(0, right - left - horizontalPaddingsAndMargins);
		let remainingHeight = Math.max(0, bottom - top - verticalPaddingsAndMargins);

		this.eachLayoutChild((child, last) => {
			let childWidth = child.getMeasuredWidth() + child.effectiveMarginLeft + child.effectiveMarginRight;
			let childHeight = child.getMeasuredHeight() + child.effectiveMarginTop + child.effectiveMarginBottom;

			if (last && this.stretchLastChild) {
				View.layoutChild(this, child, x, y, x + remainingWidth, y + remainingHeight);
				return;
			}

			const dock = DockLayout.getDock(child);
			let childLeftPos = 0;
			let childTopPos = 0;

			switch (dock) {
				case 'top':
					childLeftPos = x;
					childTopPos = y;
					childWidth = remainingWidth;
					y += childHeight;
					remainingHeight = Math.max(0, remainingHeight - childHeight);
					break;

				case 'bottom':
					childLeftPos = x;
					childTopPos = y + remainingHeight - childHeight;
					childWidth = remainingWidth;
					remainingHeight = Math.max(0, remainingHeight - childHeight);
					break;

				case 'right':
					childLeftPos = x + remainingWidth - childWidth;
					childTopPos = y;
					childHeight = remainingHeight;
					remainingWidth = Math.max(0, remainingWidth - childWidth);
					break;

				case 'left':
				default:
					childLeftPos = x;
					childTopPos = y;
					childHeight = remainingHeight;
					x += childWidth;
					remainingWidth = Math.max(0, remainingWidth - childWidth);
					break;
			}

			View.layoutChild(this, child, childLeftPos, childTopPos, childLeftPos + childWidth, childTopPos + childHeight);
		});
	}
}
