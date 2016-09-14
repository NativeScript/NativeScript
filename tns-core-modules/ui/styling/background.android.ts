import utils = require("utils/utils");
import common = require("./background-common");
import view = require("ui/core/view");
import types = require("utils/types");
import * as styleModule from "./style";
import * as buttonModule from "ui/button";
import { CacheLayerType } from "utils/utils";
import cssValue = require("css-value");
import background = require("ui/styling/background");

let button: typeof buttonModule;
let style: typeof styleModule;

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
    let SDK: number;
    function getSDK() {
        if (!SDK) {
            SDK = android.os.Build.VERSION.SDK_INT;
        }

        return SDK;
    }

    let _defaultBackgrounds = new Map<string, android.graphics.drawable.Drawable>();

    export function onBackgroundOrBorderPropertyChanged(v: view.View) {
        let nativeView = <android.view.View>v._nativeView;
        if (!nativeView) {
            return;
        }
        
        ensureLazyRequires();

        let background = <common.Background>v.style._getValue(style.backgroundInternalProperty);
        let backgroundDrawable = nativeView.getBackground();
        let density = utils.layout.getDisplayDensity();
        let cache = <CacheLayerType>v._nativeView;
        if (v instanceof button.Button 
        && !types.isNullOrUndefined(backgroundDrawable) 
        && types.isFunction(backgroundDrawable.setColorFilter) 
        && background.borderWidth === 0 
        && background.borderRadius === 0 
        && !background.clipPath 
        && types.isNullOrUndefined(background.image) 
        && !types.isNullOrUndefined(background.color)) {
            let backgroundColor = (<any>backgroundDrawable).backgroundColor = background.color.android;
            backgroundDrawable.setColorFilter(backgroundColor, android.graphics.PorterDuff.Mode.SRC_IN);
            (<any>backgroundDrawable).backgroundColor = backgroundColor;
        } 
        else if (!background.isEmpty()) {
            if (!(backgroundDrawable instanceof org.nativescript.widgets.BorderDrawable)) {
                let viewClass = types.getClass(v);
                if (!(v instanceof button.Button) && !_defaultBackgrounds.has(viewClass)) {
                    _defaultBackgrounds.set(viewClass, nativeView.getBackground());
                }
                
                backgroundDrawable = new org.nativescript.widgets.BorderDrawable(density);
                refreshBorderDrawable(v, <org.nativescript.widgets.BorderDrawable>backgroundDrawable);
                nativeView.setBackground(backgroundDrawable);
            }
            else {
                refreshBorderDrawable(v, <org.nativescript.widgets.BorderDrawable>backgroundDrawable);
            }
            
            if ((background.borderWidth || background.borderRadius || background.clipPath) && getSDK() < 18) {
                // Switch to software because of unsupported canvas methods if hardware acceleration is on:
                // http://developer.android.com/guide/topics/graphics/hardware-accel.html
                cache.layerType = cache.getLayerType();
                cache.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
            }
        }
        else {
            // reset the value with the default native value
            if (v instanceof button.Button) {
                let nativeButton = new android.widget.Button(nativeView.getContext());
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

        let leftPadding = v.style.paddingLeft ?  v.style.paddingLeft : nativeView.getPaddingLeft() / density; 
        let topPadding = v.style.paddingTop ? v.style.paddingTop : nativeView.getPaddingTop() / density; 
        let rightPadding = v.style.paddingRight ? v.style.paddingRight : nativeView.getPaddingRight() / density;         
        let bottomPadding = v.style.paddingBottom ? v.style.paddingBottom : nativeView.getPaddingBottom() / density; 

        nativeView.setPadding(
            Math.round((background.borderWidth + leftPadding) * density),
            Math.round((background.borderWidth + topPadding) * density),
            Math.round((background.borderWidth + rightPadding) * density),
            Math.round((background.borderWidth + bottomPadding) * density)
        );
    }
}

function refreshBorderDrawable(view: view.View, borderDrawable: org.nativescript.widgets.BorderDrawable){
    let background = <background.Background>view.style._getValue(style.backgroundInternalProperty);
    if (background){
        let backgroundPositionParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
        let backgroundSizeParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
        if (background.position){
            backgroundPositionParsedCSSValues = createNativeCSSValueArray(background.position); 
        }
        if (background.size){
            backgroundSizeParsedCSSValues = createNativeCSSValueArray(background.size); 
        }
        
        borderDrawable.refresh(
            background.borderWidth, 
            (background.borderColor && background.borderColor.android) ? background.borderColor.android : 0,
            background.borderRadius,
            background.clipPath,
            (background.color && background.color.android) ? background.color.android : 0,
            (background.image && background.image.android) ? background.image.android : null,
            background.repeat,
            background.position,
            backgroundPositionParsedCSSValues,
            background.size,
            backgroundSizeParsedCSSValues
        );
    }
}

function createNativeCSSValueArray(css: string): native.Array<org.nativescript.widgets.CSSValue>{
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