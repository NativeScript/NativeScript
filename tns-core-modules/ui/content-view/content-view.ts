import definition = require("ui/content-view");
import view = require("ui/core/view");
import * as utils from "utils/utils";

export class ContentView extends view.CustomLayoutView implements definition.ContentView, view.AddChildFromBuilder {
    private _content: view.View;

    get content(): view.View {
        return this._content;
    }
    set content(value: view.View) {
        var oldView = this._content;
        if (this._content) {
            this._removeView(this._content);
        }

        this._content = value;

        if (this._content) {
            this._addView(this._content);
        }

        this._onContentChanged(oldView, value);
    }

    get layoutView(): view.View {
        var result: view.View;

        if (this._content) {
            let first = true;
            this._content._eachLayoutView((child) => {
                if (first) {
                    first = false;
                    result = child;
                } else {
                    throw new Error("More than one layout child inside a ContentView");
                }
            });
        }

        return result;
    }

    get _childrenCount(): number {
        if (this._content) {
            return 1;
        }

        return 0;
    }

    public _onContentChanged(oldView: view.View, newView: view.View) {
        //
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof view.View) {
            this.content = value;
        }
    }

    public _eachChildView(callback: (child: view.View) => boolean) {
        if (this._content) {
            callback(this._content);
        }
    }

    // This method won't be called in Android because we use the native android layout.
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        view.View.adjustChildLayoutParams(this.layoutView, widthMeasureSpec, heightMeasureSpec);

        var result = view.View.measureChild(this, this.layoutView, widthMeasureSpec, heightMeasureSpec);

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();
        var measureWidth = Math.max(result.measuredWidth, this.minWidth * density);
        var measureHeight = Math.max(result.measuredHeight, this.minHeight * density);

        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    // This method won't be called in Android because we use the native android layout.
    public onLayout(left: number, top: number, right: number, bottom: number): void {
        view.View.layoutChild(this, this.layoutView, 0, 0, right - left, bottom - top);

        view.View.restoreChildOriginalParams(this.layoutView);
    }
}