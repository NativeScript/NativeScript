import {
    ImageSource, ImageBase, stretchProperty, imageSourceProperty, srcProperty, tintColorProperty, unsetValue, Color,
    isDataURI, isFileOrResourcePath, RESOURCE_PREFIX
} from "./image-common";
import { path, knownFolders } from "../../file-system";

export * from "./image-common";

const FILE_PREFIX = "file:///";
const ASYNC = "async";

let imageFetcher: org.nativescript.widgets.image.Fetcher;
let imageCache: org.nativescript.widgets.image.Cache;

export enum CacheMode {
    none,
    memory,
    diskAndMemory
}

export let currentCacheMode: CacheMode;

export function initImageCache(context: android.content.Context, mode = CacheMode.diskAndMemory, memoryCacheSize: number = 0.25, diskCacheSize: number = 10 * 1024 * 1024): void {
    if (currentCacheMode === mode) {
        return;
    }

    currentCacheMode = mode;
    if (!imageFetcher) {
        imageFetcher = org.nativescript.widgets.image.Fetcher.getInstance(context);
    }

    // Disable cache.
    if (mode === CacheMode.none) {
        if (imageCache != null && imageFetcher != null) {
            imageFetcher.clearCache();
        }
    }

    let params = new org.nativescript.widgets.image.Cache.CacheParams();
    params.memoryCacheEnabled = mode !== CacheMode.none;
    params.setMemCacheSizePercent(memoryCacheSize); // Set memory cache to % of app memory
    params.diskCacheEnabled = mode === CacheMode.diskAndMemory;
    params.diskCacheSize = diskCacheSize;
    imageCache = org.nativescript.widgets.image.Cache.getInstance(params);
    imageFetcher.addImageCache(imageCache);
    imageFetcher.initCache();
}

interface ImageLoadedListener {
    new (owner: Image): org.nativescript.widgets.image.Worker.OnImageLoadedListener;
}

let ImageLoadedListener: ImageLoadedListener;
function initializeImageLoadedListener() {
    if (ImageLoadedListener) {
        return;
    }

    @Interfaces([org.nativescript.widgets.image.Worker.OnImageLoadedListener])
    class ImageLoadedListenerImpl extends java.lang.Object implements org.nativescript.widgets.image.Worker.OnImageLoadedListener {
        constructor(public owner: Image) {
            super();
            return global.__native(this);
        }

        onImageLoaded(success: boolean): void {
            const owner = this.owner;
            if (owner) {
                owner.isLoading = false;
            }
        }
    }

    ImageLoadedListener = ImageLoadedListenerImpl;
}

export class Image extends ImageBase {
    nativeView: org.nativescript.widgets.ImageView;

    public decodeWidth = 0;
    public decodeHeight = 0;
    public useCache = true;

    public _createNativeView() {
        initializeImageLoadedListener();
        if (!imageFetcher) {
            initImageCache(this._context);
        }

        const imageView = new org.nativescript.widgets.ImageView(this._context);
        const listener = new ImageLoadedListener(this);
        imageView.setImageLoadedListener(listener);
        (<any>imageView).listener = listener;

        return imageView;
    }

    public _initNativeView(): void {
        (<any>this.nativeView).listener.owner = this;
    }

    public _disposeNativeView() {
        (<any>this.nativeView).listener.owner = null;
    }

    public _createImageSourceFromSrc() {
        let imageView = this.nativeView;
        this.imageSource = <any>unsetValue;

        if (!imageView || !this.src) {
            return;
        }

        let value = this.src;
        let async = this.loadMode === ASYNC;

        if (typeof value === "string") {
            value = value.trim();
            this.isLoading = true;

            if (isDataURI(value)) {
                // TODO: Check with runtime what should we do in case of base64 string.
                super._createImageSourceFromSrc();
            }
            else if (isFileOrResourcePath(value)) {
                if (value.indexOf(RESOURCE_PREFIX) === 0) {
                    imageView.setUri(value, this.decodeWidth, this.decodeHeight, this.useCache, async);
                }
                else {
                    let fileName = value;
                    if (fileName.indexOf("~/") === 0) {
                        fileName = path.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
                    }

                    imageView.setUri(FILE_PREFIX + fileName, this.decodeWidth, this.decodeHeight, this.useCache, async);
                }
            }
            else {
                // For backwards compatibility http always use async loading.
                imageView.setUri(value, this.decodeWidth, this.decodeHeight, this.useCache, true);
            }
        } else {
            super._createImageSourceFromSrc();
        }
    }

    [stretchProperty.getDefault](): "aspectFit" {
        return "aspectFit";
    }
    [stretchProperty.setNative](value: "none" | "aspectFill" | "aspectFit" | "fill") {
        switch (value) {
            case "aspectFit":
                this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
                break;
            case "aspectFill":
                this.nativeView.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
                break;
            case "fill":
                this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
                break;
            case "none":
            default:
                this.nativeView.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
                break;
        }
    }

    [tintColorProperty.getDefault](): Color {
        return undefined;
    }
    [tintColorProperty.setNative](value: Color) {
        if (value === undefined) {
            this.nativeView.clearColorFilter();
        } else {
            this.nativeView.setColorFilter(value.android);
        }
    }

    [imageSourceProperty.getDefault](): ImageSource {
        return undefined;
    }
    [imageSourceProperty.setNative](value: ImageSource) {
        const nativeView = this.nativeView;
        if (value && value.android) {
            const rotation = value.rotationAngle ? value.rotationAngle : 0;
            nativeView.setRotationAngle(rotation);
            nativeView.setImageBitmap(value.android);
        } else {
            nativeView.setRotationAngle(0);
            nativeView.setImageBitmap(null);
        }
    }

    [srcProperty.getDefault](): any {
        return undefined;
    }
    [srcProperty.setNative](value: any) {
        this._createImageSourceFromSrc();
    }
}
