import utils = require("utils/utils");
import common = require("./background-common");
import definition = require("ui/styling/background");
import view = require("ui/core/view");
import types = require("utils/types");
import * as styleModule from "./style";
import * as buttonModule from "ui/button";
import { CacheLayerType } from "utils/utils";
import cssValue = require("css-value");

var button: typeof buttonModule;
var style: typeof styleModule;

function ensureLazyRequires() {
    if (!button) {
        button = require("ui/button");
    }

    if (!style) {
        style = require("./style");
    }
}

global.moduleMerge(common, exports);

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    var SDK: number;
    function getSDK() {
        if (!SDK) {
            SDK = android.os.Build.VERSION.SDK_INT;
        }

        return SDK;
    }

    var _defaultBackgrounds = new Map<string, android.graphics.drawable.Drawable>();

    export function onBackgroundOrBorderPropertyChanged(v: view.View) {
        var nativeView = <android.view.View>v._nativeView;
        var cache = <CacheLayerType>v._nativeView;
        
        if (!nativeView) {
            return;
        }

        ensureLazyRequires();

        var clipPathValue = v.style._getValue(style.clipPathProperty);

        var backgroundValue = <definition.Background>v.style._getValue(style.backgroundInternalProperty);
        var borderWidth = v.borderWidth;
        var bkg = nativeView.getBackground();

        var density = utils.layout.getDisplayDensity();

        if (v instanceof button.Button && !types.isNullOrUndefined(bkg) && types.isFunction(bkg.setColorFilter) &&
            v.borderWidth === 0 && v.borderRadius === 0 && !clipPathValue &&
            types.isNullOrUndefined(v.style._getValue(style.backgroundImageProperty)) &&
            !types.isNullOrUndefined(v.style._getValue(style.backgroundColorProperty))) {
            let backgroundColor = (<any>bkg).backgroundColor = v.style._getValue(style.backgroundColorProperty).android;
            bkg.setColorFilter(backgroundColor, android.graphics.PorterDuff.Mode.SRC_IN);
            (<any>bkg).backgroundColor = backgroundColor;
        } 
        else if (v.borderWidth || v.borderRadius || clipPathValue || !backgroundValue.isEmpty()) {
            if (!(bkg instanceof org.nativescript.widgets.BorderDrawable)) {
                bkg = new org.nativescript.widgets.BorderDrawable(density);
                let viewClass = types.getClass(v);
                if (!(v instanceof button.Button) && !_defaultBackgrounds.has(viewClass)) {
                    _defaultBackgrounds.set(viewClass, nativeView.getBackground());
                }

                nativeView.setBackground(bkg);
            }
            
            (<org.nativescript.widgets.BorderDrawable>bkg).refresh(
                v.borderWidth, 
                v.borderColor ? v.borderColor.android : 0,
                v.borderRadius,
                clipPathValue,
                (backgroundValue.color && backgroundValue.color.android) ? backgroundValue.color.android : 0,
                (backgroundValue.image && backgroundValue.image.android) ? backgroundValue.image.android : null,
                (backgroundValue.image && backgroundValue.image.android) ? backgroundValue.image.width : 0,
                (backgroundValue.image && backgroundValue.image.android) ? backgroundValue.image.height : 0,
                backgroundValue.repeat,
                backgroundValue.position,
                backgroundValue.position ? createNativeCSSValueArray(backgroundValue.position) : null,
                backgroundValue.size,
                backgroundValue.size ? createNativeCSSValueArray(backgroundValue.size) : null
            );

            if ((v.borderWidth || v.borderRadius || clipPathValue) && getSDK() < 18) {
                // Switch to software because of unsupported canvas methods if hardware acceleration is on:
                // http://developer.android.com/guide/topics/graphics/hardware-accel.html
                cache.layerType = cache.getLayerType();
                cache.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
            }
        }
        else {
            // reset the value with the default native value
            if (v instanceof button.Button) {
                var nativeButton = new android.widget.Button(nativeView.getContext());
                nativeView.setBackground(nativeButton.getBackground());
            }
            else {
                let viewClass = types.getClass(v);
                if (_defaultBackgrounds.has(viewClass)) {
                    nativeView.setBackground(_defaultBackgrounds.get(viewClass));
                }
            }

            if (cache.layerType !== undefined) {
                cache.setLayerType(cache.layerType, null);
                cache.layerType = undefined;
            }
        }

        nativeView.setPadding(
            Math.round((borderWidth + v.style.paddingLeft) * density),
            Math.round((borderWidth + v.style.paddingTop) * density),
            Math.round((borderWidth + v.style.paddingRight) * density),
            Math.round((borderWidth + v.style.paddingBottom) * density)
        );
    }
}

