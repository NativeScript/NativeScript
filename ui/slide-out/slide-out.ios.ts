import common = require("ui/slide-out/slide-out-common");
import view = require("ui/core/view");
import application = require("application");
import gestures = require("ui/gestures");

export class SlideOutControl extends common.SlideOutControl {
    constructor() {
        super();

        this._ios = new UIView();

        this.observe(gestures.GestureTypes.swipe, (args) => {
            var swipeArgs = <gestures.SwipeGestureEventData>args;
            if (swipeArgs.direction === gestures.SwipeDirection.left) {
                this._toggleSlideContentVisibility(false);
            } else if (swipeArgs.direction === gestures.SwipeDirection.right) {
                this._toggleSlideContentVisibility(true);
            }
        });
    }

    private _ios: any;
    get ios(): any {
        return this._ios;
    }

    private _toggleSlideContentVisibility(value: boolean): void {
        if (this.slideContent && this.slideContent.ios) {
            this.slideContent.ios.hidden = !value;
        }
    }

    public openSlideContent(): void {
        this._toggleSlideContentVisibility(true);
    }

    public closeSlideContent(): void {
        this._toggleSlideContentVisibility(false);
    }

    //public _measureOverride(availableSize: geometry.Size): geometry.Size {
    //    if (this.slideContent) {
    //        this.slideContent.measure(new geometry.Size(this.slideContentWidth, availableSize.height));
    //    }

    //    if (this.mainContent) {
    //        return this.mainContent.measure(availableSize);
    //    }

    //    return geometry.Size.zero;
    //}

    public _addViewToNativeVisualTree(view: view.View): boolean {
        super._addViewToNativeVisualTree(view);

        if (this.ios && view.ios) {
            var iOSView = <UIView>this.ios;

            if (view === this.slideContent) {
                view.ios.hidden = true;

                view.observe(gestures.GestureTypes.tap | gestures.GestureTypes.swipe, (args) => {
                    if (args.type & gestures.GestureTypes.tap) {
                        this._toggleSlideContentVisibility(false);
                    }

                    if (args.type & gestures.GestureTypes.swipe) {
                        var swipeArgs = <gestures.SwipeGestureEventData>args;
                        if (swipeArgs.direction === gestures.SwipeDirection.left) {
                            this._toggleSlideContentVisibility(false);
                        }
                    }
                });
            }

            iOSView.addSubview(view.ios);
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: view.View) {
        super._removeViewFromNativeVisualTree(child);

        // TODO: Probably remove gesture.
        if (application.ios && this.ios && child.ios) {
            var iOSView = <UIView>child.ios;
            iOSView.removeFromSuperview();
        }
    }
}