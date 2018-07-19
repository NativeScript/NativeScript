import * as common from "./image-asset-common";
import { path as fsPath, knownFolders } from "../file-system";

global.moduleMerge(common, exports);

export class ImageAsset extends common.ImageAsset {
    private _ios: PHAsset;

    constructor(asset: string | PHAsset | UIImage) {
        super();
        if (typeof asset === "string") {
            if (asset.indexOf("~/") === 0) {
                asset = fsPath.join(knownFolders.currentApp().path, asset.replace("~/", ""));
            }

            this.nativeImage = UIImage.imageWithContentsOfFile(asset);
        }
        else if (asset instanceof UIImage) {
            this.nativeImage = asset
        }
        else {
            this.ios = asset;
        }
    }

    get ios(): PHAsset {
        return this._ios;
    }

    set ios(value: PHAsset) {
        this._ios = value;
    }

    public getImageAsync(callback: (image, error) => void) {
        if (!this.ios && !this.nativeImage) {
            callback(null, "Asset cannot be found.");
        }

        let srcWidth = this.nativeImage ? this.nativeImage.size.width : this.ios.pixelWidth;
        let srcHeight = this.nativeImage ? this.nativeImage.size.height : this.ios.pixelHeight;
        let requestedSize = common.getRequestedImageSize({ width: srcWidth, height: srcHeight }, this.options);

        if (this.nativeImage) {
            let newSize = CGSizeMake(requestedSize.width, requestedSize.height);
            let resizedImage = this.scaleImage(this.nativeImage, newSize);
            callback(resizedImage, null);
            return;
        }

        let imageRequestOptions = PHImageRequestOptions.alloc().init();
        imageRequestOptions.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;
        imageRequestOptions.networkAccessAllowed = true;

        PHImageManager.defaultManager().requestImageForAssetTargetSizeContentModeOptionsResultHandler(this.ios, requestedSize, PHImageContentMode.AspectFit, imageRequestOptions,
            (image, imageResultInfo) => {
                if (image) {
                    let resultImage = this.scaleImage(image, requestedSize);
                    callback(resultImage, null);
                }
                else {
                    callback(null, imageResultInfo.valueForKey(PHImageErrorKey));
                }
            }
        );
    }

    public saveToFile(fileName: string, callback: (imagePath: string, error: any) => void) {
        if (!this.ios && !this.nativeImage) {
            callback(null, "Asset cannot be found.");
        }

        const tempFolderPath = knownFolders.temp().path;
        const tempFilePath = fsPath.join(tempFolderPath, fileName);
        const options = PHImageRequestOptions.new();

        options.synchronous = true;
        options.version = PHImageRequestOptionsVersion.Current;
        options.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;

        PHImageManager.defaultManager().requestImageDataForAssetOptionsResultHandler(this.ios, options,
            (...args) => {
                const nsData = args[0];
                const UTIType = args[1];
                const imageResultInfo = args[3];

                if (nsData) {
                    const imageExtension = this.getImageExtension(UTIType);
                    nsData.writeToFileAtomically(tempFilePath + imageExtension, true);
                    callback(tempFilePath, null);
                }
                else {
                    callback(null, imageResultInfo.valueForKey(PHImageErrorKey));
                }
            });
    }

    private getImageExtension(UTIType: string): string {
        switch (UTIType) {
            case kUTTypeJPEG:
                return ".jpg";
            case kUTTypePNG:
                return ".png";
            case kUTTypeTIFF:
                return ".tiff";
            case kUTTypeGIF:
                return ".gif";
            case kUTTypeBMP:
                return ".bmp";
            case kUTTypeICO:
                return ".ico";
            default:
                return ".jpg";
        }
    }

    private scaleImage(image: UIImage, requestedSize: { width: number, height: number }): UIImage {
        UIGraphicsBeginImageContextWithOptions(requestedSize, false, 0.0);
        image.drawInRect(CGRectMake(0, 0, requestedSize.width, requestedSize.height));
        let resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        return resultImage;
    }
}
