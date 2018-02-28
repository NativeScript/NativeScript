import * as definition from ".";
import * as observable from "../data/observable";
import * as platform from "../platform";

export class ImageAsset  extends observable.Observable implements definition.ImageAsset {
    private _options: definition.ImageAssetOptions;
    private _nativeImage: any;

    ios: PHAsset;
    android: string;

    get options(): definition.ImageAssetOptions {
        return this._options;
    }

    set options(value: definition.ImageAssetOptions) {
        this._options = value;
    }

    get nativeImage(): any {
        return this._nativeImage;
    }

    set nativeImage(value: any) {
        this._nativeImage = value;
    }

    public getImageAsync(callback: (image: any, error: Error) => void) {
        //
    }
}

export function getAspectSafeDimensions(sourceWidth, sourceHeight, reqWidth, reqHeight) {
    let widthCoef = sourceWidth / reqWidth;
    let heightCoef = sourceHeight / reqHeight;

    let aspectCoef = widthCoef > heightCoef ? widthCoef : heightCoef;

    return {
        width: Math.floor(sourceWidth / aspectCoef),
        height: Math.floor(sourceHeight / aspectCoef)
    };
}

export function getRequestedImageSize(src: { width: number, height: number }, options: definition.ImageAssetOptions): { width: number, height: number } {
    var screen = platform.screen.mainScreen;

    var reqWidth = options.width || Math.min(src.width, screen.widthPixels);
    var reqHeight = options.height || Math.min(src.height, screen.heightPixels);

    if (options && options.keepAspectRatio) {
        let safeAspectSize = getAspectSafeDimensions(src.width, src.height, reqWidth, reqHeight);
        reqWidth = safeAspectSize.width;
        reqHeight = safeAspectSize.height;
    }
    return {
        width: reqWidth,
        height: reqHeight
    };
}
