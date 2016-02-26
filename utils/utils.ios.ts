import dts = require("utils/utils");
import types = require("utils/types");
import common = require("./utils-common");
import {Color} from "color";
import enums = require("ui/enums");
import * as fsModule from "file-system";
import * as traceModule from "trace";

global.moduleMerge(common, exports);

var trace: typeof traceModule;
function ensureTrace() {
    if (!trace) {
        trace = require("trace");
    }
}

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

    export function toDevicePixels(value: number): number {
        return value * getDisplayDensity();
    }

    export function toDeviceIndependentPixels(value: number): number {
        return value / getDisplayDensity();
    }
}

export module ios {

    export function setTextAlignment(view: dts.ios.TextUIView, value: string) {
        switch (value) {
            case enums.TextAlignment.left:
                view.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
                break;
            case enums.TextAlignment.center:
                view.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
                break;
            case enums.TextAlignment.right:
                view.textAlignment = NSTextAlignment.NSTextAlignmentRight;
                break;
            default:
                break;
        }
    }

    export function setTextDecorationAndTransform(v: any, decoration: string, transform: string, letterSpacing: number) {
        let hasLetterSpacing = types.isNumber(letterSpacing) && !isNaN(letterSpacing);

        if (v.formattedText) {
            if (v.style.textDecoration.indexOf(enums.TextDecoration.none) === -1) {

                if (v.style.textDecoration.indexOf(enums.TextDecoration.underline) !== -1) {
                    (<any>v).formattedText.underline = NSUnderlineStyle.NSUnderlineStyleSingle;
                }

                if (v.style.textDecoration.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    (<any>v).formattedText.strikethrough = NSUnderlineStyle.NSUnderlineStyleSingle;
                }

            } else {
                (<any>v).formattedText.underline = NSUnderlineStyle.NSUnderlineStyleNone;
            }

            for (let i = 0; i < v.formattedText.spans.length; i++) {
                let span = v.formattedText.spans.getItem(i);
                span.text = getTransformedText(v, span.text, transform);
            }
            
            if (hasLetterSpacing) {
                let attrText; 
                if(v._nativeView instanceof UIButton){
                    attrText = (<UIButton>v._nativeView).attributedTitleForState(UIControlState.UIControlStateNormal);
                } else {
                    attrText = v._nativeView.attributedText;
                }
                
                attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing, { location: 0, length: v._nativeView.attributedText.length });
                
                if(v._nativeView instanceof UIButton){
                    (<UIButton>v._nativeView).setAttributedTitleForState(attrText, UIControlState.UIControlStateNormal);
                } 
            }

        } else {
            let source = v.text;
            let attributes = new Array();
            let range = { location: 0, length: source.length };

            var decorationValues = (decoration + "").split(" ");

            if (decorationValues.indexOf(enums.TextDecoration.none) === -1 || hasLetterSpacing) {
                let dict = new Map<string, number>();

                if (decorationValues.indexOf(enums.TextDecoration.underline) !== -1) {
                    dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (decorationValues.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (hasLetterSpacing) {
                    dict.set(NSKernAttributeName, letterSpacing);
                }

                attributes.push({ attrs: dict, range: NSValue.valueWithRange(range) });
            }

            let view: dts.ios.TextUIView | UIButton = v._nativeView;

            source = getTransformedText(v, source, transform);

            if (attributes.length > 0) {
                let result = NSMutableAttributedString.alloc().initWithString(<string>source);
                for (let i = 0; i < attributes.length; i++) {
                    result.setAttributesRange(attributes[i]["attrs"], attributes[i]["range"].rangeValue);
                }

                if (view instanceof UIButton) {
                    (<UIButton>view).setAttributedTitleForState(result, UIControlState.UIControlStateNormal);
                }
                else {
                    (<dts.ios.TextUIView>view).attributedText = result;
                }
            } else {
                if (view instanceof UIButton) {
                    (<UIButton>view).setAttributedTitleForState(NSMutableAttributedString.alloc().initWithString(source), UIControlState.UIControlStateNormal);
                    (<UIButton>view).setTitleForState(<string>source, UIControlState.UIControlStateNormal);
                }
                else {
                    (<dts.ios.TextUIView>view).text = <string>source;
                }
            }
        }
    }

    function getTransformedText(view, source: string, transform: string): string {
        let result = source;

        switch (transform) {
            case enums.TextTransform.none:
            default:
                result = view.text;
                break;
            case enums.TextTransform.uppercase:
                result = NSStringFromNSAttributedString(source).uppercaseString;
                break;
            case enums.TextTransform.lowercase:
                result = NSStringFromNSAttributedString(source).lowercaseString;
                break;
            case enums.TextTransform.capitalize:
                result = NSStringFromNSAttributedString(source).capitalizedString;
                break;
        }

        return result;
    }

    function NSStringFromNSAttributedString(source: NSAttributedString | string): NSString {
        return NSString.stringWithString(source instanceof NSAttributedString && source.string || <string>source);
    }

    export function setWhiteSpace(view: dts.ios.TextUIView, value: string, parentView?: UIView) {
        if (value === enums.WhiteSpace.normal) {
            view.lineBreakMode = NSLineBreakMode.NSLineBreakByWordWrapping;
            view.numberOfLines = 0;
        }
        else {
            if (parentView) {
                view.lineBreakMode = NSLineBreakMode.NSLineBreakByTruncatingMiddle;
            } else {
                view.lineBreakMode = NSLineBreakMode.NSLineBreakByTruncatingTail;
            }
            view.numberOfLines = 1;
        }
    }

    export module collections {
        export function jsArrayToNSArray(str: string[]): NSArray {
            return NSArray.arrayWithArray(<any>str);
        }

        export function nsArrayToJSArray(a: NSArray): Array<Object> {
            var arr = [];
            if ("undefined" !== typeof a) {
                let count = a.count;
                for (let i = 0; i < count; i++) {
                    arr.push(a.objectAtIndex(i));
                }
            }

            return arr;
        }
    }

    export function getColor(uiColor: UIColor): Color {
        var redRef = new interop.Reference<number>();
        var greenRef = new interop.Reference<number>();
        var blueRef = new interop.Reference<number>();
        var alphaRef = new interop.Reference<number>();

        uiColor.getRedGreenBlueAlpha(redRef, greenRef, blueRef, alphaRef);
        var red = redRef.value * 255;
        var green = greenRef.value * 255;
        var blue = blueRef.value * 255;
        var alpha = alphaRef.value * 255;

        return new Color(alpha, red, green, blue);
    }

    export function isLandscape(): boolean {
        var device = UIDevice.currentDevice();
        var statusBarOrientation = UIApplication.sharedApplication().statusBarOrientation;
        var isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);
        return isOrientationLandscape(device.orientation) || isStatusBarOrientationLandscape;
    }