function createNativeCSSValueArray(css: string): any{
    if (!css){
        return null;
    }
    let cssValues = cssValue(css);
    let nativeArray = (<any>Array).create(org.nativescript.widgets.CSSValue, cssValues.length);
    for (let i = 0, length = cssValues.length; i < length; i++){
        nativeArray[i] = new org.nativescript.widgets.CSSValue(
            cssValues[i].type,
            cssValues[i].string,
            cssValues[i].unit,
            cssValues[i].value
        );
    }
    return nativeArray;
}

function drawClipPath(clipPath: string, canvas: android.graphics.Canvas, paint: android.graphics.Paint, bounds: android.graphics.RectF) {
    var functionName = clipPath.substring(0, clipPath.indexOf("("));
    var value = clipPath.replace(`${functionName}(`, "").replace(")", "");

    if (functionName === "rect") {
        var arr = value.split(/[\s]+/);

        var top = common.cssValueToDevicePixels(arr[0], bounds.top);
        var left = common.cssValueToDevicePixels(arr[1], bounds.left);
        var bottom = common.cssValueToDevicePixels(arr[2], bounds.bottom);
        var right = common.cssValueToDevicePixels(arr[3], bounds.right);

        canvas.drawRect(left, top, right, bottom, paint);

    } else if (functionName === "circle") {
        var arr = value.split(/[\s]+/);

        var radius = common.cssValueToDevicePixels(arr[0], (bounds.width() > bounds.height() ? bounds.height() : bounds.width()) / 2);
        var y = common.cssValueToDevicePixels(arr[2], bounds.height());
        var x = common.cssValueToDevicePixels(arr[3], bounds.width());

        canvas.drawCircle(x, y, radius, paint);

    } else if (functionName === "ellipse") {
        var arr = value.split(/[\s]+/);

        var rX = common.cssValueToDevicePixels(arr[0], bounds.right);
        var rY = common.cssValueToDevicePixels(arr[1], bounds.bottom);
        var cX = common.cssValueToDevicePixels(arr[3], bounds.right);
        var cY = common.cssValueToDevicePixels(arr[4], bounds.bottom);
        
        var left = cX - rX;
        var top = cY - rY;
        var right = (rX * 2) + left;
        var bottom = (rY * 2) + top;

        canvas.drawOval(new android.graphics.RectF(left, top, right, bottom), paint);

    } else if (functionName === "polygon") {
        var path = new android.graphics.Path();
        var firstPoint: view.Point;
        var arr = value.split(/[,]+/);
        for (let i = 0; i < arr.length; i++) {
            let xy = arr[i].trim().split(/[\s]+/);
            let point: view.Point = {
                x: common.cssValueToDevicePixels(xy[0], bounds.width()),
                y: common.cssValueToDevicePixels(xy[1], bounds.height())
            };
            
            if (!firstPoint) {
                firstPoint = point;
                path.moveTo(point.x, point.y);
            }

            path.lineTo(point.x, point.y);
        }

        path.lineTo(firstPoint.x, firstPoint.y);

        canvas.drawPath(path, paint);
    }
}