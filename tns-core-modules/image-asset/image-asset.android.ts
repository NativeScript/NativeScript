import * as platform from "../platform";
import * as common from "./image-asset-common";
import { path as fsPath, knownFolders } from "../file-system";

global.moduleMerge(common, exports);

export class ImageAsset extends common.ImageAsset {
    private _android: string; //file name of the image

    constructor(asset: string) {
        super();
        let fileName = typeof asset === "string" ? asset.trim() : "";
        if (fileName.indexOf("~/") === 0) {
            fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
        }
        this.android = fileName;
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

        let sampleSize = org.nativescript.widgets.image.Fetcher.calculateInSampleSize(bitmapOptions.outWidth, bitmapOptions.outHeight, requestedSize.width, requestedSize.height);

        let finalBitmapOptions = new android.graphics.BitmapFactory.Options();
        finalBitmapOptions.inSampleSize = sampleSize;
        try {
            let error = null;
            // read as minimum bitmap as possible (slightly bigger than the requested size)
            bitmap = android.graphics.BitmapFactory.decodeFile(this.android, finalBitmapOptions);
            
            if (bitmap) {
                if (requestedSize.width !== bitmap.getWidth() || requestedSize.height !== bitmap.getHeight()) {
                    // scale to exact size
                    bitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, requestedSize.width, requestedSize.height, true);
                }

                const rotationAngle = calculateAngleFromFile(this.android);
                if (rotationAngle !== 0) {
                    const matrix = new android.graphics.Matrix();
                    matrix.postRotate(rotationAngle);
                    bitmap = android.graphics.Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
                }
            }

            if (!bitmap) {
                error = "Asset '" + this.android + "' cannot be found.";
            }

            callback(bitmap, error);
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

    var totalPixels = (imageWidth / sampleSize) * (imageHeight / sampleSize);

    // Anything more than 2x the requested pixels we'll sample down further
    var totalReqPixelsCap = reqWidth * reqHeight * 2;

    while (totalPixels > totalReqPixelsCap) {
        sampleSize *= 2;
        totalPixels = (imageWidth / sampleSize) * (imageHeight / sampleSize);
    }

    return sampleSize;
}
