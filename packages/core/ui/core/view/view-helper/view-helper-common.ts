// Types
import { View as ViewDefinition } from '..';
import { HorizontalAlignment as HorizontalAlignmentDefinition, VerticalAlignment as VerticalAlignmentDefinition } from '../../../styling/style-properties';

// Requires
import { layout } from '../../../../utils';
import { Trace } from '../../../../trace';

export class ViewHelper {
	public static measureChild(parent: ViewDefinition, child: ViewDefinition, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
		let measureWidth = 0;
		let measureHeight = 0;

		if (child && !child.isCollapsed) {
			const widthSpec = parent ? parent._currentWidthMeasureSpec : widthMeasureSpec;
			const heightSpec = parent ? parent._currentHeightMeasureSpec : heightMeasureSpec;

			const width = layout.getMeasureSpecSize(widthSpec);
			const widthMode = layout.getMeasureSpecMode(widthSpec);

			const height = layout.getMeasureSpecSize(heightSpec);
			const heightMode = layout.getMeasureSpecMode(heightSpec);

			child._updateEffectiveLayoutValues(width, widthMode, height, heightMode);

			const style = child.style;
			const horizontalMargins = child.effectiveMarginLeft + child.effectiveMarginRight;
			const verticalMargins = child.effectiveMarginTop + child.effectiveMarginBottom;

			const childWidthMeasureSpec = ViewHelper.getMeasureSpec(widthMeasureSpec, horizontalMargins, child.effectiveWidth, style.horizontalAlignment === 'stretch');
			const childHeightMeasureSpec = ViewHelper.getMeasureSpec(heightMeasureSpec, verticalMargins, child.effectiveHeight, style.verticalAlignment === 'stretch');

			if (Trace.isEnabled()) {
				Trace.write(`${child.parent} :measureChild: ${child} ${layout.measureSpecToString(childWidthMeasureSpec)}, ${layout.measureSpecToString(childHeightMeasureSpec)}}`, Trace.categories.Layout);
			}

			child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
			measureWidth = Math.round(child.getMeasuredWidth() + horizontalMargins);
			measureHeight = Math.round(child.getMeasuredHeight() + verticalMargins);
		}

		return { measuredWidth: measureWidth, measuredHeight: measureHeight };
	}

	public static layoutChild(parent: ViewDefinition, child: ViewDefinition, left: number, top: number, right: number, bottom: number, setFrame: boolean = true): void {
		if (!child || child.isCollapsed) {
			return;
		}

		let childStyle = child.style;

		let childTop: number;
		let childLeft: number;

		let childWidth = child.getMeasuredWidth();
		let childHeight = child.getMeasuredHeight();

		let effectiveMarginTop = child.effectiveMarginTop;
		let effectiveMarginBottom = child.effectiveMarginBottom;

		let vAlignment: VerticalAlignmentDefinition;
		if (child.effectiveHeight >= 0 && childStyle.verticalAlignment === 'stretch') {
			vAlignment = 'middle';
		} else {
			vAlignment = childStyle.verticalAlignment;
		}

		switch (vAlignment) {
			case 'top':
				childTop = top + effectiveMarginTop;
				break;

			case 'middle':
				childTop = top + (bottom - top - childHeight + (effectiveMarginTop - effectiveMarginBottom)) / 2;
				break;

			case 'bottom':
				childTop = bottom - childHeight - effectiveMarginBottom;
				break;

			case 'stretch':
			default:
				childTop = top + effectiveMarginTop;
				childHeight = bottom - top - (effectiveMarginTop + effectiveMarginBottom);
				break;
		}

		let effectiveMarginLeft = child.effectiveMarginLeft;
		let effectiveMarginRight = child.effectiveMarginRight;

		let hAlignment: HorizontalAlignmentDefinition;
		if (child.effectiveWidth >= 0 && childStyle.horizontalAlignment === 'stretch') {
			hAlignment = 'center';
		} else {
			hAlignment = childStyle.horizontalAlignment;
		}

		switch (hAlignment) {
			case 'left':
				childLeft = left + effectiveMarginLeft;
				break;

			case 'center':
				childLeft = left + (right - left - childWidth + (effectiveMarginLeft - effectiveMarginRight)) / 2;
				break;

			case 'right':
				childLeft = right - childWidth - effectiveMarginRight;
				break;

			case 'stretch':
			default:
				childLeft = left + effectiveMarginLeft;
				childWidth = right - left - (effectiveMarginLeft + effectiveMarginRight);
				break;
		}

		let childRight = Math.round(childLeft + childWidth);
		let childBottom = Math.round(childTop + childHeight);
		childLeft = Math.round(childLeft);
		childTop = Math.round(childTop);

		if (Trace.isEnabled()) {
			Trace.write(child.parent + ' :layoutChild: ' + child + ' ' + childLeft + ', ' + childTop + ', ' + childRight + ', ' + childBottom, Trace.categories.Layout);
		}

		child.layout(childLeft, childTop, childRight, childBottom, setFrame);
	}

	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
		let result = size;
		switch (specMode) {
			case layout.UNSPECIFIED:
				result = Math.ceil(size);
				break;

			case layout.AT_MOST:
				if (specSize < size) {
					result = Math.ceil(specSize) | layout.MEASURED_STATE_TOO_SMALL;
				}
				break;

			case layout.EXACTLY:
				result = Math.ceil(specSize);
				break;
		}

		return result | (childMeasuredState & layout.MEASURED_STATE_MASK);
	}

	public static combineMeasuredStates(curState: number, newState): number {
		return curState | newState;
	}

	private static getMeasureSpec(parentSpec: number, margins: number, childLength: number, stretched: boolean): number {
		const parentLength = layout.getMeasureSpecSize(parentSpec);
		const parentSpecMode = layout.getMeasureSpecMode(parentSpec);

		let resultSize: number;
		let resultMode: number;

		// We want a specific size... let be it.
		if (childLength >= 0) {
			// If mode !== UNSPECIFIED we take the smaller of parentLength and childLength
			// Otherwise we will need to clip the view but this is not possible in all Android API levels.
			// TODO: remove Math.min(parentLength, childLength)
			resultSize = parentSpecMode === layout.UNSPECIFIED ? childLength : Math.min(parentLength, childLength);
			resultMode = layout.EXACTLY;
		} else {
			switch (parentSpecMode) {
				// Parent has imposed an exact size on us
				case layout.EXACTLY:
					resultSize = Math.max(0, parentLength - margins);
					// if stretched - nativeView wants to be our size. So be it.
					// else - nativeView wants to determine its own size. It can't be bigger than us.
					resultMode = stretched ? layout.EXACTLY : layout.AT_MOST;
					break;

				// Parent has imposed a maximum size on us
				case layout.AT_MOST:
					resultSize = Math.max(0, parentLength - margins);
					resultMode = layout.AT_MOST;
					break;

				// Equivalent to measure with Infinity.
				case layout.UNSPECIFIED:
					resultSize = 0;
					resultMode = layout.UNSPECIFIED;
					break;
			}
		}

		return layout.makeMeasureSpec(resultSize, resultMode);
	}
}
