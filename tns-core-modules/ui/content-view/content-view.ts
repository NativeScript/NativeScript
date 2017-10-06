import { ContentView as ContentViewDefinition } from ".";
import { View, CustomLayoutView, AddChildFromBuilder, layout } from "../core/view";

export * from "../core/view";

export class ContentView extends CustomLayoutView implements ContentViewDefinition, AddChildFromBuilder {
    private _content: View;

    get content(): View {
        return this._content;
    }
    set content(value: View) {
        let oldView = this._content;
        if (this._content) {
            this._removeView(this._content);
        }

        this._content = value;

        if (this._content) {
            this._addView(this._content);
        }

        this._onContentChanged(oldView, value);
    }

    get layoutView(): View {
        let result: View;

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
        return this._content ? 1 : 0;
    }

    public _onContentChanged(oldView: View, newView: View) {
        //
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof View) {
            this.content = value;
        }
    }

    public eachChildView(callback: (child: View) => boolean) {
        const content = this._content;
        if (content) {
            callback(content);
        }
    }

    // This method won't be called in Android because we use the native android layout.
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const result = View.measureChild(this, this.layoutView, widthMeasureSpec, heightMeasureSpec);

        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const measureWidth = Math.max(result.measuredWidth, this.effectiveMinWidth);
        const measureHeight = Math.max(result.measuredHeight, this.effectiveMinHeight);

        const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    // This method won't be called in Android because we use the native android layout.
    public onLayout(left: number, top: number, right: number, bottom: number): void {
        View.layoutChild(this, this.layoutView, 0, 0, right - left, bottom - top);
    }
}

ContentView.prototype.recycleNativeView = "auto";