import imageSource = require("image-source");
import appModule = require("application");
import fileSystem = require("file-system");

var REQUEST_IMAGE_CAPTURE = 3453;

export var takePicture = function (width?, height?): Promise<imageSource.ImageSource> {
    return new Promise<imageSource.ImageSource>((resolve, reject) => {
        try {
            var reqWidth = width || 0;
            var reqHeight = height || reqWidth;
            var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            var dateStamp = createDateTimeStamp();
            var tempPicturePath = fileSystem.path.join(appModule.android.currentContext.getExternalFilesDir(null).getAbsolutePath(), "cameraPicture_" + dateStamp + ".jpg");
            var nativeFile = new java.io.File(tempPicturePath);
            var tempPictureUri = android.net.Uri.fromFile(nativeFile);
            takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);
            if (takePictureIntent.resolveActivity(appModule.android.context.getPackageManager()) != null) {

                var previousResult = appModule.android.onActivityResult;
                appModule.android.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
                    appModule.android.onActivityResult = previousResult;

                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                        var options = new android.graphics.BitmapFactory.Options();
                        options.inJustDecodeBounds = true;
                        android.graphics.BitmapFactory.decodeFile(tempPicturePath, options);

                        var sampleSize = calculateInSampleSize(options.outWidth, options.outHeight, reqWidth, reqHeight);

                        var finalBitmapOptions = new android.graphics.BitmapFactory.Options();
                        finalBitmapOptions.inSampleSize = sampleSize;
                        var bitmap = android.graphics.BitmapFactory.decodeFile(tempPicturePath, finalBitmapOptions);
                        resolve(imageSource.fromNativeSource(bitmap));
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
        while((halfWidth / sampleSize) > reqWidth && (halfHeight / sampleSize) > reqHeight) {
            sampleSize *= 2;
        }
    }
    return sampleSize;
}

var createDateTimeStamp = function() {
    var result = "";
    var date = new Date();
    result = date.getDate().toString() + 
             (date.getMonth() + 1).toString() + 
             date.getFullYear().toString() + 
             date.getHours().toString() + 
             date.getMinutes().toString() + 
             date.getSeconds().toString();
    return result;
}