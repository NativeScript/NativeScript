import common = require("utils/utils-common");
import colorModule = require("color");
import view = require("ui/core/view");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

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
                for (var i = 0; i < a.count(); i++) {
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

    export function _layoutRootView(rootView: view.View) {
        if (!rootView) {
            return;
        }

        var statusFrame = UIApplication.sharedApplication().statusBarFrame;
        var statusBarHeight = 0;

        try {
            statusBarHeight = Math.min(statusFrame.size.width, statusFrame.size.height);
        } catch (ex) {
            console.log("exception: " + ex);
        }

        var landscape = isLandscape();

        var iOSMajorVersion = MajorVersion;
        // in iOS 8 when in landscape statusbar is hidden.
        if (landscape && iOSMajorVersion > 7) {
            statusBarHeight = 0;
        }

        var deviceFrame = UIScreen.mainScreen().bounds;
        var size = deviceFrame.size;
        var width = size.width;
        var height = size.height;

        // in iOS 7 when in landscape we switch width with height because on device they don't change even when rotated.
        if (iOSMajorVersion < 8 && landscape) {
            width = size.height;
            height = size.width;
        }

        var origin = deviceFrame.origin;
        var left = origin.x;
        var top = origin.y + statusBarHeight;

        var widthSpec = layout.makeMeasureSpec(width, common.layout.EXACTLY);
        var heightSpec = layout.makeMeasureSpec(height - statusBarHeight, common.layout.EXACTLY);

        rootView.measure(widthSpec, heightSpec);
        rootView.layout(left, top, width, height);
    }
} 

export function GC() {
    __collect();
}