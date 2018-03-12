import { Border as BorderDefinition } from ".";
import { ContentView, View, layout, CSSType } from "../content-view";

@Deprecated
@CSSType("Border")
export class Border extends ContentView implements BorderDefinition {
    get cornerRadius(): number {
        if (typeof this.borderRadius === "number") {
            return <number>this.borderRadius;
        }
        return 0;
    }
    set cornerRadius(value: number) {
        this.borderRadius = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const horizontalBorderLength = this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        const verticalBorderLength = this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

        const result = View.measureChild(this, this.layoutView,
            layout.makeMeasureSpec(width - horizontalBorderLength, widthMode),
            layout.makeMeasureSpec(height - verticalBorderLength, heightMode));

        const widthAndState = View.resolveSizeAndState(result.measuredWidth + horizontalBorderLength, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(result.measuredHeight + verticalBorderLength, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let horizontalBorderLength = this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        let verticalBorderLength = this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

        View.layoutChild(this, this.layoutView, this.effectiveBorderLeftWidth, this.effectiveBorderTopWidth, right - left - horizontalBorderLength, bottom - top - verticalBorderLength);
    }
}

Border.prototype.recycleNativeView = "auto";