    export var MajorVersion = NSString.stringWithString(UIDevice.currentDevice().systemVersion).intValue;

    export function openFile(filePath: string): boolean {
        try {
            var fs: typeof fsModule = require("file-system");
            var path = filePath.replace("~", fs.knownFolders.currentApp().path)

            var controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
            controller.delegate = new UIDocumentInteractionControllerDelegateImpl();
            return controller.presentPreviewAnimated(true);
        }
        catch (e) {
            ensureTrace();
            trace.write("Error in openFile", trace.categories.Error, trace.messageType.error);
        }
        return false;
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
        ensureTrace();
        // We Don't do anything with an error.  We just output it
        trace.write("Error in OpenURL", trace.categories.Error, trace.messageType.error);
    }
    return false;
}

class UIDocumentInteractionControllerDelegateImpl extends NSObject implements UIDocumentInteractionControllerDelegate {
    public static ObjCProtocols = [UIDocumentInteractionControllerDelegate];

    public getViewController(): UIViewController {
        var frame = require("ui/frame");
        return frame.topmost().currentPage.ios;
    }

    public documentInteractionControllerViewControllerForPreview(controller: UIDocumentInteractionController) {
        return this.getViewController();
    }

    public documentInteractionControllerViewForPreview(controller: UIDocumentInteractionController) {
        return this.getViewController().view;
    }

    public documentInteractionControllerRectForPreview(controller: UIDocumentInteractionController): CGRect {
        return this.getViewController().view.frame;
    }
}
