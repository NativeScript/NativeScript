import { View } from "../core/view";
import { CacheLayerType, isDataURI, isFileOrResourcePath, layout, RESOURCE_PREFIX, FILE_PREFIX } from "../../utils/utils";
import { parse } from "../../css-value";
import { path, knownFolders } from "../../file-system";
import { android as androidApp } from "../../application";
export * from "./background-common"

interface AndroidView {
    background: android.graphics.drawable.Drawable.ConstantState;
}

// TODO: Change this implementation to use 
// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    let SDK: number;
    function getSDK() {
        if (!SDK) {
            SDK = android.os.Build.VERSION.SDK_INT;
        }

        return SDK;
    }

    function isSetColorFilterOnlyWidget(nativeView: android.view.View): boolean {
        return (
            nativeView instanceof android.widget.Button ||
            (nativeView instanceof android.support.v7.widget.Toolbar
                && getSDK() >= 21 // There is an issue with the DrawableContainer which was fixed for API version 21 and above: https://code.google.com/p/android/issues/detail?id=60183
            )
        );
    }

    export function onBackgroundOrBorderPropertyChanged(view: View) {
        const nativeView = <android.view.View>view.nativeView;
        if (!nativeView) {
            return;
        }

        const background = view.style.backgroundInternal;
        const cache = <CacheLayerType>view.nativeView;
        const drawable = nativeView.getBackground();
        const androidView = <any>view as AndroidView;
        // use undefined as not set. getBackground will never return undefined only Drawable or null;
        if (androidView.background === undefined && drawable) {
            androidView.background = drawable.getConstantState();
        }

        if (isSetColorFilterOnlyWidget(nativeView)
            && drawable
            && !background.hasBorderWidth()
            && !background.hasBorderRadius()
            && !background.clipPath
            && !background.image
            && background.color) {
            const backgroundColor = (<any>drawable).backgroundColor = background.color.android;
            drawable.mutate();
            drawable.setColorFilter(backgroundColor, android.graphics.PorterDuff.Mode.SRC_IN);
            drawable.invalidateSelf(); // Make sure the drawable is invalidated. Android forgets to invalidate it in some cases: toolbar
            (<any>drawable).backgroundColor = backgroundColor;
        } else if (!background.isEmpty()) {
            let backgroundDrawable = drawable as org.nativescript.widgets.BorderDrawable;
            if (!(drawable instanceof org.nativescript.widgets.BorderDrawable)) {
                backgroundDrawable = new org.nativescript.widgets.BorderDrawable(layout.getDisplayDensity(), view.toString());
                refreshBorderDrawable(view, backgroundDrawable);
                org.nativescript.widgets.ViewHelper.setBackground(nativeView, backgroundDrawable);
            } else {
                refreshBorderDrawable(view, backgroundDrawable);
            }

            // This should be done only when backgroundImage is set!!!
            if ((background.hasBorderWidth() || background.hasBorderRadius() || background.clipPath) && getSDK() < 18) {
                // Switch to software because of unsupported canvas methods if hardware acceleration is on:
                // http://developer.android.com/guide/topics/graphics/hardware-accel.html
                if (cache.layerType === undefined) {
                    cache.layerType = cache.getLayerType();
                    cache.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
                }
            }
        } else {
            // TODO: newDrawable for BitmapDrawable will fail if we don't speicfy resource. Use the other overload.
            const defaultDrawable = androidView.background ? androidView.background.newDrawable(nativeView.getResources()) : null;
            org.nativescript.widgets.ViewHelper.setBackground(nativeView, defaultDrawable);
            androidView.background = undefined;
            
            if (cache.layerType !== undefined) {
                cache.setLayerType(cache.layerType, null);
                cache.layerType = undefined;
            }
        }

        // TODO: Can we move BorderWidths as separate native setter?
        // This way we could skip setPadding if borderWidth is not changed.
        const leftPadding = Math.ceil(view.effectiveBorderLeftWidth + view.effectivePaddingLeft);
        const topPadding = Math.ceil(view.effectiveBorderTopWidth + view.effectivePaddingTop);
        const rightPadding = Math.ceil(view.effectiveBorderRightWidth + view.effectivePaddingRight);
        const bottomPadding = Math.ceil(view.effectiveBorderBottomWidth + view.effectivePaddingBottom);

        nativeView.setPadding(
            leftPadding,
            topPadding,
            rightPadding,
            bottomPadding
        );
    }
}

