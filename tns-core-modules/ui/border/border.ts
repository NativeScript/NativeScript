import {Border as BorderDefinition} from "ui/border";
import {View} from "ui/core/view";
import {ContentView} from "ui/content-view";
import {layout} from "utils/utils";
import {isNumber} from "utils/types";

@Deprecated
export class Border extends ContentView implements BorderDefinition {
    get cornerRadius(): number {
        if (isNumber(this.borderRadius)){
            return <number>this.borderRadius;
        }
        return 0;
    }
    set cornerRadius(value: number) {
        this.borderRadius = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        View.adjustChildLayoutParams(this.layoutView, widthMeasureSpec, heightMeasureSpec);

        let width = layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        let height = layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let density = layout.getDisplayDensity();
        let borderWidth = 0;
        if (isNumber(this.borderWidth)){
            borderWidth = <number>this.borderWidth;
        }
        let borderSize = (2 * borderWidth) * density;

        let result = View.measureChild(this, this.layoutView,
            layout.makeMeasureSpec(width - borderSize, widthMode),
            layout.makeMeasureSpec(height - borderSize, heightMode));

        let widthAndState = View.resolveSizeAndState(result.measuredWidth + borderSize, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(result.measuredHeight + borderSize, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let density = layout.getDisplayDensity();
        let borderWidth = 0;
        if (isNumber(this.borderWidth)){
            borderWidth = <number>this.borderWidth;
        }
        let borderSize = borderWidth * density;
        View.layoutChild(this, this.layoutView, borderSize, borderSize, right - left - borderSize, bottom - top - borderSize);

        View.restoreChildOriginalParams(this.layoutView);
    }
}