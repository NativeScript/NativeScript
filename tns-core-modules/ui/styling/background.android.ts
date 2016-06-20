import utils = require("utils/utils");
import common = require("./background-common");
import view = require("ui/core/view");
import types = require("utils/types");
import * as styleModule from "./style";
import * as buttonModule from "ui/button";
import { CacheLayerType } from "utils/utils";
import cssValue = require("css-value");
import background = require("ui/styling/background");

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

        var backgroundValue = <background.Background>v.style._getValue(style.backgroundInternalProperty);
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