function fromBase64(source: string): android.graphics.Bitmap {
    const bytes = android.util.Base64.decode(source, android.util.Base64.DEFAULT);
    return android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length)
}

const pattern: RegExp = /url\(('|")(.*?)\1\)/;
function refreshBorderDrawable(this: void, view: View, borderDrawable: org.nativescript.widgets.BorderDrawable) {
    const nativeView = <android.view.View>view.nativeView;
    const context = nativeView.getContext();

    const background = view.style.backgroundInternal;
    if (background) {
        const backgroundPositionParsedCSSValues = createNativeCSSValueArray(background.position);
        const backgroundSizeParsedCSSValues = createNativeCSSValueArray(background.size);
        const blackColor = -16777216; //android.graphics.Color.BLACK;

        let imageUri = background.image;
        if (imageUri) {
            const match = imageUri.match(pattern);
            if (match && match[2]) {
                imageUri = match[2];
            }
        }

        let bitmap: android.graphics.Bitmap = null;
        if (isDataURI(imageUri)) {
            const base64Data = imageUri.split(",")[1];
            if (base64Data !== undefined) {
                bitmap = fromBase64(base64Data);
                imageUri = null;
            }
        } else if (isFileOrResourcePath(imageUri)) {
            if (imageUri.indexOf(RESOURCE_PREFIX) !== 0) {
                let fileName = imageUri;
                if (fileName.indexOf("~/") === 0) {
                    fileName = path.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
                }

                imageUri = FILE_PREFIX + fileName;
            }
        }

        borderDrawable.refresh(
            background.borderTopColor ? background.borderTopColor.android : blackColor,
            background.borderRightColor ? background.borderRightColor.android : blackColor,
            background.borderBottomColor ? background.borderBottomColor.android : blackColor,
            background.borderLeftColor ? background.borderLeftColor.android : blackColor,

            background.borderTopWidth,
            background.borderRightWidth,
            background.borderBottomWidth,
            background.borderLeftWidth,

            background.borderTopLeftRadius,
            background.borderTopRightRadius,
            background.borderBottomRightRadius,
            background.borderBottomLeftRadius,

            background.clipPath,

            background.color ? background.color.android : 0,
            imageUri,
            bitmap,
            context,
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

    const cssValues = parse(css);
    const nativeArray = Array.create(org.nativescript.widgets.CSSValue, cssValues.length);
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

export enum CacheMode {
    none,
    memory,
    diskAndMemory
}

let currentCacheMode: CacheMode;
let imageFetcher: org.nativescript.widgets.image.Fetcher;

export function initImageCache(context: android.content.Context, mode = CacheMode.diskAndMemory, memoryCacheSize: number = 0.25, diskCacheSize: number = 10 * 1024 * 1024): void {
    if (currentCacheMode === mode) {
        return;
    }

    currentCacheMode = mode;
    if (!imageFetcher) {
        imageFetcher = org.nativescript.widgets.image.Fetcher.getInstance(context);
    } else {
        imageFetcher.clearCache();
    }

    const params = new org.nativescript.widgets.image.Cache.CacheParams();
    params.memoryCacheEnabled = mode !== CacheMode.none;
    params.setMemCacheSizePercent(memoryCacheSize); // Set memory cache to % of app memory
    params.diskCacheEnabled = mode === CacheMode.diskAndMemory;
    params.diskCacheSize = diskCacheSize;
    const imageCache = org.nativescript.widgets.image.Cache.getInstance(params);
    imageFetcher.addImageCache(imageCache);
    imageFetcher.initCache();
}

androidApp.on("activityStarted", (args) => {
    if (!imageFetcher) {
        initImageCache(args.activity);
    } else {
        imageFetcher.initCache();
    }
});

androidApp.on("activityStopped", (args) => {
    if (imageFetcher) {
        imageFetcher.closeCache();
    }
});