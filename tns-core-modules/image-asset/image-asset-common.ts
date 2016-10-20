import definition = require("image-asset");
import platform = require("platform");

export class ImageAsset implements definition.ImageAsset {
    private _options: definition.ImageAssetOptions;
    private _ios: PHAsset;
    private _nativeImage: any;
    private _android: string; //file name of the image

    get options(): definition.ImageAssetOptions {
        return this._options;
    }

    set options(value: definition.ImageAssetOptions) {
        this._options = value;
    }

    get ios(): PHAsset {
        return this._ios;
    }

    set ios(value: PHAsset) {
        this._ios = value;
    }

    get android(): string {
        return this._android;
    }

    set android(value: string) {
        this._android = value;
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
    let reqWidth = platform.screen.mainScreen.widthDIPs;
    let reqHeight = platform.screen.mainScreen.heightDIPs;
    if (options && options.width) {
        reqWidth = (options.width > 0 && options.width < reqWidth) ? options.width : reqWidth;
    }
    if (options && options.height) {
        reqHeight = (options.height > 0 && options.height < reqHeight) ? options.height : reqHeight;
    }

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