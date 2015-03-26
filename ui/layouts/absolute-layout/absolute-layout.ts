import layouts = require("ui/layouts/layout");
import definition = require("ui/layouts/absolute-layout");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import numberUtils = require("utils/number-utils");

function onPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var uiView = data.object;
    if (uiView instanceof view.View) {
        var layout = uiView.parent;
        if (layout instanceof AbsoluteLayout) {
            layout.requestLayout();
        }
    }
}

export class AbsoluteLayout extends layouts.Layout implements definition.AbsoluteLayout {

    public static leftProperty = new dependencyObservable.Property("left", "AbsoluteLayout",
        new dependencyObservable.PropertyMetadata(0, undefined, onPropertyChanged, numberUtils.isFiniteNumber));

    public static topProperty = new dependencyObservable.Property("top", "AbsoluteLayout",
        new dependencyObservable.PropertyMetadata(0, undefined, onPropertyChanged, numberUtils.isFiniteNumber));

    public static getLeft(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }

        return element._getValue(AbsoluteLayout.leftProperty);
    }

    public static setLeft(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(AbsoluteLayout.leftProperty, value);
    }

    public static getTop(element: view.View): number {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }

        return element._getValue(AbsoluteLayout.topProperty);
    }

    public static setTop(element: view.View, value: number): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(AbsoluteLayout.topProperty, value);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var childMeasureSpec = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);
        var density = utils.layout.getDisplayDensity();

        var count = this.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            var childSize = view.View.measureChild(this, child, childMeasureSpec, childMeasureSpec);
            measureWidth = Math.max(measureWidth, AbsoluteLayout.getLeft(child) * density + childSize.measuredWidth);
            measureHeight = Math.max(measureHeight, AbsoluteLayout.getTop(child) * density + childSize.measuredHeight);
        }

        measureWidth += (this.paddingLeft + this.paddingRight) * density;
        measureHeight += (this.paddingTop + this.paddingBottom) * density;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        var density = utils.layout.getDisplayDensity();
        var count = this.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            var childWidth = child.getMeasuredWidth();
            var childHeight = child.getMeasuredHeight();

            var childLeft = (this.paddingLeft + AbsoluteLayout.getLeft(child)) * density;
            var childTop = (this.paddingTop + AbsoluteLayout.getTop(child)) * density;
            var childRight = childLeft + childWidth + (child.marginLeft + child.marginRight) * density;
            var childBottom = childTop + childHeight + (child.marginTop + child.marginBottom) * density;

            view.View.layoutChild(this, child, childLeft, childTop, childRight, childBottom);
        }
    }
}