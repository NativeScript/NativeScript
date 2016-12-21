import { Background, View, Point, layout, Color } from "./background-common";
import { ios as utilsIos } from "utils/utils";

export * from "./background-common";

export module ios {
    export function createBackgroundUIColor(view: View, flip?: boolean): UIColor {
        let background = <Background>view.style.backgroundInternal;
        if (background.isEmpty()) {
            return undefined;
        }

        let nativeView = view.nativeView;
        // Clip-path
        if (background.clipPath) {
            drawClipPath(nativeView, background);
        }

        // Borders

        // Clear all borders
        nativeView.layer.borderColor = undefined; 
        nativeView.layer.borderWidth = 0;
        nativeView.layer.cornerRadius = 0;
        nativeView.clipsToBounds = true;

        if (nativeView["topBorderLayer"]){
            (<CAShapeLayer>nativeView["topBorderLayer"]).removeFromSuperlayer();
        }
        
        if (nativeView["rightBorderLayer"]){
            (<CAShapeLayer>nativeView["rightBorderLayer"]).removeFromSuperlayer();
        }
        
        if (nativeView["bottomBorderLayer"]){
            (<CAShapeLayer>nativeView["bottomBorderLayer"]).removeFromSuperlayer();
        }
        
        if (nativeView["leftBorderLayer"]){
            (<CAShapeLayer>nativeView["leftBorderLayer"]).removeFromSuperlayer();
        }

        // Clip-path
        if (background.clipPath) {
            drawClipPath(nativeView, background);
        }
        
        if (background.hasUniformBorder()){
            let borderColor = background.getUniformBorderColor();
            if (borderColor && borderColor.ios){
                nativeView.layer.borderColor = borderColor.ios.CGColor; 
            }
            else {
                nativeView.layer.borderColor = undefined; 
            }
            nativeView.layer.borderWidth = background.getUniformBorderWidth();
            nativeView.layer.cornerRadius = background.getUniformBorderRadius();
        }
        else { // Draw non-uniform borders
            let nativeViewLayerBounds = {
                left: nativeView.layer.bounds.origin.x,
                top: nativeView.layer.bounds.origin.y,
                bottom: nativeView.layer.bounds.size.height,
                right: nativeView.layer.bounds.size.width
            };

            let top = background.borderTopWidth;
            let right = background.borderRightWidth;
            let bottom = background.borderBottomWidth;
            let left = background.borderLeftWidth;
            
            let lto: Point = {x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.top};// left-top-outside
            let lti: Point = {x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.top + top}; // left-top-inside

            let rto: Point = {x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.top}; // right-top-outside
            let rti: Point = {x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.top + top}; // right-top-inside
            
            let rbo: Point = {x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.bottom}; // right-bottom-outside
            let rbi: Point = {x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.bottom - bottom}; // right-bottom-inside

            let lbo: Point = {x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.bottom}; // left-bottom-outside
            let lbi: Point = {x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.bottom - bottom}; // left-bottom-inside
            
            if (top > 0 && background.borderTopColor && background.borderTopColor.ios){
                let topBorderPath = CGPathCreateMutable();
                CGPathMoveToPoint(topBorderPath, null, lto.x, lto.y);
                CGPathAddLineToPoint(topBorderPath, null, rto.x, rto.y);
                CGPathAddLineToPoint(topBorderPath, null, rti.x, rti.y); 
                CGPathAddLineToPoint(topBorderPath, null, lti.x, lti.y); 
                CGPathAddLineToPoint(topBorderPath, null, lto.x, lto.y);
                
                let topBorderLayer = CAShapeLayer.layer();
                topBorderLayer.fillColor = background.borderTopColor.ios.CGColor; 
                topBorderLayer.path = topBorderPath;

                nativeView.layer.addSublayer(topBorderLayer);
                nativeView["topBorderLayer"] = topBorderLayer;
            }
            
            if (right > 0 && background.borderRightColor && background.borderRightColor.ios){
                let rightBorderPath = CGPathCreateMutable();
                CGPathMoveToPoint(rightBorderPath, null, rto.x, rto.y);
                CGPathAddLineToPoint(rightBorderPath, null, rbo.x, rbo.y);
                CGPathAddLineToPoint(rightBorderPath, null, rbi.x, rbi.y); 
                CGPathAddLineToPoint(rightBorderPath, null, rti.x, rti.y); 
                CGPathAddLineToPoint(rightBorderPath, null, rto.x, rto.y);
                
                let rightBorderLayer = CAShapeLayer.layer();
                rightBorderLayer.fillColor = background.borderRightColor.ios.CGColor; 
                rightBorderLayer.path = rightBorderPath;

                nativeView.layer.addSublayer(rightBorderLayer);
                nativeView["rightBorderLayer"] = rightBorderLayer;
            }
            
            if (bottom > 0 && background.borderBottomColor && background.borderBottomColor.ios){
                let bottomBorderPath = CGPathCreateMutable();
                CGPathMoveToPoint(bottomBorderPath, null, rbo.x, rbo.y);
                CGPathAddLineToPoint(bottomBorderPath, null, lbo.x, lbo.y);
                CGPathAddLineToPoint(bottomBorderPath, null, lbi.x, lbi.y); 
                CGPathAddLineToPoint(bottomBorderPath, null, rbi.x, rbi.y); 
                CGPathAddLineToPoint(bottomBorderPath, null, rbo.x, rbo.y);
                
                let bottomBorderLayer = CAShapeLayer.layer();
                bottomBorderLayer.fillColor = background.borderBottomColor.ios.CGColor; 
                bottomBorderLayer.path = bottomBorderPath;

                nativeView.layer.addSublayer(bottomBorderLayer);
                nativeView["bottomBorderLayer"] = bottomBorderLayer;
            }
            
            if (left > 0 && background.borderLeftColor && background.borderLeftColor.ios){
                let leftBorderPath = CGPathCreateMutable();
                CGPathMoveToPoint(leftBorderPath, null, lbo.x, lbo.y);
                CGPathAddLineToPoint(leftBorderPath, null, lto.x, lto.y);
                CGPathAddLineToPoint(leftBorderPath, null, lti.x, lti.y); 
                CGPathAddLineToPoint(leftBorderPath, null, lbi.x, lbi.y); 
                CGPathAddLineToPoint(leftBorderPath, null, lbo.x, lbo.y);
                
                let leftBorderLayer = CAShapeLayer.layer();
                leftBorderLayer.fillColor = background.borderLeftColor.ios.CGColor; 
                leftBorderLayer.path = leftBorderPath;

                nativeView.layer.addSublayer(leftBorderLayer);
                nativeView["leftBorderLayer"] = leftBorderLayer;
            }
        }

        if (!background.image) {
            return background.color ? background.color.ios : undefined;
        }

        let frame = nativeView.frame;
        let boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
        let boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
        if (!boundsWidth || !boundsHeight) {
            return undefined;
        }

        // We have an image for a background
        let img = <UIImage>background.image.ios;
        let params = background.getDrawParams(boundsWidth, boundsHeight);

        if (params.sizeX > 0 && params.sizeY > 0) {
            let resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
            UIGraphicsBeginImageContext(resizeRect.size);
            img.drawInRect(resizeRect);
            img = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
        }

        UIGraphicsBeginImageContextWithOptions(CGSizeFromString(`{${boundsWidth},${boundsHeight}}`), false, 0.0);
        let context = UIGraphicsGetCurrentContext();

        if (background.color && background.color.ios) {
            CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
            CGContextFillRect(context, CGRectMake(0, 0, boundsWidth, boundsHeight));
        }

        if (!params.repeatX && !params.repeatY) {
            img.drawAtPoint(CGPointMake(params.posX, params.posY));
        }
        else {
            let w = params.repeatX ? boundsWidth : img.size.width;
            let h = params.repeatY ? boundsHeight : img.size.height;

            CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));

