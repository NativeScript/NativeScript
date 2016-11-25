import { Border as BorderDefinition } from "ui/border";
import { View } from "ui/core/view";
import { ContentView } from "ui/content-view";
import { layout } from "utils/utils";
import { isNumber } from "utils/types";

@Deprecated
export class Border extends ContentView implements BorderDefinition {
    get cornerRadius(): number {
        if (isNumber(this.borderRadius)) {
            return <number>this.borderRadius;
        }
        return 0;
    }
    set cornerRadius(value: number) {
        this.borderRadius = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let width = layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        let height = layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let style = this.style;
        let horizontalBorderLength = style.effectiveBorderLeftWidth + style.effectiveBorderRightWidth;
        let verticalBorderLength = style.effectiveBorderTopWidth + style.effectiveBorderBottomWidth;

        let result = View.measureChild(this, this.layoutView,
            layout.makeMeasureSpec(width - horizontalBorderLength, widthMode),
            layout.makeMeasureSpec(height - verticalBorderLength, heightMode));

        let widthAndState = View.resolveSizeAndState(result.measuredWidth + horizontalBorderLength, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(result.measuredHeight + verticalBorderLength, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let density = layout.getDisplayDensity();
        let style = this.style;
        let horizontalBorderLength = style.effectiveBorderLeftWidth + style.effectiveBorderRightWidth;
        let verticalBorderLength = style.effectiveBorderTopWidth + style.effectiveBorderBottomWidth;

        View.layoutChild(this, this.layoutView, style.effectiveBorderLeftWidth, style.effectiveBorderTopWidth, right - left - horizontalBorderLength, bottom - top - verticalBorderLength);
    }
}