import definition = require("ui/border");
import color = require("color");
import proxy = require("ui/core/proxy");
import contentView = require("ui/content-view");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");
import viewModule = require("ui/core/view");
import utils = require("utils/utils");

var cornerRadiusProperty = new dependencyObservable.Property(
    "cornerRadius",
    "Border",
    new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.AffectsStyle)
    );

var borderWidthProperty = new dependencyObservable.Property(
    "borderWidth",
    "Border",
    new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.AffectsStyle)
    );

var borderColorProperty = new dependencyObservable.Property(
    "borderColor",
    "Border",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle)
    );

@Deprecated
export class Border extends contentView.ContentView implements definition.Border {

    public static cornerRadiusProperty = cornerRadiusProperty;
    public static borderWidthProperty = borderWidthProperty;
    public static borderColorProperty = borderColorProperty;

    get cornerRadius(): number {
        return this._getValue(Border.cornerRadiusProperty);
    }
    set cornerRadius(value: number) {
        this._setValue(Border.cornerRadiusProperty, value);
    }

    get borderWidth(): number {
        return this._getValue(Border.borderWidthProperty);
    }
    set borderWidth(value: number) {
        this._setValue(Border.borderWidthProperty, value);
    }

    get borderColor(): color.Color {
        return this._getValue(Border.borderColorProperty);
    }
    set borderColor(value: color.Color) {
        if (types.isString(value) || types.isNumber(value)) {
            this._setValue(Border.borderColorProperty, new color.Color(<any>value));
        } else {
            this._setValue(Border.borderColorProperty, value);
        }
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

    public _updateAndroidBorder() {
        // This is android specific method.
    }
}