            params.posX = params.repeatX ? 0 : params.posX;
            params.posY = params.repeatY ? 0 : params.posY;

            let patternRect = CGRectMake(params.posX, params.posY, w, h);

            img.drawAsPatternInRect(patternRect);
        }

        let bkgImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        if (flip) {
            let flippedImage = _flipImage(bkgImage);
            return UIColor.alloc().initWithPatternImage(flippedImage);
        }

        return UIColor.alloc().initWithPatternImage(bkgImage);
    }

    // Flipping the default coordinate system
    // https://developer.apple.com/library/ios/documentation/2DDrawing/Conceptual/DrawingPrintingiOS/GraphicsDrawingOverview/GraphicsDrawingOverview.html
    function _flipImage(originalImage: UIImage): UIImage {
        UIGraphicsBeginImageContextWithOptions(originalImage.size, false, 0.0);
        let context = UIGraphicsGetCurrentContext();
        CGContextSaveGState(context);
        CGContextTranslateCTM(context, 0.0, originalImage.size.height);
        CGContextScaleCTM(context, 1.0, -1.0);
        originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height))
        CGContextRestoreGState(context);
        let flippedImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        return flippedImage;
    }
}

function cssValueToDevicePixels(source: string, total: number): number {
    let result;
    source = source.trim();

    if (source.indexOf("px") !== -1) {
        result = parseFloat(source.replace("px", ""));
    }
    else if (source.indexOf("%") !== -1 && total > 0) {
        result = (parseFloat(source.replace("%", "")) / 100) * layout.toDeviceIndependentPixels(total);
    } else {
        result = parseFloat(source);
    }
    return layout.toDevicePixels(result);
}

