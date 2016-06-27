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

        let clipPath = v.style._getValue(style.clipPathProperty);
        let background = <background.Background>v.style._getValue(style.backgroundInternalProperty);
        let borderWidth = v.borderWidth;
        let backgroundDrawable = nativeView.getBackground();
        let density = utils.layout.getDisplayDensity();
        let cache = <CacheLayerType>v._nativeView;
        if (v instanceof button.Button && !types.isNullOrUndefined(backgroundDrawable) && types.isFunction(backgroundDrawable.setColorFilter) &&
            v.borderWidth === 0 && v.borderRadius === 0 && !clipPath &&
            types.isNullOrUndefined(v.style._getValue(style.backgroundImageProperty)) &&
            !types.isNullOrUndefined(v.style._getValue(style.backgroundColorProperty))) {
            let backgroundColor = (<any>backgroundDrawable).backgroundColor = v.style._getValue(style.backgroundColorProperty).android;
            backgroundDrawable.setColorFilter(backgroundColor, android.graphics.PorterDuff.Mode.SRC_IN);
            (<any>backgroundDrawable).backgroundColor = backgroundColor;
        } 
        else if (v.borderWidth || v.borderRadius || clipPath || !background.isEmpty()) {
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
            
            if ((v.borderWidth || v.borderRadius || clipPath) && getSDK() < 18) {
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

        nativeView.setPadding(
            Math.round((borderWidth + v.style.paddingLeft) * density),
            Math.round((borderWidth + v.style.paddingTop) * density),
            Math.round((borderWidth + v.style.paddingRight) * density),
            Math.round((borderWidth + v.style.paddingBottom) * density)
        );
    }
}

function refreshBorderDrawable(view: view.View, borderDrawable: org.nativescript.widgets.BorderDrawable){
    let background = <background.Background>view.style._getValue(style.backgroundInternalProperty);
    let borderWidth: number = view.borderWidth;
    let borderColor: number = 0;
    if (view.borderColor && view.borderColor.android){
        borderColor = view.borderColor.android;
    }
    let borderRadius: number = view.borderRadius;
    let clipPath: string = view.style._getValue(style.clipPathProperty);
    let backgroundColor: number = 0;
    let backgroundImage: android.graphics.Bitmap = null;
    let backgroundRepeat: string = null;
    let backgroundPosition: string = null;
    let backgroundPositionParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
    let backgroundSize: string = null;
    let backgroundSizeParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
    if (background){
        if (background.color && background.color.android){
            backgroundColor = background.color.android;
        }
        if (background.image && background.image.android){
            backgroundImage = background.image.android;
        }
        if (background.position){
            backgroundPosition = background.position;
            backgroundPositionParsedCSSValues = createNativeCSSValueArray(background.position); 
        }
        if (background.size){
            backgroundSize = background.size;
            backgroundSizeParsedCSSValues = createNativeCSSValueArray(background.size); 
        }
    }
    
    borderDrawable.refresh(
        borderWidth, 
        borderColor,
        borderRadius,
        clipPath,
        backgroundColor,
        backgroundImage,
        backgroundRepeat,
        backgroundPosition,
        backgroundPositionParsedCSSValues,
        backgroundSize,
        backgroundSizeParsedCSSValues
    );
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