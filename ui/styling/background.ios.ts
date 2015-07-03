import viewModule = require("ui/core/view");
import style = require("ui/styling/style");
import common = require("ui/styling/background-common");

declare var exports;
require("utils/module-merge").merge(common, exports);

export module ios {
    export function createBackgroundUIColor(view: viewModule.View): UIColor {
        var background = <common.Background> view.style._getValue(style.backgroundInternalProperty);
        var frame = (<UIView>view._nativeView).frame;
        var result: UIColor;

        if (background && !background.isEmpty() && frame.size.width > 0 && frame.size.height) {
            if (!background.image) {
                result = background.color.ios;
            }
            else {
                var img = <UIImage>background.image.ios;
                var params = background.getDrawParams(frame.size.width, frame.size.height);

                if (params.sizeX > 0 && params.sizeY > 0) {
                    var resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
                    UIGraphicsBeginImageContext(resizeRect.size);
                    img.drawInRect(resizeRect);
                    img = UIGraphicsGetImageFromCurrentImageContext();
                    UIGraphicsEndImageContext();
                }

                UIGraphicsBeginImageContextWithOptions(frame.size, false, 1.0);
                var context = UIGraphicsGetCurrentContext();

                if (background.color && background.color.ios) {
                    CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
                    CGContextFillRect(context, frame);
                }

                if (!params.repeatX && !params.repeatY) {
                    img.drawAtPoint(CGPointMake(params.posX, params.posY));
                }
                else {
                    var w = params.repeatX ? frame.size.width : img.size.width;
                    var h = params.repeatY ? frame.size.height : img.size.height;

                    CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));

                    params.posX = params.repeatX ? 0 : params.posX;
                    params.posY = params.repeatY ? 0 : params.posY;

                    var patternRect = CGRectMake(params.posX, params.posY, w, h);

                    img.drawAsPatternInRect(patternRect);
                }
                var bkgImage = UIGraphicsGetImageFromCurrentImageContext();
                UIGraphicsEndImageContext();
                result = UIColor.alloc().initWithPatternImage(bkgImage);
            }
            return result;
        }
    }
}
