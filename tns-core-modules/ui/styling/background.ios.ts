import { Background as BackgroundDefinition } from "./background";
import { View, Point } from "../core/view";
import { Color } from "../../color";
import { ios as utilsIos, isDataURI, isFileOrResourcePath, layout } from "../../utils/utils";
import { fromFileOrResource, fromBase64, fromUrl } from "../../image-source";
import { CSSValue, parse as cssParse } from "../../css-value";

export * from "./background-common";

interface NativeView extends UIView {
    hasNonUniformBorder: boolean;
    topBorderLayer: CAShapeLayer;
    rightBorderLayer: CAShapeLayer;
    bottomBorderLayer: CAShapeLayer;
    leftBorderLayer: CAShapeLayer;
}

interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

const clearCGColor = utilsIos.getter(UIColor, UIColor.clearColor).CGColor;
const symbolUrl = Symbol("backgroundImageUrl");

export module ios {
    export function createBackgroundUIColor(view: View, callback: (uiColor: UIColor) => void, flip?: boolean): void {
        const background = view.style.backgroundInternal;
        const nativeView = <NativeView>view.nativeView;

        if (background.hasUniformBorder()) {
            if (nativeView.hasNonUniformBorder) {
                clearNonUniformBorders(nativeView);
            }

            const layer = nativeView.layer;
            const borderColor = background.getUniformBorderColor();
            layer.borderColor = !borderColor ? undefined : borderColor.ios.CGColor;
            layer.borderWidth = layout.toDeviceIndependentPixels(background.getUniformBorderWidth());
            const renderSize = view.getActualSize() || { width: 0, height: 0 };
            const cornerRadius = layout.toDeviceIndependentPixels(background.getUniformBorderRadius());
            layer.cornerRadius = Math.min(Math.min(renderSize.width / 2, renderSize.height / 2), cornerRadius);
        }
        else {
            drawNonUniformBorders(nativeView, background);
        }

        // Clip-path should be called after borders are applied.
        // It will eventually move them to different layer if uniform.
        if (background.clipPath) {
            drawClipPath(nativeView, background);
        }

        if (!background.image) {
            const uiColor = background.color ? background.color.ios : undefined;
            callback(uiColor);
        } else {
            setUIColorFromImage(view, nativeView, callback, flip);
        }
    }
}

function clearNonUniformBorders(nativeView: NativeView): void {
    if (nativeView.topBorderLayer) {
        nativeView.topBorderLayer.removeFromSuperlayer();
    }

    if (nativeView.rightBorderLayer) {
        nativeView.rightBorderLayer.removeFromSuperlayer();
    }

    if (nativeView.bottomBorderLayer) {
        nativeView.bottomBorderLayer.removeFromSuperlayer();
    }

    if (nativeView.leftBorderLayer) {
        nativeView.leftBorderLayer.removeFromSuperlayer();
    }
}

