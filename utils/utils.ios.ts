import common = require("utils/utils-common");
import colorModule = require("color");

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

    export function isLandscape(): boolean {
        var device = UIDevice.currentDevice();
        var statusBarOrientation = UIApplication.sharedApplication().statusBarOrientation;
        var isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);
        return isOrientationLandscape(device.orientation) || isStatusBarOrientationLandscape;
    }

    export var MajorVersion = NSString.stringWithString(UIDevice.currentDevice().systemVersion).intValue;
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