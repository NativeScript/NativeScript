import definition = require("ui/border");
import contentView = require("ui/content-view");
import viewModule = require("ui/core/view");
import utils = require("utils/utils");
import types = require("utils/types");

@Deprecated
export class Border extends contentView.ContentView implements definition.Border {
    get cornerRadius(): number {
        if (types.isNumber(this.borderRadius)){
            return <number>this.borderRadius;
        }
        return 0;
    }
    set cornerRadius(value: number) {
        this.borderRadius = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();
        let borderWidth = 0;
        if (types.isNumber(this.borderWidth)){
            borderWidth = <number>this.borderWidth;
        }
        var borderSize = (2 * borderWidth) * density;

        var result = viewModule.View.measureChild(this, this.layoutView,
            utils.layout.makeMeasureSpec(width - borderSize, widthMode),
            utils.layout.makeMeasureSpec(height - borderSize, heightMode));

        var widthAndState = viewModule.View.resolveSizeAndState(result.measuredWidth + borderSize, width, widthMode, 0);
        var heightAndState = viewModule.View.resolveSizeAndState(result.measuredHeight + borderSize, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        var density = utils.layout.getDisplayDensity();
        let borderWidth = 0;
        if (types.isNumber(this.borderWidth)){
            borderWidth = <number>this.borderWidth;
        }
        var borderSize = borderWidth * density;
        viewModule.View.layoutChild(this, this.layoutView, borderSize, borderSize, right - left - borderSize, bottom - top - borderSize);
    }
}