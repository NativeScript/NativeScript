import * as typesModule from "utils/types";
import * as utilsModule from "utils/utils";

import * as applicationModule from "application";
import * as imageSourceModule from "image-source";

import * as platform from "platform";

import {Camera as Common} from "./camera-common";

var REQUEST_IMAGE_CAPTURE = 3453;

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
};

var createDateTimeStamp = function () {
    let date = new Date();

    return (date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString()) +
        ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()) +
        date.getFullYear().toString() +
        date.getHours().toString() +
        date.getMinutes().toString() +
        date.getSeconds().toString();
};

class Camera extends Common {
    static takePicture(options?): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let saveToGallery;
                let reqWidth;
                let reqHeight;
                let shouldKeepAspectRatio;

                let density = utilsModule.layout.getDisplayDensity();

                if (options) {
                    saveToGallery = options.saveToGallery ? true : false;
                    reqWidth = options.width ? options.width * density : 0;
                    reqHeight = options.height ? options.height * density : reqWidth;
                    shouldKeepAspectRatio = typesModule.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
                }

                let dateStamp = createDateTimeStamp(),
                    media: string,
                    nativeFile,
                    tempMediaUri,
                    takeMediaIntent;

                options.mode = Camera.getMode(options.mode);

                switch (options.source) {
                    case Camera.sources.device:
                        switch (options.mode) {
                            case Camera.modes.photo:
                                takeMediaIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);

                                if (saveToGallery) {
                                    media = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_PICTURES).getAbsolutePath() + "/" + "cameraPicture_" + dateStamp + ".jpg";
                                } else {
                                    media = utilsModule.ad.getApplicationContext().getExternalFilesDir(null).getAbsolutePath() + "/" + "cameraPicture_" + dateStamp + ".jpg";
                                }

                                break;
                            case Camera.modes.video:
                                takeMediaIntent = new android.content.Intent(android.provider.MediaStore.ACTION_VIDEO_CAPTURE);

                                if (saveToGallery) {
                                    media = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_MOVIES).getAbsolutePath() + "/" + "cameraVideo_" + dateStamp + ".3gp";
                                } else {
                                    media = utilsModule.ad.getApplicationContext().getExternalFilesDir(null).getAbsolutePath() + "/" + "cameraVideo_" + dateStamp + ".3gp";
                                }

                                break;
                            default:
                                return;
                        }

                        break;
                    case Camera.sources.library:
                        switch (options.mode) {
                            case Camera.modes.photo:
                                takeMediaIntent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                                break;
                            case Camera.modes.video:
                                takeMediaIntent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI);
                                break;
                            default:
                                return;
                        }

                        break;
                    default:
                        return;
                }

                nativeFile = new java.io.File(media);
                tempMediaUri = android.net.Uri.fromFile(nativeFile);
                takeMediaIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempMediaUri);

                if (takeMediaIntent.resolveActivity(utilsModule.ad.getApplicationContext().getPackageManager()) != null) {
                    let previousResult = applicationModule.android.onActivityResult;

                    applicationModule.android.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
                        applicationModule.android.onActivityResult = previousResult;

                        if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                            switch (options.mode) {
                                case Camera.modes.photo:
                                    let bitmap_options = new android.graphics.BitmapFactory.Options();
                                    bitmap_options.inJustDecodeBounds = true;

                                    let bitmap = android.graphics.BitmapFactory.decodeFile(media, bitmap_options);
                                    let sampleSize = calculateInSampleSize(bitmap_options.outWidth, bitmap_options.outHeight, reqWidth, reqHeight);

                                    let finalBitmapOptions = new android.graphics.BitmapFactory.Options();
                                    finalBitmapOptions.inSampleSize = sampleSize;
                                    bitmap = android.graphics.BitmapFactory.decodeFile(media, finalBitmapOptions);

                                    let scaledSizeImage = null;

                                    if (reqHeight > 0 && reqWidth > 0) {
                                        if (shouldKeepAspectRatio) {
                                            let aspectSafeSize = Common.getAspectSafeDimensions(bitmap.getWidth(), bitmap.getHeight(), reqWidth, reqHeight);
                                            scaledSizeImage = android.graphics.Bitmap.createScaledBitmap(bitmap, aspectSafeSize.width, aspectSafeSize.height, true);
                                        }
                                        else {
                                            scaledSizeImage = android.graphics.Bitmap.createScaledBitmap(bitmap, reqWidth, reqHeight, true);
                                        }
                                    } else {
                                        scaledSizeImage = bitmap;
                                    }

                                    resolve(imageSourceModule.fromNativeSource(scaledSizeImage));
                                    break;
								case Camera.modes.video:
									// TODO: handle video
									break;
                            }
                        }
                    };

                    applicationModule.android.foregroundActivity.startActivityForResult(takeMediaIntent, REQUEST_IMAGE_CAPTURE);
                }
            } catch (e) {
                if (reject) {
                    reject(e);
                }
            }
        });
    }

    static isAvailable() {
        return utilsModule.ad.getApplicationContext().getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA)
    }
}

module.exports = Camera;