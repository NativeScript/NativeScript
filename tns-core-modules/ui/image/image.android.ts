import {
    ImageSource, ImageBase, stretchProperty, imageSourceProperty, tintColorProperty, unsetValue, Color,
    isDataURI, isFileOrResourcePath, RESOURCE_PREFIX
} from "./image-common";
import { path, knownFolders } from "file-system";

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

export class Image extends ImageBase {
    private _android: org.nativescript.widgets.ImageView;
    private _imageLoadedListener: org.nativescript.widgets.image.Worker.OnImageLoadedListener;

    public decodeWidth = 0;
    public decodeHeight = 0;
    public useCache = true;

    get android(): org.nativescript.widgets.ImageView {
        return this._android;
    }

    public _createUI() {
        if (!imageFetcher) {
            initImageCache(this._context);
        }

        this._android = new org.nativescript.widgets.ImageView(this._context);
        this._createImageSourceFromSrc();
    }

    public _setNativeImage(nativeImage: any) {
        if (!nativeImage) {
            return;
        }
        
        let rotation = nativeImage.rotationAngle ? nativeImage.rotationAngle : 0;
        this.android.setRotationAngle(rotation);
        this.android.setImageBitmap(nativeImage.android);
    }

    public _createImageSourceFromSrc() {
        let imageView = this._android;
        if (!imageView || !this.src) {
            return;
        }

        let value = this.src;
        let async = this.loadMode === ASYNC;
        let owner = new WeakRef<Image>(this);
        this._imageLoadedListener = this._imageLoadedListener || new ImageLoadedListener(new WeakRef(this));
        
        this.imageSource = unsetValue;
        if (typeof value === "string") {
            value = value.trim();
            this.isLoading = true;

            if (isDataURI(value)) {
                // TODO: Check with runtime what should we do in case of base64 string.
                super._createImageSourceFromSrc();
            }
            else if (imageSource.isFileOrResourcePath(value)) {
                if (value.indexOf(utils.RESOURCE_PREFIX) === 0) {
                    imageView.setUri(value, this.decodeWidth, this.decodeHeight, this.useCache, async, this._imageLoadedListener);
                }
                else {
                    let fileName = value;
                    if (fileName.indexOf("~/") === 0) {
                        fileName = path.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
                    }

                    imageView.setUri(FILE_PREFIX + fileName, this.decodeWidth, this.decodeHeight, this.useCache, async, this._imageLoadedListener);
                }
            }
            else {
                // For backwards compatibility http always use async loading.
                imageView.setUri(value, this.decodeWidth, this.decodeHeight, this.useCache, true, this._imageLoadedListener);
            }
        } else {
            super._createImageSourceFromSrc();
        }
    }

    get [stretchProperty.native](): "aspectFit" {
        return "aspectFit";
    }
    set [stretchProperty.native](value: "none" | "aspectFill" | "aspectFit" | "fill") {
        switch (value) {
            case "aspectFit":
                this.android.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
                break;
            case "aspectFill":
                this.android.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
                break;
            case "fill":
                this.android.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
                break;
            case "none":
            default:
                this.android.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
                break;
        }
    }

    get [tintColorProperty.native](): Color {
        return undefined;
    }
    set [tintColorProperty.native](value: Color) {
        if (value === undefined) {
            this._android.clearColorFilter();
        } else {
            this._android.setColorFilter(value.android);
        }
    }

    get [imageSourceProperty.native](): ImageSource {
        return undefined;
    }
    set [imageSourceProperty.native](value: ImageSource) {
        this._setNativeImage(value ? value.android : null);
    }
}

@Interfaces([org.nativescript.widgets.image.Worker.OnImageLoadedListener])
class ImageLoadedListener implements org.nativescript.widgets.image.Worker.OnImageLoadedListener {
    constructor(private owner: WeakRef<Image>) {
        return global.__native(this);
    }

    onImageLoaded(success: boolean): void {
        let owner = this.owner.get();
        if (owner) {
            owner.isLoading = false;
        }
    }
}
