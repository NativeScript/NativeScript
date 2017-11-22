import * as platform from "../platform";
import * as common from "./image-asset-common";

global.moduleMerge(common, exports);

export class ImageAsset extends common.ImageAsset {
    private _android: string; //file name of the image

    constructor(asset: string) {
        super();
        this.android = asset;
    }

    get android(): string {
        return this._android;
    }

    set android(value: string) {
        this._android = value;
    }

    public getImageAsync(callback: (image, error) => void) {
        let bitmapOptions = new android.graphics.BitmapFactory.Options();
        bitmapOptions.inJustDecodeBounds = true;
        // read only the file size
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
            // read as minimum bitmap as possible (slightly bigger than the requested size)
            bitmap = android.graphics.BitmapFactory.decodeFile(this.android, finalBitmapOptions);

            // scale to exact size
            const scaledBitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, requestedSize.width, requestedSize.height, true);
            bitmap.recycle();

            const rotationAngle = calculateAngleFromFile(this.android);
            const matrix = new android.graphics.Matrix();
            matrix.postRotate(rotationAngle);
            const rotatedBitmap = android.graphics.Bitmap.createBitmap(scaledBitmap, 0, 0, scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix, true);
            scaledBitmap.recycle();

            callback(rotatedBitmap, null);
        }
        catch (ex) {
            callback(null, ex);
        }
    }
}

var calculateAngleFromFile = function (filename: string) {
    let rotationAngle = 0;
    const ei = new android.media.ExifInterface(filename);
    const orientation = ei.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_NORMAL);

    switch (orientation) {
        case android.media.ExifInterface.ORIENTATION_ROTATE_90:
            rotationAngle = 90;
            break;
        case android.media.ExifInterface.ORIENTATION_ROTATE_180:
            rotationAngle = 180;
            break;
        case android.media.ExifInterface.ORIENTATION_ROTATE_270:
            rotationAngle = 270;
            break;
    }

    return rotationAngle;
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
