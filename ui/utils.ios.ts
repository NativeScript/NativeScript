import {View} from "ui/core/view";
import utils = require("utils/utils");

export module ios {
    export function getActualHeight(view: UIView): number {
        if (view.window && !view.hidden) {
            return view.frame.size.height;
        }

        return 0;
    }

    export function getStatusBarHeight(): number {
        var app = UIApplication.sharedApplication();
        if (!app || app.statusBarHidden) {
            return 0;
        }

        var statusFrame = app.statusBarFrame;
        return Math.min(statusFrame.size.width, statusFrame.size.height);
    }

    export function _layoutRootView(rootView: View, parentBounds: CGRect) {
        if (!rootView || !parentBounds) {
            return;
        }

        let size = parentBounds.size;
        let width = size.width;
        let height = size.height;

        var superview = (<UIView>rootView._nativeView).superview;
        var superViewRotationRadians;
        if (superview) {
            superViewRotationRadians = atan2f(superview.transform.b, superview.transform.a);
        }

        if (utils.ios.MajorVersion < 8 && utils.ios.isLandscape() && !superViewRotationRadians) {
            // in iOS 7 when in landscape we switch width with height because on device they don't change even when rotated.
            width = size.height;
            height = size.width;
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