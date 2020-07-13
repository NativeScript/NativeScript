import { StackLayoutBase } from './stack-layout-common';
import { View } from '../../core/view';
import { VerticalAlignment, HorizontalAlignment } from '../../styling/style-properties';
import { layout } from '../../../utils';
import { Trace } from '../../../trace';

export * from './stack-layout-common';

export class StackLayout extends StackLayoutBase {
	private _totalLength = 0;

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		let measureWidth = 0;
		let measureHeight = 0;

		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		const isVertical = this.orientation === 'vertical';
		const horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
		const verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

		let measureSpec: number;

		let mode = isVertical ? heightMode : widthMode;
		let remainingLength: number;

		if (mode === layout.UNSPECIFIED) {
			measureSpec = layout.UNSPECIFIED;
			remainingLength = 0;
		} else {
			measureSpec = layout.AT_MOST;
			remainingLength = isVertical ? height - verticalPaddingsAndMargins : width - horizontalPaddingsAndMargins;
		}

		let childMeasureSpec: number;
		if (isVertical) {
			let childWidth = widthMode === layout.UNSPECIFIED ? 0 : width - horizontalPaddingsAndMargins;
			childWidth = Math.max(0, childWidth);
			childMeasureSpec = layout.makeMeasureSpec(childWidth, widthMode);
		} else {
			let childHeight = heightMode === layout.UNSPECIFIED ? 0 : height - verticalPaddingsAndMargins;
			childHeight = Math.max(0, childHeight);
			childMeasureSpec = layout.makeMeasureSpec(childHeight, heightMode);
		}

		let childSize: { measuredWidth: number; measuredHeight: number };

		this.eachLayoutChild((child, last) => {
			if (isVertical) {
				// Measuring ListView, with no height property set, with layout.AT_MOST will
				// result in total height equal to the count ot all items multiplied by DEFAULT_HEIGHT = 44 or the
				// maximum available space for the StackLayout. Any following controls will be visible only if enough space left.
				childSize = View.measureChild(this, child, childMeasureSpec, layout.makeMeasureSpec(remainingLength, measureSpec));

				if (measureSpec === layout.AT_MOST && this.isUnsizedScrollableView(child)) {
					Trace.write('Avoid using ListView or ScrollView with no explicit height set inside StackLayout. Doing so might result in poor user interface performance and poor user experience.', Trace.categories.Layout, Trace.messageType.warn);
				}

				measureWidth = Math.max(measureWidth, childSize.measuredWidth);
				let viewHeight = childSize.measuredHeight;
				measureHeight += viewHeight;
				remainingLength = Math.max(0, remainingLength - viewHeight);
			} else {
				childSize = View.measureChild(this, child, layout.makeMeasureSpec(remainingLength, measureSpec), childMeasureSpec);
				measureHeight = Math.max(measureHeight, childSize.measuredHeight);
				let viewWidth = childSize.measuredWidth;
				measureWidth += viewWidth;
				remainingLength = Math.max(0, remainingLength - viewWidth);
			}
		});

		measureWidth += horizontalPaddingsAndMargins;
		measureHeight += verticalPaddingsAndMargins;

		// Check against our minimum sizes
		measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
		measureHeight = Math.max(measureHeight, this.effectiveMinHeight);

		this._totalLength = isVertical ? measureHeight : measureWidth;

		const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		const insets = this.getSafeAreaInsets();
		if (this.orientation === 'vertical') {
			this.layoutVertical(left, top, right, bottom, insets);
		} else {
			this.layoutHorizontal(left, top, right, bottom, insets);
		}
	}

	private layoutVertical(left: number, top: number, right: number, bottom: number, insets: { left; top; right; bottom }): void {
		const paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		const paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;
		const paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight + insets.right;
		const paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom + insets.bottom;

		let childTop: number;
		let childLeft: number = paddingLeft;
		let childRight = right - left - paddingRight;

		switch (this.verticalAlignment) {
			case VerticalAlignment.MIDDLE:
				childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
				break;

			case VerticalAlignment.BOTTOM:
				childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
				break;

			case VerticalAlignment.TOP:
			case VerticalAlignment.STRETCH:
			default:
				childTop = paddingTop;
				break;
		}

		this.eachLayoutChild((child, last) => {
			const childHeight = child.getMeasuredHeight() + child.effectiveMarginTop + child.effectiveMarginBottom;

			View.layoutChild(this, child, childLeft, childTop, childRight, childTop + childHeight);
			childTop += childHeight;
		});
	}

	private layoutHorizontal(left: number, top: number, right: number, bottom: number, insets: { left; top; right; bottom }): void {
		const paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
		const paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;
		const paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight + insets.right;
		const paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom + insets.bottom;

		let childTop: number = paddingTop;
		let childLeft: number;
		let childBottom = bottom - top - paddingBottom;

		switch (this.horizontalAlignment) {
			case HorizontalAlignment.CENTER:
				childLeft = (right - left - this._totalLength) / 2 + paddingLeft - paddingRight;
				break;

			case HorizontalAlignment.RIGHT:
				childLeft = right - left - this._totalLength + paddingLeft - paddingRight;
				break;

			case HorizontalAlignment.LEFT:
			case HorizontalAlignment.STRETCH:
			default:
				childLeft = paddingLeft;
				break;
		}

		this.eachLayoutChild((child, last) => {
			const childWidth = child.getMeasuredWidth() + child.effectiveMarginLeft + child.effectiveMarginRight;

			View.layoutChild(this, child, childLeft, childTop, childLeft + childWidth, childBottom);
			childLeft += childWidth;
		});
	}

	private isUnsizedScrollableView(child: View): boolean {
		if (child.height === 'auto' && (child.ios instanceof UITableView || child.ios instanceof UIScrollView)) {
			return true;
		}

		return false;
	}
}
