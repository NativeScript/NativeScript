import common = require("utils/utils-common");
import colorModule = require("color");
import view = require("ui/core/view");

global.moduleMerge(common, exports);

function isOrientationLandscape(orientation: number) {
    return orientation === UIDeviceOrientation.UIDeviceOrientationLandscapeLeft || orientation === UIDeviceOrientation.UIDeviceOrientationLandscapeRight;
}

export module layout {
    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;

    export function makeMeasureSpec(size: number, mode: number): number {
        return (Math.round(size) & ~MODE_MASK) | (mode & MODE_MASK);
    }

    export function getDisplayDensity(): number {
        return 1;
    }
}

export module ios {
    export module collections {
        export function jsArrayToNSArray(str: string[]): any {
            var arr = new NSMutableArray();
            if ("undefined" !== typeof str) {
                for (var element in str) {
                    arr.addObject(str[element]);
                }
            }
            return arr;
        }

        export function nsArrayToJSArray(a: any): string[] {
            var arr = [];
            if ("undefined" !== typeof a) {
                for (var i = 0; i < a.count; i++) {
                    arr.push(a.objectAtIndex(i));
                }
            }

            return arr;
        }
    }

    export function getColor(uiColor: UIColor): colorModule.Color {
        var redRef = new interop.Reference<number>();
        var greenRef = new interop.Reference<number>();
        var blueRef = new interop.Reference<number>();
        var alphaRef = new interop.Reference<number>();

        uiColor.getRedGreenBlueAlpha(redRef, greenRef, blueRef, alphaRef);
        var red = redRef.value * 255;
        var green = greenRef.value * 255;
        var blue = blueRef.value * 255;
        var alpha = alphaRef.value * 255;

        return new colorModule.Color(alpha, red, green, blue);
    }

    export function getActualHeight(uiView: UIView): number {
        if (uiView.window && !uiView.hidden) {
            return uiView.frame.size.height;
        }

        return 0;
    }

    export function isLandscape(): boolean {
        var device = UIDevice.currentDevice();
        var statusBarOrientation = UIApplication.sharedApplication().statusBarOrientation;
        var isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);
        return isOrientationLandscape(device.orientation) || isStatusBarOrientationLandscape;
    }

    export var MajorVersion = NSString.stringWithString(UIDevice.currentDevice().systemVersion).intValue;

    export function _layoutRootView(rootView: view.View, parentBounds: CGRect) {
        if (!rootView || !parentBounds) {
            return;
        }

        var landscape = isLandscape();
        var iOSMajorVersion = MajorVersion;
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

        var widthSpec = layout.makeMeasureSpec(width, common.layout.EXACTLY);
        var heightSpec = layout.makeMeasureSpec(height - statusBarHeight, common.layout.EXACTLY);

        //trace.write("| >>> Will measure and layout with {{" + left + ", " + top + "}{" + width + ", " + height + "}}", "LayoutRootView.iOS");
        //trace.write("--------------------------------------------", "LayoutRootView.iOS");

        rootView.measure(widthSpec, heightSpec);
        rootView.layout(left, top, width, height);
    }
}

export function GC() {
    __collect();
}

export function openUrl(location: string): boolean {
    try {
        var url = NSURL.URLWithString(location.trim());
        if (UIApplication.sharedApplication().canOpenURL(url)) {
            return UIApplication.sharedApplication().openURL(url);
        }
    }
    catch (e) {
        // We Don't do anything with an error.  We just output it
        console.error("Error in OpenURL", e);
    }
    return false;
}