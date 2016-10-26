import viewModule = require("ui/core/view");
import common = require("./background-common");
import * as styleModule from "./style";
import { Color } from "color";

import * as utils from "utils/utils";

global.moduleMerge(common, exports);

var style: typeof styleModule;
function ensureStyle() {
    if (!style) {
        style = require("./style");
    }
}

export module ios {
    export function createBackgroundUIColor(view: viewModule.View, flip?: boolean): UIColor {
        let nativeView = <UIView>view._nativeView; 
        if (!nativeView) {
            return undefined;
        }
        ensureStyle();

        let background = <common.Background>view.style._getValue(style.backgroundInternalProperty);
        if (!background || background.isEmpty()) {
            return undefined;
        }

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
            
            let lto: viewModule.Point = {x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.top};// left-top-outside
            let lti: viewModule.Point = {x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.top + top}; // left-top-inside

            let rto: viewModule.Point = {x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.top}; // right-top-outside
            let rti: viewModule.Point = {x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.top + top}; // right-top-inside
            
            let rbo: viewModule.Point = {x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.bottom}; // right-bottom-outside
            let rbi: viewModule.Point = {x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.bottom - bottom}; // right-bottom-inside

            let lbo: viewModule.Point = {x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.bottom}; // left-bottom-outside
            let lbi: viewModule.Point = {x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.bottom - bottom}; // left-bottom-inside
            
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
        var img = <UIImage>background.image.ios;
        var params = background.getDrawParams(boundsWidth, boundsHeight);

        if (params.sizeX > 0 && params.sizeY > 0) {
            var resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
            UIGraphicsBeginImageContext(resizeRect.size);
            img.drawInRect(resizeRect);
            img = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
        }

        UIGraphicsBeginImageContextWithOptions(CGSizeFromString(`{${boundsWidth},${boundsHeight}}`), false, 0.0);
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
        CGContextTranslateCTM(context, 0.0, originalImage.size.height);
        CGContextScaleCTM(context, 1.0, -1.0);
        originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height))
        CGContextRestoreGState(context);
        var flippedImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        return flippedImage;
    }
}

function drawClipPath(nativeView: UIView, background: common.Background) {
    var path: any;

    var bounds = {
        left: nativeView.bounds.origin.x,
        top: nativeView.bounds.origin.y,
        bottom: nativeView.bounds.size.height,
        right: nativeView.bounds.size.width
    };

    if (bounds.right === 0 || bounds.bottom === 0) {
        return;
    }

    var clipPath = background.clipPath;

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

        let borderWidth = background.getUniformBorderWidth();
        let borderColor = background.getUniformBorderColor();

        if (borderWidth > 0 && borderColor instanceof Color){
            var borderLayer = CAShapeLayer.layer();
            borderLayer.path = path;
            borderLayer.lineWidth = borderWidth * 2;
            borderLayer.strokeColor = borderColor.ios.CGColor;
            borderLayer.fillColor = utils.ios.getter(UIColor, UIColor.clearColor).CGColor;
            borderLayer.frame = nativeView.bounds;

            nativeView.layer.borderColor = undefined;
            nativeView.layer.borderWidth = 0;
            nativeView.layer.addSublayer(borderLayer);
        }
    }
}