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
            width: this.nativeImage ? this.nativeImage.size.width : this.ios.pixelWidth,
            height: this.nativeImage ? this.nativeImage.size.height : this.ios.pixelHeight
        });

        if (this.nativeImage) {
            let newSize = CGSizeMake(requestedSize.width, requestedSize.height);
            UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0);
            this.nativeImage.drawInRect(CGRectMake(0, 0, newSize.width, newSize.height));
            let resizedImage = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
            callback(resizedImage, null);
            return;
        }

        let imageRequestOptions = PHImageRequestOptions.alloc().init();
        imageRequestOptions.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;
        
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