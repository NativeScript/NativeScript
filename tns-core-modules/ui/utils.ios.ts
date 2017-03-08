import { View } from "ui/core/view";
import * as utils from "utils/utils";
import getter = utils.ios.getter;

export module ios {
    export function getActualHeight(view: UIView): number {
        if (view.window && !view.hidden) {
            return view.frame.size.height;
        }

        return 0;
    }

    export function getStatusBarHeight(): number {
        var app = getter(UIApplication, UIApplication.sharedApplication);
        if (!app || app.statusBarHidden) {
            return 0;
        }

        var statusFrame = app.statusBarFrame;
        let min = Math.min(statusFrame.size.width, statusFrame.size.height);
        return utils.layout.toDevicePixels(min);
    }

    export function _layoutRootView(rootView: View, parentBounds: CGRect) {
        if (!rootView || !parentBounds) {
            return;
        }

        let size = parentBounds.size;
        let width = utils.layout.toDevicePixels(size.width);
        let height = utils.layout.toDevicePixels(size.height);

        var superview = (<UIView>rootView._nativeView).superview;
        var superViewRotationRadians;
        if (superview) {
            superViewRotationRadians = atan2f(superview.transform.b, superview.transform.a);
        }

        var origin = parentBounds.origin;
        var left = origin.x;
        var top = origin.y;

        var widthSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
        var heightSpec = utils.layout.makeMeasureSpec(height, utils.layout.EXACTLY);

        rootView.measure(widthSpec, heightSpec);
        rootView.layout(left, top, width, height);
    }
}