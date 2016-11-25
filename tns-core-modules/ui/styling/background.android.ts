import { View, layout } from "ui/core/view";
import { isNullOrUndefined, isFunction, getClass } from "utils/types";
import { CacheLayerType } from "utils/utils";
import { Button } from "ui/button";
import cssValue = require("css-value");

export * from "./background-common"

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
    
    export function onBackgroundOrBorderPropertyChanged(v: View) {
        let nativeView = <android.view.View>v._nativeView;
        if (!nativeView) {
            return;
        }
        let style = v.style;

        let background = style.backgroundInternal;
        let backgroundDrawable = nativeView.getBackground();
        let density = layout.getDisplayDensity();
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
                
                backgroundDrawable = new org.nativescript.widgets.BorderDrawable(1, v.toString());
                refreshBorderDrawable(v, <org.nativescript.widgets.BorderDrawable>backgroundDrawable);

                if (getSDK() >= 16) {
                    nativeView.setBackground(backgroundDrawable);
                } else {
                    nativeView.setBackgroundDrawable(backgroundDrawable);
                }
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
            if (v instanceof Button) {
                let nativeButton = new android.widget.Button(nativeView.getContext());

                if (getSDK() >= 16) {
                    nativeView.setBackground(nativeButton.getBackground());
                } else {
                    nativeView.setBackgroundDrawable(nativeButton.getBackground());
                }
            }
            else {
                let viewClass = getClass(v);
                if (_defaultBackgrounds.has(viewClass)) {
                    if (getSDK() >= 16) {
                        nativeView.setBackground(_defaultBackgrounds.get(viewClass));
                    } else {
                        nativeView.setBackgroundDrawable(_defaultBackgrounds.get(viewClass));
                    }
                }
            }

            if (cache.layerType !== undefined) {
                cache.setLayerType(cache.layerType, null);
                cache.layerType = undefined;
            }
        }

        // TODO: Can we move BorderWidths as separate native setter?
        // This way we could skip setPadding if borderWidth is not changed.
        let leftPadding = Math.round(style.effectiveBorderLeftWidth + style.effectivePaddingLeft);
        let topPadding = Math.round(style.effectiveBorderTopWidth + style.effectivePaddingTop);
        let rightPadding = Math.round(style.effectiveBorderRightWidth + style.effectivePaddingRight);
        let bottomPadding = Math.round(style.effectiveBorderBottomWidth + style.effectivePaddingBottom);

        nativeView.setPadding(
            leftPadding,
            topPadding,
            rightPadding,
            bottomPadding
        );
    }
}

function refreshBorderDrawable(view: View, borderDrawable: org.nativescript.widgets.BorderDrawable) {
    let background = view.style.backgroundInternal;
    if (background) {
        let backgroundPositionParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
        let backgroundSizeParsedCSSValues: native.Array<org.nativescript.widgets.CSSValue> = null;
        if (background.position) {
            backgroundPositionParsedCSSValues = createNativeCSSValueArray(background.position);
        }
        if (background.size) {
            backgroundSizeParsedCSSValues = createNativeCSSValueArray(background.size);
        }

	let blackColor = android.graphics.Color.BLACK;
        borderDrawable.refresh(
            
            (background.borderTopColor && background.borderTopColor.android !== undefined) ? background.borderTopColor.android : blackColor,
            (background.borderRightColor && background.borderRightColor.android !== undefined) ? background.borderRightColor.android : blackColor,
            (background.borderBottomColor && background.borderBottomColor.android !== undefined) ? background.borderBottomColor.android : blackColor,
            (background.borderLeftColor && background.borderLeftColor.android !== undefined) ? background.borderLeftColor.android : blackColor,

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

function createNativeCSSValueArray(css: string): native.Array<org.nativescript.widgets.CSSValue> {
    if (!css) {
        return null;
    }

    let cssValues = cssValue(css);
    let nativeArray = Array.create(org.nativescript.widgets.CSSValue, cssValues.length);
    for (let i = 0, length = cssValues.length; i < length; i++) {
        nativeArray[i] = new org.nativescript.widgets.CSSValue(
            cssValues[i].type,
            cssValues[i].string,
            cssValues[i].unit,
            cssValues[i].value
        );
    }

    return nativeArray;
}
