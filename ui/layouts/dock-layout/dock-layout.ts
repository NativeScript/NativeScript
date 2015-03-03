import layouts = require("ui/layouts/layout");
import definition = require("ui/layouts/dock-layout");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");

function isDockValid(value: any): boolean {
    return value === enums.Dock.left || value === enums.Dock.top || value === enums.Dock.right || value === enums.Dock.bottom;
}

function onDockPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var uiView = data.object;
    if (uiView instanceof view.View) {
        var layout = (<view.View>uiView).parent;
        if (layout instanceof DockLayout) {
            layout.requestLayout();
        }
    }
}

export class DockLayout extends layouts.Layout implements definition.DockLayout {

    public static dockProperty = new dependencyObservable.Property(
        "dock", "DockLayout", new dependencyObservable.PropertyMetadata(enums.Dock.left, undefined, onDockPropertyChanged, isDockValid));

    public static stretchLastChildProperty = new dependencyObservable.Property(
        "stretchLastChild", "DockLayout", new proxy.PropertyMetadata(true, dependencyObservable.PropertyMetadataSettings.AffectsLayout));

    public static getDock(element: view.View): string {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }

        return element._getValue(DockLayout.dockProperty);
    }

    public static setDock(element: view.View, value: string): void {
        if (!element) {
            throw new Error("element cannot be null or undefinied.");
        }
        element._setValue(DockLayout.dockProperty, value);
    }

    get stretchLastChild(): boolean {
        return this._getValue(DockLayout.stretchLastChildProperty);
    }
    set stretchLastChild(value: boolean) {
        this._setValue(DockLayout.stretchLastChildProperty, value);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();

        var remainingWidth = widthMode === utils.layout.UNSPECIFIED ? Number.MAX_VALUE : width - ((this.paddingLeft + this.paddingRight) * density);
        var remainingHeight = heightMode === utils.layout.UNSPECIFIED ? Number.MAX_VALUE : height - ((this.paddingTop + this.paddingBottom) * density);

        var tempHeight: number = 0;
        var tempWidth: number = 0;
        var childWidthMeasureSpec: number;
        var childHeightMeasureSpec: number;
        var count = this.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            if (this.stretchLastChild && i === (count - 1)) {
                childWidthMeasureSpec = utils.layout.makeMeasureSpec(remainingWidth, widthMode);
                childHeightMeasureSpec = utils.layout.makeMeasureSpec(remainingHeight, heightMode);
            }
            else {
                // Measure children with AT_MOST even if our mode is EXACT
                childWidthMeasureSpec = utils.layout.makeMeasureSpec(remainingWidth, widthMode === utils.layout.EXACTLY ? utils.layout.AT_MOST : widthMode);
                childHeightMeasureSpec = utils.layout.makeMeasureSpec(remainingHeight, heightMode === utils.layout.EXACTLY ? utils.layout.AT_MOST : heightMode);
            }

            var childSize = view.View.measureChild(this, child, childWidthMeasureSpec, childHeightMeasureSpec);

            var dock = DockLayout.getDock(child);

            switch (dock) {
                case enums.Dock.top:
                case enums.Dock.bottom:
                    remainingHeight = Math.max(0, remainingHeight - childSize.measuredHeight);
                    tempHeight += childSize.measuredHeight;
                    measureWidth = Math.max(measureWidth, tempWidth + childSize.measuredWidth);
                    measureHeight = Math.max(measureHeight, tempHeight);
                    break;

                case enums.Dock.left:
                case enums.Dock.right:
                default:
                    remainingWidth = Math.max(0, remainingWidth - childSize.measuredWidth);
                    tempWidth += childSize.measuredWidth;
                    measureWidth = Math.max(measureWidth, tempWidth);
                    measureHeight = Math.max(measureHeight, tempHeight + childSize.measuredHeight);
                    break;
            }
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

        var childLeft = this.paddingLeft * density;
        var childTop = this.paddingTop * density;

        var x = childLeft;
        var y = childTop;

        var remainingWidth = Math.max(0, right - left - ((this.paddingLeft + this.paddingRight) * density));
        var remainingHeight = Math.max(0, bottom - top - ((this.paddingTop + this.paddingBottom) * density));

        var count = this.getChildrenCount();
        var childToStretch = null;
        if (count > 0 && this.stretchLastChild) {
            count--;
            childToStretch = this.getChildAt(count);
        }

        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            var childWidth = child.getMeasuredWidth() + (child.marginLeft + child.marginRight) * density;
            var childHeight = child.getMeasuredHeight() + (child.marginTop + child.marginBottom) * density;

            var dock = DockLayout.getDock(child);
            switch (dock) {
                case enums.Dock.top:
                    childLeft = x;
                    childTop = y;
                    childWidth = remainingWidth;
                    y += childHeight;
                    remainingHeight = Math.max(0, remainingHeight - childHeight);
                    break;

                case enums.Dock.bottom:
                    childLeft = x;
                    childTop = y + remainingHeight - childHeight;
                    childWidth = remainingWidth;
                    remainingHeight = Math.max(0, remainingHeight - childHeight);
                    break;

                case enums.Dock.right:
                    childLeft = x + remainingWidth - childWidth;
                    childTop = y;
                    childHeight = remainingHeight;
                    remainingWidth = Math.max(0, remainingWidth - childWidth);
                    break;

                case enums.Dock.left:
                default:
                    childLeft = x;
                    childTop = y;
                    childHeight = remainingHeight;
                    x += childWidth;
                    remainingWidth = Math.max(0, remainingWidth - childWidth);
                    break;
            }
            view.View.layoutChild(this, child, childLeft, childTop, childLeft + childWidth, childTop + childHeight);
        }

        if (childToStretch) {
            view.View.layoutChild(this, childToStretch, x, y, x + remainingWidth, y + remainingHeight);
        }
    }
}