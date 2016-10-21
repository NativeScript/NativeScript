import * as platform from "platform";
import common = require("./image-asset-common");

global.moduleMerge(common, exports);

export class ImageAsset extends common.ImageAsset {
    constructor(asset: string) {
        super();
        this.android = asset;
    }

    public getImageAsync(callback: (image, error) => void) {
        let bitmapOptions = new android.graphics.BitmapFactory.Options();
        bitmapOptions.inJustDecodeBounds = true;
        let bitmap = android.graphics.BitmapFactory.decodeFile(this.android, bitmapOptions);
        let sourceSize = {
            width: bitmapOptions.outWidth,
            height: bitmapOptions.outHeight
        };
        let requestedSize = common.getRequestedImageSize(sourceSize, this.options);

        let sampleSize = calculateInSampleSize(bitmapOptions.outWidth, bitmapOptions.outHeight, requestedSize.width, requestedSize.height);

        let finalBitmapOptions = new android.graphics.BitmapFactory.Options();
        finalBitmapOptions.inSampleSize = sampleSize;
        try {
            bitmap = android.graphics.BitmapFactory.decodeFile(this.android, finalBitmapOptions);
            callback(bitmap, null);
        }
        catch (ex) {
            callback(null, ex);
        }
    }
}

var calculateInSampleSize = function (imageWidth, imageHeight, reqWidth, reqHeight) {
    let sampleSize = 1;
    let displayWidth = platform.screen.mainScreen.widthDIPs;
    let displayHeigth = platform.screen.mainScreen.heightDIPs;
    reqWidth = (reqWidth > 0 && reqWidth < displayWidth) ? reqWidth : displayWidth;
    reqHeight = (reqHeight > 0 && reqHeight < displayHeigth) ? reqHeight : displayHeigth;
    if (imageWidth > reqWidth && imageHeight > reqHeight) {
        let halfWidth = imageWidth / 2;
        let halfHeight = imageHeight / 2;
        while ((halfWidth / sampleSize) > reqWidth && (halfHeight / sampleSize) > reqHeight) {
            sampleSize *= 2;
        }
    }
    return sampleSize;
}