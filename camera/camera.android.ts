import * as typesModule from "utils/types";
import * as utilsModule from "utils/utils";
import * as fileSystemModule from "file-system";
import * as applicationModule from "application";
import * as imageSourceModule from "image-source";
import * as cameraCommonModule from "./camera-common";

var REQUEST_IMAGE_CAPTURE = 3453;

export var takePicture = function (options?): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            var types: typeof typesModule = require("utils/types");
            var utils: typeof utilsModule = require("utils/utils");

            var density = utils.layout.getDisplayDensity();
            if (options) {
                var saveToGallery = options.saveToGallery ? true : false;
                var reqWidth = options.width ? options.width * density : 0;
                var reqHeight = options.height ? options.height * density : reqWidth;
                var shouldKeepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
            }
            var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            var dateStamp = createDateTimeStamp();

            if (saveToGallery) {
                var picturePath = android.os.Environment.getExternalStoragePublicDirectory(
                    android.os.Environment.DIRECTORY_PICTURES).getAbsolutePath() + "/" + "cameraPicture_" + dateStamp + ".jpg";
                var nativeFile = new java.io.File(picturePath);
                var tempPictureUri = android.net.Uri.fromFile(nativeFile);
                takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);
            } else {
                var picturePath = utils.ad.getApplicationContext().getExternalFilesDir(null).getAbsolutePath() + "/" + "cameraPicture_" + dateStamp + ".jpg";
                var nativeFile = new java.io.File(picturePath);
                var tempPictureUri = android.net.Uri.fromFile(nativeFile);
                takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);
            }

            if (takePictureIntent.resolveActivity(utils.ad.getApplicationContext().getPackageManager()) != null) {

                var appModule: typeof applicationModule = require("application");

                var previousResult = appModule.android.onActivityResult;
                appModule.android.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
                    appModule.android.onActivityResult = previousResult;

                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {

                        if (saveToGallery) {
                            resolve(picturePath);
                        } else {
                            var options = new android.graphics.BitmapFactory.Options();
                            options.inJustDecodeBounds = true;
                            android.graphics.BitmapFactory.decodeFile(picturePath, options);

                            var sampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

                            var finalBitmapOptions = new android.graphics.BitmapFactory.Options();
                            finalBitmapOptions.inSampleSize = sampleSize;
                            var bitmap = android.graphics.BitmapFactory.decodeFile(picturePath, finalBitmapOptions);
                            var scaledSizeImage = null;
                            if (reqHeight > 0 && reqWidth > 0) {
                                if (shouldKeepAspectRatio) {

                                    var common: typeof cameraCommonModule = require("./camera-common");

                                    var aspectSafeSize = common.getAspectSafeDimensions(bitmap.getWidth(), bitmap.getHeight(), reqWidth, reqHeight);
                                    scaledSizeImage = android.graphics.Bitmap.createScaledBitmap(bitmap, aspectSafeSize.width, aspectSafeSize.height, true);
                                }
                                else {
                                    scaledSizeImage = android.graphics.Bitmap.createScaledBitmap(bitmap, reqWidth, reqHeight, true);
                                }
                            }
                            else {
                                scaledSizeImage = bitmap;
                            }

                            var ei = new android.media.ExifInterface(picturePath);
                            var orientation = ei.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_NORMAL);

                            switch (orientation) {
                                case android.media.ExifInterface.ORIENTATION_ROTATE_90:
                                    scaledSizeImage = rotateBitmap(scaledSizeImage, 90);
                                    break;
                                case android.media.ExifInterface.ORIENTATION_ROTATE_180:
                                    scaledSizeImage = rotateBitmap(scaledSizeImage, 180);
                                    break;
                                case android.media.ExifInterface.ORIENTATION_ROTATE_270:
                                    scaledSizeImage = rotateBitmap(scaledSizeImage, 270);
                                    break;
                            }

                            var imageSource: typeof imageSourceModule = require("image-source");
                            resolve(imageSource.fromNativeSource(scaledSizeImage), picturePath);

                        }
                    }
                };

                appModule.android.foregroundActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);

            }
        } catch (e) {
            if (reject) {
                reject(e);
            }
        }
    });
}

var calculateInSampleSize = function (imageWidth, imageHeight, reqWidth, reqHeight) {
    var sampleSize = 1;
    if (imageWidth > reqWidth && imageHeight > reqHeight) {
        var halfWidth = imageWidth / 2;
        var halfHeight = imageHeight / 2;
        while ((halfWidth / sampleSize) > reqWidth && (halfHeight / sampleSize) > reqHeight) {
            sampleSize *= 2;
        }
    }
    return sampleSize;
}

var createDateTimeStamp = function () {
    var result = "";
    var date = new Date();
    result = (date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString()) +
        ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()) +
        date.getFullYear().toString() +
        date.getHours().toString() +
        date.getMinutes().toString() +
        date.getSeconds().toString();
    return result;
}

var rotateBitmap = function (source, angle) {
    var matrix = new android.graphics.Matrix();
    matrix.postRotate(angle);
    return android.graphics.Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(), matrix, true);
}