const pattern: RegExp = /url\(('|")(.*?)\1\)/;
function setUIColorFromImage(view: View, nativeView: UIView, callback: (uiColor: UIColor) => void, flip?: boolean): void {
    const frame = nativeView.frame;
    const boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
    const boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;
    if (!boundsWidth || !boundsHeight) {
        return undefined;
    }

    const style = view.style;
    const background = style.backgroundInternal;
    let imageUri = background.image;
    if (imageUri) {
        const match = imageUri.match(pattern);
        if (match && match[2]) {
            imageUri = match[2];
        }
    }

    let bitmap: UIImage;
    if (isDataURI(imageUri)) {
        const base64Data = imageUri.split(",")[1];
        if (base64Data !== undefined) {
            bitmap = fromBase64(base64Data).ios
        }
    } else if (isFileOrResourcePath(imageUri)) {
        bitmap = fromFileOrResource(imageUri).ios;
    } else if (imageUri.indexOf("http") !== -1) {
        style[symbolUrl] = imageUri;
        fromUrl(imageUri).then((r) => {
            if (style && style[symbolUrl] === imageUri) {
                uiColorFromImage(r.ios, view, callback, flip);
            }
        });
    }

    uiColorFromImage(bitmap, view, callback, flip);
}

interface BackgroundDrawParams {
    repeatX: boolean;
    repeatY: boolean;
    posX: number;
    posY: number;
    sizeX?: number;
    sizeY?: number;
}

function parsePosition(pos: string): { x: CSSValue, y: CSSValue } {
    const values = cssParse(pos);
    if (values.length === 2) {
        return { x: values[0], y: values[1] };
    }

    if (values.length === 1 && values[0].type === "ident") {
        const val = values[0].string.toLocaleLowerCase();
        const center = { type: "ident", string: "center" };

        // If you only one keyword is specified, the other value is "center"
        if (val === "left" || val === "right") {
            return { x: values[0], y: center };
        } else if (val === "top" || val === "bottom") {
            return { x: center, y: values[0] };
        } else if (val === "center") {
            return { x: center, y: center };
        }
    }

    return null;
};

function getDrawParams(this: void, image: UIImage, background: BackgroundDefinition, width: number, height: number): BackgroundDrawParams {
    if (!image) {
        return null;
    }

    const res: BackgroundDrawParams = {
        repeatX: true,
        repeatY: true,
        posX: 0,
        posY: 0,
    }

    // repeat
    if (background.repeat) {
        switch (background.repeat.toLowerCase()) {
            case "no-repeat":
                res.repeatX = false;
                res.repeatY = false;
                break;

            case "repeat-x":
                res.repeatY = false;
                break;

            case "repeat-y":
                res.repeatX = false;
                break;
        }
    }

    const imageSize = image.size;
    let imageWidth = imageSize.width;
    let imageHeight = imageSize.height;

    // size
    const size = background.size;
    if (size) {
        const values = cssParse(size);
        if (values.length === 2) {
            const vx = values[0];
            const vy = values[1];
            if (vx.unit === "%" && vy.unit === "%") {
                imageWidth = width * vx.value / 100;
                imageHeight = height * vy.value / 100;

                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            } else if (vx.type === "number" && vy.type === "number" &&
                ((vx.unit === "px" && vy.unit === "px") || (vx.unit === "" && vy.unit === ""))) {
                imageWidth = vx.value;
                imageHeight = vy.value;

                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            }
        }
        else if (values.length === 1 && values[0].type === "ident") {
            let scale = 0;
            if (values[0].string === "cover") {
                scale = Math.max(width / imageWidth, height / imageHeight);
            } else if (values[0].string === "contain") {
                scale = Math.min(width / imageWidth, height / imageHeight);
            }

            if (scale > 0) {
                imageWidth *= scale;
                imageHeight *= scale;

                res.sizeX = imageWidth;
                res.sizeY = imageHeight;
            }
        }
    }

    // position
    const position = background.position;
    if (position) {
        const v = parsePosition(position);
        if (v) {
            const spaceX = width - imageWidth;
            const spaceY = height - imageHeight;

            if (v.x.unit === "%" && v.y.unit === "%") {
                res.posX = spaceX * v.x.value / 100;
                res.posY = spaceY * v.y.value / 100;
            } else if (v.x.type === "number" && v.y.type === "number" &&
                ((v.x.unit === "px" && v.y.unit === "px") || (v.x.unit === "" && v.y.unit === ""))) {
                res.posX = v.x.value;
                res.posY = v.y.value;
            } else if (v.x.type === "ident" && v.y.type === "ident") {
                if (v.x.string.toLowerCase() === "center") {
                    res.posX = spaceX / 2;
                } else if (v.x.string.toLowerCase() === "right") {
                    res.posX = spaceX;
                }

                if (v.y.string.toLowerCase() === "center") {
                    res.posY = spaceY / 2;
                } else if (v.y.string.toLowerCase() === "bottom") {
                    res.posY = spaceY;
                }
            }
        }
    }

    return res;
}

function uiColorFromImage(img: UIImage, view: View, callback: (uiColor: UIColor) => void, flip?: boolean): void {
    if (!img) {
        callback(null);
    }

    const nativeView = view.nativeView as UIView;
    const background = view.style.backgroundInternal;
    const frame = nativeView.frame;
    const boundsWidth = view.scaleX ? frame.size.width / view.scaleX : frame.size.width;
    const boundsHeight = view.scaleY ? frame.size.height / view.scaleY : frame.size.height;

    const params = getDrawParams(img, background, boundsWidth, boundsHeight);

    if (params.sizeX > 0 && params.sizeY > 0) {
        const resizeRect = CGRectMake(0, 0, params.sizeX, params.sizeY);
        UIGraphicsBeginImageContext(resizeRect.size);
        img.drawInRect(resizeRect);
        img = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
    }

    UIGraphicsBeginImageContextWithOptions(CGSizeFromString(`{${boundsWidth},${boundsHeight}}`), false, 0.0);
    const context = UIGraphicsGetCurrentContext();

    if (background.color && background.color.ios) {
        CGContextSetFillColorWithColor(context, background.color.ios.CGColor);
        CGContextFillRect(context, CGRectMake(0, 0, boundsWidth, boundsHeight));
    }

    if (!params.repeatX && !params.repeatY) {
        img.drawAtPoint(CGPointMake(params.posX, params.posY));
    } else {
        const w = params.repeatX ? boundsWidth : img.size.width;
        const h = params.repeatY ? boundsHeight : img.size.height;

        CGContextSetPatternPhase(context, CGSizeMake(params.posX, params.posY));

        params.posX = params.repeatX ? 0 : params.posX;
        params.posY = params.repeatY ? 0 : params.posY;

        const patternRect = CGRectMake(params.posX, params.posY, w, h);

        img.drawAsPatternInRect(patternRect);
    }

    const bkgImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    if (flip) {
        const flippedImage = _flipImage(bkgImage);
        callback(UIColor.alloc().initWithPatternImage(flippedImage));
    } else {
        callback(UIColor.alloc().initWithPatternImage(bkgImage));
    }
}

// Flipping the default coordinate system
// https://developer.apple.com/library/ios/documentation/2DDrawing/Conceptual/DrawingPrintingiOS/GraphicsDrawingOverview/GraphicsDrawingOverview.html
function _flipImage(originalImage: UIImage): UIImage {
    UIGraphicsBeginImageContextWithOptions(originalImage.size, false, 0.0);
    const context = UIGraphicsGetCurrentContext();
    CGContextSaveGState(context);
    CGContextTranslateCTM(context, 0.0, originalImage.size.height);
    CGContextScaleCTM(context, 1.0, -1.0);
    originalImage.drawInRect(CGRectMake(0, 0, originalImage.size.width, originalImage.size.height))
    CGContextRestoreGState(context);
    const flippedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return flippedImage;
}

function cssValueToDeviceIndependentPixels(source: string, total: number): number {
    source = source.trim();
    if (source.indexOf("px") !== -1) {
        return layout.toDeviceIndependentPixels(parseFloat(source.replace("px", "")));
    } else if (source.indexOf("%") !== -1 && total > 0) {
        return (parseFloat(source.replace("%", "")) / 100) * total;
    } else {
        return parseFloat(source);
    }
}

function drawNonUniformBorders(nativeView: NativeView, background: BackgroundDefinition) {
    const layer = nativeView.layer;
    layer.borderColor = undefined;
    layer.borderWidth = 0;
    layer.cornerRadius = 0;

    const layerBounds = layer.bounds;
    const layerOrigin = layerBounds.origin;
    const layerSize = layerBounds.size;

    const nativeViewLayerBounds = {
        left: layerOrigin.x,
        top: layerOrigin.y,
        bottom: layerSize.height,
        right: layerSize.width
    };

    const top = layout.toDeviceIndependentPixels(background.borderTopWidth);
    const right = layout.toDeviceIndependentPixels(background.borderRightWidth);
    const bottom = layout.toDeviceIndependentPixels(background.borderBottomWidth);
    const left = layout.toDeviceIndependentPixels(background.borderLeftWidth);

    const lto: Point = { x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.top };// left-top-outside
    const lti: Point = { x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.top + top }; // left-top-inside

    const rto: Point = { x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.top }; // right-top-outside
    const rti: Point = { x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.top + top }; // right-top-inside

    const rbo: Point = { x: nativeViewLayerBounds.right, y: nativeViewLayerBounds.bottom }; // right-bottom-outside
    const rbi: Point = { x: nativeViewLayerBounds.right - right, y: nativeViewLayerBounds.bottom - bottom }; // right-bottom-inside

    const lbo: Point = { x: nativeViewLayerBounds.left, y: nativeViewLayerBounds.bottom }; // left-bottom-outside
    const lbi: Point = { x: nativeViewLayerBounds.left + left, y: nativeViewLayerBounds.bottom - bottom }; // left-bottom-inside

    let hasNonUniformBorder: boolean;

    // TODO: This is inefficient.
    // We need to know what caused the change and reuse as much as possible.
    if (nativeView.topBorderLayer) {
        nativeView.topBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.rightBorderLayer) {
        nativeView.rightBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.bottomBorderLayer) {
        nativeView.bottomBorderLayer.removeFromSuperlayer();
    }
    if (nativeView.leftBorderLayer) {
        nativeView.leftBorderLayer.removeFromSuperlayer();
    }

    const borderTopColor = background.borderTopColor;
    if (top > 0 && borderTopColor && borderTopColor.ios) {
        const topBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(topBorderPath, null, lto.x, lto.y);
        CGPathAddLineToPoint(topBorderPath, null, rto.x, rto.y);
        CGPathAddLineToPoint(topBorderPath, null, rti.x, rti.y);
        CGPathAddLineToPoint(topBorderPath, null, lti.x, lti.y);
        CGPathAddLineToPoint(topBorderPath, null, lto.x, lto.y);

        const topBorderLayer = CAShapeLayer.layer();
        topBorderLayer.fillColor = background.borderTopColor.ios.CGColor;
        topBorderLayer.path = topBorderPath;

        layer.addSublayer(topBorderLayer);
        nativeView.topBorderLayer = topBorderLayer;
        hasNonUniformBorder = true;
    }

    const borderRightColor = background.borderRightColor;
    if (right > 0 && borderRightColor && borderRightColor.ios) {
        const rightBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(rightBorderPath, null, rto.x, rto.y);
        CGPathAddLineToPoint(rightBorderPath, null, rbo.x, rbo.y);
        CGPathAddLineToPoint(rightBorderPath, null, rbi.x, rbi.y);
        CGPathAddLineToPoint(rightBorderPath, null, rti.x, rti.y);
        CGPathAddLineToPoint(rightBorderPath, null, rto.x, rto.y);

        const rightBorderLayer = CAShapeLayer.layer();
        rightBorderLayer.fillColor = background.borderRightColor.ios.CGColor;
        rightBorderLayer.path = rightBorderPath;

        layer.addSublayer(rightBorderLayer);
        nativeView.rightBorderLayer = rightBorderLayer;
        hasNonUniformBorder = true;
    }

    const borderBottomColor = background.borderBottomColor;
    if (bottom > 0 && borderBottomColor && borderBottomColor.ios) {
        const bottomBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(bottomBorderPath, null, rbo.x, rbo.y);
        CGPathAddLineToPoint(bottomBorderPath, null, lbo.x, lbo.y);
        CGPathAddLineToPoint(bottomBorderPath, null, lbi.x, lbi.y);
        CGPathAddLineToPoint(bottomBorderPath, null, rbi.x, rbi.y);
        CGPathAddLineToPoint(bottomBorderPath, null, rbo.x, rbo.y);

        const bottomBorderLayer = CAShapeLayer.layer();
        bottomBorderLayer.fillColor = background.borderBottomColor.ios.CGColor;
        bottomBorderLayer.path = bottomBorderPath;

        layer.addSublayer(bottomBorderLayer);
        nativeView.bottomBorderLayer = bottomBorderLayer;
        hasNonUniformBorder = true;
    }

    const borderLeftColor = background.borderLeftColor;
    if (left > 0 && borderLeftColor && borderLeftColor.ios) {
        const leftBorderPath = CGPathCreateMutable();
        CGPathMoveToPoint(leftBorderPath, null, lbo.x, lbo.y);
        CGPathAddLineToPoint(leftBorderPath, null, lto.x, lto.y);
        CGPathAddLineToPoint(leftBorderPath, null, lti.x, lti.y);
        CGPathAddLineToPoint(leftBorderPath, null, lbi.x, lbi.y);
        CGPathAddLineToPoint(leftBorderPath, null, lbo.x, lbo.y);

        const leftBorderLayer = CAShapeLayer.layer();
        leftBorderLayer.fillColor = background.borderLeftColor.ios.CGColor;
        leftBorderLayer.path = leftBorderPath;

        layer.addSublayer(leftBorderLayer);
        nativeView.leftBorderLayer = leftBorderLayer;
        hasNonUniformBorder = true;
    }

    nativeView.hasNonUniformBorder = hasNonUniformBorder;
}

function drawClipPath(nativeView: UIView, background: BackgroundDefinition) {
    const layer = nativeView.layer;
    const layerBounds = layer.bounds;
    const layerOrigin = layerBounds.origin;
    const layerSize = layerBounds.size;

    const bounds = {
        left: layerOrigin.x,
        top: layerOrigin.y,
        bottom: layerSize.height,
        right: layerSize.width
    };

    if (bounds.right === 0 || bounds.bottom === 0) {
        return;
    }

    let path: UIBezierPath;
    const clipPath = background.clipPath;

    const functionName = clipPath.substring(0, clipPath.indexOf("("));
    const value = clipPath.replace(`${functionName}(`, "").replace(")", "");

    switch (functionName) {
        case "rect":
            path = rectPath(value, bounds);
            break;

        case "inset":
            path = insetPath(value, bounds);
            break;

        case "circle":
            path = circlePath(value, bounds);
            break;

        case "ellipse":
            path = ellipsePath(value, bounds);
            break;

        case "polygon":
            path = polygonPath(value, bounds);
            break;
    }

    if (path) {
        const shape = CAShapeLayer.layer();
        shape.path = path;
        layer.mask = shape;
        nativeView.clipsToBounds = true;

        const borderWidth = background.getUniformBorderWidth();
        const borderColor = background.getUniformBorderColor();

        if (borderWidth > 0 && borderColor instanceof Color) {
            const borderLayer = CAShapeLayer.layer();
            borderLayer.path = path;
            borderLayer.lineWidth = borderWidth * 2;
            borderLayer.strokeColor = borderColor.ios.CGColor;
            borderLayer.fillColor = clearCGColor;
            borderLayer.frame = nativeView.bounds;

            layer.borderColor = undefined;
            layer.borderWidth = 0;
            layer.addSublayer(borderLayer);
        }
    }
}

function rectPath(value: string, bounds: Rect): UIBezierPath {
    const arr = value.split(/[\s]+/);
    const top = cssValueToDeviceIndependentPixels(arr[0], bounds.top);
    const right = cssValueToDeviceIndependentPixels(arr[1], bounds.right);
    const bottom = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
    const left = cssValueToDeviceIndependentPixels(arr[3], bounds.left);

    return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function insetPath(value: string, bounds: Rect): UIBezierPath {
    const arr = value.split(/[\s]+/);

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

    const top = cssValueToDeviceIndependentPixels(topString, bounds.bottom);
    const right = cssValueToDeviceIndependentPixels("100%", bounds.right) - cssValueToDeviceIndependentPixels(rightString, bounds.right);
    const bottom = cssValueToDeviceIndependentPixels("100%", bounds.bottom) - cssValueToDeviceIndependentPixels(bottomString, bounds.bottom);
    const left = cssValueToDeviceIndependentPixels(leftString, bounds.right);

    return UIBezierPath.bezierPathWithRect(CGRectMake(left, top, right - left, bottom - top)).CGPath;
}

function circlePath(value: string, bounds: Rect): UIBezierPath {
    const arr = value.split(/[\s]+/);
    const radius = cssValueToDeviceIndependentPixels(arr[0], (bounds.right > bounds.bottom ? bounds.bottom : bounds.right) / 2);
    const y = cssValueToDeviceIndependentPixels(arr[2], bounds.bottom);
    const x = cssValueToDeviceIndependentPixels(arr[3], bounds.right);

    return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(x, y), radius, 0, 360, true).CGPath;
}

function ellipsePath(value: string, bounds: Rect): UIBezierPath {
    const arr = value.split(/[\s]+/);

    const rX = cssValueToDeviceIndependentPixels(arr[0], bounds.right);
    const rY = cssValueToDeviceIndependentPixels(arr[1], bounds.bottom);
    const cX = cssValueToDeviceIndependentPixels(arr[3], bounds.right);
    const cY = cssValueToDeviceIndependentPixels(arr[4], bounds.bottom);

    const left = cX - rX;
    const top = cY - rY;
    const width = rX * 2;
    const height = rY * 2;

    return UIBezierPath.bezierPathWithOvalInRect(CGRectMake(left, top, width, height)).CGPath;
}

function polygonPath(value: string, bounds: Rect): UIBezierPath {
    const path = CGPathCreateMutable();

    let firstPoint: Point;
    const arr = value.split(/[,]+/);
    for (let i = 0; i < arr.length; i++) {
        const xy = arr[i].trim().split(/[\s]+/);
        const point: Point = {
            x: cssValueToDeviceIndependentPixels(xy[0], bounds.right),
            y: cssValueToDeviceIndependentPixels(xy[1], bounds.bottom)
        };

        if (!firstPoint) {
            firstPoint = point;
            CGPathMoveToPoint(path, null, point.x, point.y);
        }

        CGPathAddLineToPoint(path, null, point.x, point.y);
    }

    CGPathAddLineToPoint(path, null, firstPoint.x, firstPoint.y);
    return path;
}
