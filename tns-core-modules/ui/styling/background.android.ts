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

    function isSetColorFilterOnlyWidget(nativeView: android.view.View): boolean {
        return ( 
            nativeView instanceof android.widget.Button || 
            (nativeView instanceof android.support.v7.widget.Toolbar 
            && getSDK() >= 21 // There is an issue with the DrawableContainer which was fixed for API version 21 and above: https://code.google.com/p/android/issues/detail?id=60183
            )
        ); 
    }
    
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

        if (isSetColorFilterOnlyWidget(nativeView) 
        && !types.isNullOrUndefined(backgroundDrawable) 
        && types.isFunction(backgroundDrawable.setColorFilter) 
        && !background.hasBorderWidth()
        && !background.hasBorderRadius()
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
                if (!isSetColorFilterOnlyWidget(nativeView) && !_defaultBackgrounds.has(viewClass)) {
                    _defaultBackgrounds.set(viewClass, nativeView.getBackground());
                }
                
                backgroundDrawable = new org.nativescript.widgets.BorderDrawable(density, v.toString());
                refreshBorderDrawable(v, <org.nativescript.widgets.BorderDrawable>backgroundDrawable);
                nativeView.setBackground(backgroundDrawable);
            }
            else {
                refreshBorderDrawable(v, <org.nativescript.widgets.BorderDrawable>backgroundDrawable);
            }
            
            if ((background.hasBorderWidth() || background.hasBorderRadius() || background.clipPath) && getSDK() < 18) {
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

        let leftPadding = Math.round(((background.borderLeftWidth || 0) + (v.style.paddingLeft || 0)) * density); 
        let topPadding = Math.round(((background.borderTopWidth || 0) + (v.style.paddingTop || 0)) * density); 
        let rightPadding = Math.round(((background.borderRightWidth || 0) + (v.style.paddingRight || 0)) * density);         
        let bottomPadding = Math.round(((background.borderBottomWidth || 0) + (v.style.paddingBottom || 0)) * density); 

        nativeView.setPadding(
            leftPadding,
            topPadding,
            rightPadding,
            bottomPadding
        );
    }
}

function refreshBorderDrawable(view: view.View, borderDrawable: org.nativescript.widgets.BorderDrawable){
    //console.log(`>>> refreshBorderDrawable(${view})...`);
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
            
            (background.borderTopColor && background.borderTopColor.android) ? background.borderTopColor.android : 0,
            (background.borderRightColor && background.borderRightColor.android) ? background.borderRightColor.android : 0,
            (background.borderBottomColor && background.borderBottomColor.android) ? background.borderBottomColor.android : 0,
            (background.borderLeftColor && background.borderLeftColor.android) ? background.borderLeftColor.android : 0,

            background.borderTopWidth, 
            background.borderRightWidth, 
            background.borderBottomWidth, 
            background.borderLeftWidth,

            background.borderTopLeftRadius,
            background.borderTopRightRadius,
            background.borderBottomRightRadius,
            background.borderBottomLeftRadius,

            background.clipPath,

            (background.color && background.color.android) ? background.color.android : 0,
            (background.image && background.image.android) ? background.image.android : null,
            background.repeat,
            background.position,
            backgroundPositionParsedCSSValues,
            background.size,
            backgroundSizeParsedCSSValues
        );
        //console.log(`>>> ${borderDrawable.toDebugString()}`);
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