function drawClipPath(nativeView: UIView, background: Background) {
    let path: any;

    let bounds = {
        left: nativeView.bounds.origin.x,
        top: nativeView.bounds.origin.y,
        bottom: nativeView.bounds.size.height,
        right: nativeView.bounds.size.width
    };

    if (bounds.right === 0 || bounds.bottom === 0) {
        return;
    }

    let clipPath = background.clipPath;

    let functionName = clipPath.substring(0, clipPath.indexOf("("));
    let value = clipPath.replace(`${functionName}(`, "").replace(")", "");

    if (functionName === "rect") {
        let arr = value.split(/[\s]+/);

        let top = cssValueToDevicePixels(arr[0], bounds.top);
        let left = cssValueToDevicePixels(arr[1], bounds.left);
        let bottom = cssValueToDevicePixels(arr[2], bounds.bottom);
        let right = cssValueToDevicePixels(arr[3], bounds.right);

        path = UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
    } 
    else if (functionName === "inset") {
        let arr = value.split(/[\s]+/);
        
        let topString: string;
        let rightString: string;
        let bottomString: string;
        let leftString: string;
        if (arr.length === 1) {
            topString = rightString = bottomString = leftString = arr[0];
        }
        else if (arr.length === 2) {
            topString = bottomString = arr[0];
            rightString = leftString = arr[1];
        }
        else if (arr.length === 3) {
            topString = arr[0];
            rightString = leftString = arr[1];
            bottomString = arr[2];
        }
        else if (arr.length === 4) {
            topString = arr[0];
            rightString = arr[1];
            bottomString = arr[2];
            leftString = arr[3];
        }

        let top = cssValueToDevicePixels(topString, bounds.bottom);
        let right = cssValueToDevicePixels("100%", bounds.right) - cssValueToDevicePixels(rightString, bounds.right);
        let bottom = cssValueToDevicePixels("100%", bounds.bottom) - cssValueToDevicePixels(bottomString, bounds.bottom);
        let left = cssValueToDevicePixels(leftString, bounds.right);

        path = UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
    } 
    else if (functionName === "circle") {
        let arr = value.split(/[\s]+/);

        let radius = cssValueToDevicePixels(arr[0], (bounds.right > bounds.bottom ? bounds.bottom : bounds.right) / 2);
        let y = cssValueToDevicePixels(arr[2], bounds.bottom);
        let x = cssValueToDevicePixels(arr[3], bounds.right);

        path = UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;

    } else if (functionName === "ellipse") {
        let arr = value.split(/[\s]+/);

        let rX = cssValueToDevicePixels(arr[0], bounds.right);
        let rY = cssValueToDevicePixels(arr[1], bounds.bottom);
        let cX = cssValueToDevicePixels(arr[3], bounds.right);
        let cY = cssValueToDevicePixels(arr[4], bounds.bottom);
        
        let left = cX - rX;
        let top = cY - rY;
        let width = rX * 2;
        let height = rY * 2;

        path = UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;

    } 
    else if (functionName === "polygon") {

        path = CGPathCreateMutable()

        let firstPoint: Point;
        let arr = value.split(/[,]+/);
        for (let i = 0; i < arr.length; i++) {
            let xy = arr[i].trim().split(/[\s]+/);
            let point: Point = {
                x: cssValueToDevicePixels(xy[0], bounds.right),
                y: cssValueToDevicePixels(xy[1], bounds.bottom)
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
        let shape = CAShapeLayer.layer();
        shape.path = path;
        nativeView.layer.mask = shape;
        nativeView.clipsToBounds = true;

        let borderWidth = background.getUniformBorderWidth();
        let borderColor = background.getUniformBorderColor();

        if (borderWidth > 0 && borderColor instanceof Color){
            let borderLayer = CAShapeLayer.layer();
            borderLayer.path = path;
            borderLayer.lineWidth = borderWidth * 2;
            borderLayer.strokeColor = borderColor.ios.CGColor;
            borderLayer.fillColor = utilsIos.getter(UIColor, UIColor.clearColor).CGColor;
            borderLayer.frame = nativeView.bounds;

            nativeView.layer.borderColor = undefined;
            nativeView.layer.borderWidth = 0;
            nativeView.layer.addSublayer(borderLayer);
        }
    }
}
