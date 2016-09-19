import common = require("./image-asset-common");

global.moduleMerge(common, exports);

export class ImageAsset extends common.ImageAsset {
    constructor(asset: PHAsset | UIImage) {
        super();
        if (asset instanceof UIImage) {
            this.nativeImage = asset
        }
        else {
            this.ios = asset;
        }
    }

    public getImageAsync(callback: (image, error) => void) {
        let requestedSize = common.getRequestedImageSize({
            width: this.ios.pixelWidth,
            height: this.ios.pixelHeight
        });

        let imageRequestOptions = PHImageRequestOptions.alloc().init();
        imageRequestOptions.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;

        if (this.nativeImage) {
            callback(this.nativeImage, null);
            return;
        }
        
        PHImageManager.defaultManager().requestImageForAssetTargetSizeContentModeOptionsResultHandler(this.ios, requestedSize, PHImageContentMode.AspectFit, imageRequestOptions,
            (image, imageResultInfo) => {
                if (image) {
                    callback(image, null);
                }
                else {
                    callback(null, imageResultInfo.valueForKey(PHImageErrorKey));
                }
            }
        );
    }
}