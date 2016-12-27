import { Border as BorderDefinition } from "ui/border";
import { ContentView, View, layout } from "ui/content-view";

@Deprecated
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
        let width = layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        let height = layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let horizontalBorderLength = this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        let verticalBorderLength = this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

        let result = View.measureChild(this, this.layoutView,
            layout.makeMeasureSpec(width - horizontalBorderLength, widthMode),
            layout.makeMeasureSpec(height - verticalBorderLength, heightMode));

        let widthAndState = View.resolveSizeAndState(result.measuredWidth + horizontalBorderLength, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(result.measuredHeight + verticalBorderLength, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let horizontalBorderLength = this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        let verticalBorderLength = this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

        View.layoutChild(this, this.layoutView, this.effectiveBorderLeftWidth, this.effectiveBorderTopWidth, right - left - horizontalBorderLength, bottom - top - verticalBorderLength);
    }
}