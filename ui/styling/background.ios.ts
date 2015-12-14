import viewModule = require("ui/core/view");
import style = require("./style");
import styling = require("ui/styling");
import common = require("./background-common");

global.moduleMerge(common, exports);

var onePixelImage = { repeatX: false, repeatY: false, posX: 0, posY: 0, sizeX: 1, sizeY: 1 };

export module ios {
    export function createBackgroundUIImage(viewStyle: styling.Style, width: number, height: number): any {
        var background = <common.Background> viewStyle._getValue(style.backgroundInternalProperty);
        
        var boundsWidth = width;
        var boundsHeight = height;

        if (!boundsWidth || !boundsHeight) {
            return undefined;
        }
        
        var img: UIImage;
        if (background && background.image) {
            img = background.image.ios;
        }
        
        var params = background.getDrawParams(boundsWidth, boundsHeight) || onePixelImage;

        if (params.sizeX > 0 && params.sizeY > 0) {
            var resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
            UIGraphicsBeginImageContext(resizeRect.size);
            if (img) {
                img.drawInRect(resizeRect);
            }
            img = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
        }

        UIGraphicsBeginImageContextWithOptions({ width: width, height: height }, false, 0.0);
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
        
        return bkgImage
    }
    
    export function createBackgroundUIColor(view: viewModule.View, flip?: boolean): UIColor {
        if(!view._nativeView){
            return undefined;
        }
        
        var background = <common.Background> view.style._getValue(style.backgroundInternalProperty);

        if (!background || background.isEmpty()) {
            return undefined;
        }

        if (!background.image) {
            return background.color.ios;
        }

        // We have an image for a background
        var size = view._nativeView.frame.size;
        var bkgImage = createBackgroundUIImage(view.style, size.width, size.height);
        if (!bkgImage) {
            return undefined;
        }

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
