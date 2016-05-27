import viewModule = require("ui/core/view");
import common = require("./background-common");
import * as styleModule from "./style";

global.moduleMerge(common, exports);

var style: typeof styleModule;
function ensureStyle() {
    if (!style) {
        style = require("./style");
    }
}

export module ios {
    export function createBackgroundUIColor(view: viewModule.View, flip?: boolean): UIColor {
        if (!view._nativeView) {
            return undefined;
        }
        ensureStyle();

        if (view.style.clipPath) {
            drawClipPath(view);
        }

        var background = <common.Background>view.style._getValue(style.backgroundInternalProperty);

        if (!background || background.isEmpty()) {
            return undefined;
        }

        if (!background.image) {
            return background.color.ios;
        }

        // We have an image for a background
        var frame = (<UIView>view._nativeView).frame;
        var boundsWidth = frame.size.width;
        var boundsHeight = frame.size.height;

        if (!boundsWidth || !boundsHeight) {
            return undefined;
        }

        var img = <UIImage>background.image.ios;
        var params = background.getDrawParams(boundsWidth, boundsHeight);

        if (params.sizeX > 0 && params.sizeY > 0) {
            var resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
            UIGraphicsBeginImageContext(resizeRect.size);
            img.drawInRect(resizeRect);
            img = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
        }

        UIGraphicsBeginImageContextWithOptions(frame.size, false, 0.0);
        var context = UIGraphicsGetCurrentContext();

        if (background.color && background.color.ios) {
            CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
            CGContextFillRect(context, CGRectMake(0, 0, boundsWidth, boundsHeight));
        }

        if (!params.repeatX && !params.repeatY) {
            img.drawAtPoint(CGPointMake(params.posX, params.posY));
        }
        else {
            var w = params.repeatX ? boundsWidth : img.size.width;
            var h = params.repeatY ? boundsHeight : img.size.height;

            CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));

            params.posX = params.repeatX ? 0 : params.posX;
            params.posY = params.repeatY ? 0 : params.posY;

            var patternRect = CGRectMake(params.posX, params.posY, w, h);

            img.drawAsPatternInRect(patternRect);
        }

        var bkgImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        if (flip) {
            var flippedImage = _flipImage(bkgImage);
            return UIColor.alloc().initWithPatternImage(flippedImage);
        }

        return UIColor.alloc().initWithPatternImage(bkgImage);
    }

    // Flipping the default coordinate system
    // https://developer.apple.com/library/ios/documentation/2DDrawing/Conceptual/DrawingPrintingiOS/GraphicsDrawingOverview/GraphicsDrawingOverview.html
    function _flipImage(originalImage: UIImage): UIImage {
        UIGraphicsBeginImageContextWithOptions(originalImage.size, false, 0.0);
        var context = UIGraphicsGetCurrentContext();
        CGContextSaveGState(context);
        CGContextTranslateCTM(context, 0.0, originalImage.size.width);
        CGContextScaleCTM(context, 1.0, -1.0);
        originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height))
        CGContextRestoreGState(context);
        var flippedImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        return flippedImage;
    }
}

function drawClipPath(view: viewModule.View) {
    var path: any;

    var nativeView = <UIView>view._nativeView;
    var bounds = {
        left: nativeView.bounds.origin.x,
        top: nativeView.bounds.origin.y,
        bottom: nativeView.bounds.size.height,
        right: nativeView.bounds.size.width
    };

    if (bounds.right === 0 || bounds.bottom === 0) {
        return;
    }

    var clipPath = view.style.clipPath;

    var functionName = clipPath.substring(0, clipPath.indexOf("("));
    var value = clipPath.replace(`${functionName}(`, "").replace(")", "");

    if (functionName === "rect") {
        var arr = value.split(/[\s]+/);

        var top = common.cssValueToDevicePixels(arr[0], bounds.top);
        var left = common.cssValueToDevicePixels(arr[1], bounds.left);
        var bottom = common.cssValueToDevicePixels(arr[2], bounds.bottom);
        var right = common.cssValueToDevicePixels(arr[3], bounds.right);

        path = UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right, bottom)).CGPath;

    } else if (functionName === "circle") {
        var arr = value.split(/[\s]+/);

        var radius = common.cssValueToDevicePixels(arr[0], (bounds.right > bounds.bottom ? bounds.bottom : bounds.right) / 2);
        var y = common.cssValueToDevicePixels(arr[2], bounds.bottom);
        var x = common.cssValueToDevicePixels(arr[3], bounds.right);

        path = UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;

    } else if (functionName === "ellipse") {
        var arr = value.split(/[\s]+/);

        var rX = common.cssValueToDevicePixels(arr[0], bounds.right);
        var rY = common.cssValueToDevicePixels(arr[1], bounds.bottom);
        var cX = common.cssValueToDevicePixels(arr[3], bounds.right);
        var cY = common.cssValueToDevicePixels(arr[4], bounds.bottom);
        
        var left = cX - rX;
        var top = cY - rY;
        var width = rX * 2;
        var height = rY * 2;

        path = UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;

    } else if (functionName === "polygon") {

        path = CGPathCreateMutable()

        var firstPoint: viewModule.Point;
        var arr = value.split(/[,]+/);
        for (let i = 0; i < arr.length; i++) {
            let xy = arr[i].trim().split(/[\s]+/);
            let point: viewModule.Point = {
                x: common.cssValueToDevicePixels(xy[0], bounds.right),
                y: common.cssValueToDevicePixels(xy[1], bounds.bottom)
            };

            if (!firstPoint) {
                firstPoint = point;
                CGPathMoveToPoint(path, null, point.x, point.y)
            }

            CGPathAddLineToPoint(path, null, point.x, point.y)
        }

        CGPathAddLineToPoint(path, null, firstPoint.x, firstPoint.y)
    }

    if (path) {
        var shape = CAShapeLayer.layer();
        shape.path = path;
        nativeView.layer.mask = shape;
        nativeView.clipsToBounds = true;

        if (view.borderWidth > 0 && view.borderColor) {
            var borderLayer = CAShapeLayer.layer();
            borderLayer.path = path;
            borderLayer.lineWidth = view.borderWidth * 2;
            borderLayer.strokeColor = view.borderColor.ios.CGColor;
            borderLayer.fillColor = UIColor.clearColor().CGColor;

            borderLayer.frame = nativeView.bounds;

            nativeView.layer.borderColor = undefined;
            nativeView.layer.borderWidth = 0;
            nativeView.layer.addSublayer(borderLayer);
        }
    }
}