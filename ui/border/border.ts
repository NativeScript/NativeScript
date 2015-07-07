import definition = require("ui/border");
import color = require("color");
import proxy = require("ui/core/proxy");
import contentView = require("ui/content-view");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");
import viewModule = require("ui/core/view");
import utils = require("utils/utils");

@Deprecated
export class Border extends contentView.ContentView implements definition.Border {
    get cornerRadius(): number {
        return this.borderRadius;
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
        var borderSize = (2 * this.borderWidth) * density;

        var result = viewModule.View.measureChild(this, this.content,
            utils.layout.makeMeasureSpec(width - borderSize, widthMode),
            utils.layout.makeMeasureSpec(height - borderSize, heightMode));

        var widthAndState = viewModule.View.resolveSizeAndState(result.measuredWidth + borderSize, width, widthMode, 0);
        var heightAndState = viewModule.View.resolveSizeAndState(result.measuredHeight + borderSize, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        var density = utils.layout.getDisplayDensity();
        var borderSize = this.borderWidth * density;
        viewModule.View.layoutChild(this, this.content, borderSize, borderSize, right - left - borderSize, bottom - top - borderSize);
    }
}