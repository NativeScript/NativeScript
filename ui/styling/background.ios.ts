import viewModule = require("ui/core/view");
import common = require("./background-common");
import * as styleModule from "./style";

global.moduleMerge(common, exports);

export module ios {
    export function createBackgroundUIColor(view: viewModule.View, flip?: boolean): UIColor {
        if(!view._nativeView){
            return undefined;
        }

        var style: typeof styleModule = require("./style");

        var background = <common.Background> view.style._getValue(style.backgroundInternalProperty);

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
