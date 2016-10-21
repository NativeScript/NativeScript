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

    private scaleImage(image: UIImage, requestedSize: {width: number, height: number}): UIImage {
        UIGraphicsBeginImageContextWithOptions(requestedSize, false, 0.0);
        image.drawInRect(CGRectMake(0, 0, requestedSize.width, requestedSize.height));
        let resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        return resultImage;
    }
}