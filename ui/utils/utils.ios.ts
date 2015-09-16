import view = require("ui/core/view");
import utils = require("utils/utils");

export module ios {
    export function getActualHeight(uiView: UIView): number {
        if (uiView.window && !uiView.hidden) {
            return uiView.frame.size.height;
        }

        return 0;
    }

    export function _layoutRootView(rootView: view.View, parentBounds: CGRect) {
        if (!rootView || !parentBounds) {
            return;
        }

        var landscape = utils.ios.isLandscape();
        var iOSMajorVersion = utils.ios.MajorVersion;
        var size = parentBounds.size;
        var width = size.width;
        var height = size.height;

        //trace.write("--------------------------------------------", "LayoutRootView.iOS");
        //trace.write("| Layout Root View", "LayoutRootView.iOS");
        //trace.write("| rootView: " + rootView, "LayoutRootView.iOS");
        //trace.write("| parentBounds: " + NSStringFromCGRect(parentBounds), "LayoutRootView.iOS");
        //trace.write("| UIScreen.mainScreen().bounds: " + NSStringFromCGRect(UIScreen.mainScreen().bounds), "LayoutRootView.iOS");
        //trace.write("| _isModal: " + (<any>rootView)._isModal, "LayoutRootView.iOS");
        //trace.write("| _UIModalPresentationFormSheet: " + (<any>rootView)._UIModalPresentationFormSheet, "LayoutRootView.iOS");
        //trace.write("| landscape: " + landscape, "LayoutRootView.iOS");
        //trace.write("| iOSMajorVersion: " + iOSMajorVersion, "LayoutRootView.iOS");
        var superview = (<UIView>rootView._nativeView).superview;
        //trace.write("| superview: " + superview, "LayoutRootView.iOS");
        var superViewRotationRadians;
        if (superview) {
            superViewRotationRadians = atan2f(superview.transform.b, superview.transform.a);
            //trace.write("| superViewRotationRadians: " + superViewRotationRadians + " rad.", "LayoutRootView.iOS");
            //trace.write("| superview.bounds: " + NSStringFromCGRect(superview.bounds), "LayoutRootView.iOS");
        }

        if (iOSMajorVersion < 8 && landscape && !superViewRotationRadians) {
            // in iOS 7 when in landscape we switch width with height because on device they don't change even when rotated.
            //trace.write("| >>> Detected iOS 7 device in landscape mode and superview is not rotated. Manually swapping width and height...", "LayoutRootView.iOS");
            width = size.height;
            height = size.width;
        }

        var statusBarHeight;
        if (UIApplication.sharedApplication().statusBarHidden || ((<any>rootView)._UIModalPresentationFormSheet && !CGSizeEqualToSize(parentBounds.size, UIScreen.mainScreen().bounds.size))) {
            statusBarHeight = 0;
        }
        else {
            // Status bar section
            var statusFrame = UIApplication.sharedApplication().statusBarFrame;
            try {
                statusBarHeight = Math.min(statusFrame.size.width, statusFrame.size.height);
            } catch (ex) {
                console.log("exception: " + ex);
            }
        }
        //trace.write("| UIApplication.sharedApplication().statusBarHidden: " + UIApplication.sharedApplication().statusBarHidden, "LayoutRootView.iOS");
        //trace.write("| statusBarHeight: " + statusBarHeight, "LayoutRootView.iOS");

        var origin = parentBounds.origin;
        var left = origin.x;
        var top = origin.y + statusBarHeight;

        var widthSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
        var heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, utils.layout.EXACTLY);

        //trace.write("| >>> Will measure and layout with {{" + left + ", " + top + "}{" + width + ", " + height + "}}", "LayoutRootView.iOS");
        //trace.write("--------------------------------------------", "LayoutRootView.iOS");

        rootView.measure(widthSpec, heightSpec);
        rootView.layout(left, top, width, height);
    }
}