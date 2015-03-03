import imageSource = require("image-source");
import appModule = require("application");

var REQUEST_IMAGE_CAPTURE = 3453;

export var takePicture = function (): Promise<imageSource.ImageSource> {
    return new Promise<imageSource.ImageSource>((resolve, reject) => {
        try {
            var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            if (takePictureIntent.resolveActivity(appModule.android.context.getPackageManager()) != null) {

                var previousResult = appModule.android.onActivityResult;
                appModule.android.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
                    appModule.android.onActivityResult = previousResult;

                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                        resolve(imageSource.fromNativeSource(data.getExtras().get("data")))
                }
                };

                appModule.android.foregroundActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);

            }
        } catch (e) {
            reject(e);
        }
    });
}