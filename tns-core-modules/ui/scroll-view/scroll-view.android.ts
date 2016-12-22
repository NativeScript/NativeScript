import { ScrollEventData } from "ui/scroll-view";
import { ScrollViewBase, layout } from "./scroll-view-common";

export * from "./scroll-view-common";

export class ScrollView extends ScrollViewBase {
    private _android: org.nativescript.widgets.VerticalScrollView | org.nativescript.widgets.HorizontalScrollView;
    private _androidViewId: number = -1;
    private handler: android.view.ViewTreeObserver.OnScrollChangedListener;
    get android(): android.view.ViewGroup {
        return this._android;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._android;
    }

    get horizontalOffset(): number {
        if (!this._android) {
            return 0;
        }

        return this._android.getScrollX() / layout.getDisplayDensity();
    }

    get verticalOffset(): number {
        if (!this._android) {
            return 0;
        }

        return this._android.getScrollY() / layout.getDisplayDensity();
    }

    get scrollableWidth(): number {
        if (!this._android || this.orientation !== "horizontal") {
            return 0;
        }

        return this._android.getScrollableLength() / layout.getDisplayDensity();
    }

    get scrollableHeight(): number {
        if (!this._android || this.orientation !== "vertical") {
            return 0;
        }

        return this._android.getScrollableLength() / layout.getDisplayDensity();
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        if (this._android && this.orientation === "vertical") {
            value *= layout.getDisplayDensity();

            if (animated) {
                this._android.smoothScrollTo(0, value);
            } else {
                this._android.scrollTo(0, value);
            }
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        if (this._android && this.orientation === "horizontal") {
            value *= layout.getDisplayDensity();

            if (animated) {
                this._android.smoothScrollTo(value, 0);
            } else {
                this._android.scrollTo(value, 0);
            }
        }
    }

    public _createUI() {
        if (this.orientation === "horizontal") {
            this._android = new org.nativescript.widgets.HorizontalScrollView(this._context);
        } else {
            this._android = new org.nativescript.widgets.VerticalScrollView(this._context);
        }

        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }

        this._android.setId(this._androidViewId);
    }

    public _onOrientationChanged() {
        if (this._android) {
            const parent = this.parent;

            if (parent) {
                parent._removeView(this);
            }

            if (parent) {
                parent._addView(this);
            }
        }
    }

    protected attachNative() {
        const that = new WeakRef(this);
        this.handler = new android.view.ViewTreeObserver.OnScrollChangedListener({
            onScrollChanged: function () {
                const owner: ScrollView = that.get();
                if (owner) {
                    owner._onScrollChanged();
                }
            }
        });

        this._android.getViewTreeObserver().addOnScrollChangedListener(this.handler);
    }

    private _lastScrollX: number = -1;
    private _lastScrollY: number = -1;
    private _onScrollChanged() {
        if (this.android) {
            // Event is only raised if the scroll values differ from the last time in order to wokraround a native Android bug.
            // https://github.com/NativeScript/NativeScript/issues/2362
            let newScrollX = this.android.getScrollX();
            let newScrollY = this.android.getScrollY();
            if (newScrollX !== this._lastScrollX || newScrollY !== this._lastScrollY) {
                this.notify(<ScrollEventData>{
                    object: this,
                    eventName: ScrollView.scrollEvent,
                    scrollX: newScrollX / layout.getDisplayDensity(),
                    scrollY: newScrollY / layout.getDisplayDensity()
                });
                this._lastScrollX = newScrollX;
                this._lastScrollY = newScrollY;
            }
        }
    }

    protected dettachNative() {
        this._android.getViewTreeObserver().removeOnScrollChangedListener(this.handler);
        this.handler = null;
    }
}