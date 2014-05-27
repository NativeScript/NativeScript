
import promises = require("promises");
import imageSource = require("image-source");
import types = require("camera/camera-types");
import appModule = require("application");
import fs = require("file-system");

// merge the exports of the types module with the exports of this file
import merger = require("utils/module-merge");
declare var exports;
merger.merge(types, exports);

var REQUEST_IMAGE_CAPTURE: number = 2332;
var REQUEST_SELECT_PICTURE: number = 2;

export class CameraManager {
    public takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
        var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
        var androidApp = appModule.android;

        if (takePictureIntent.resolveActivity(androidApp.context.getPackageManager()) !== null) {
            androidApp.currentActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
        }
    }

    // options { useSavedPhotos: true }
    public pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
        var readPictureIntent = new android.content.Intent();
        var androidApp = appModule.android;

        readPictureIntent.setType('image/*');
        readPictureIntent.setAction(android.content.Intent.ACTION_GET_CONTENT);

        androidApp.currentActivity.startActivityForResult(android.content.Intent.createChooser(readPictureIntent, 'Select Picture'),
            REQUEST_SELECT_PICTURE);
    }
}

function getTempFile()
{
    var timeStamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
    var imageFileName = "JPEG_" + timeStamp + "_";
    // FIXME add pictures to knownFolders of file-system?
    var documents = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_PICTURES); 
    var imagePath = java.io.File.createTempFile(imageFileName, ".jpg", documents);
    imagePath.deleteOnExit();
//    console.log("image path: " + imagePath);
    return imagePath;
}

export var takePicture = function (options?: types.Options): promises.Promise<imageSource.ImageSource> {
    var d = promises.defer<imageSource.ImageSource>();

    var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
    var androidApp = appModule.android;
    var imageFile;

    if (takePictureIntent.resolveActivity(androidApp.context.getPackageManager()) !== null) {
        var broadcastReceiver;
        var localBroadcast;
        var CameraBroadcastReceiver = (<any>android.content.BroadcastReceiver).extends({
            onReceive: function (context: android.content.Context, intent: android.content.Intent) {
//                console.log("onReceive - file is: " + imageFile);
                localBroadcast.unregisterReceiver(broadcastReceiver);
                var requestCode = intent.getIntExtra("_requestCode", -1);
                var requestResult = intent.getIntExtra("_resultCode", -1);
//                console.log("requestCode: " + requestCode + ", requestResult: " + requestResult);
                if (requestCode === REQUEST_IMAGE_CAPTURE) {
                    if (requestResult == android.app.Activity.RESULT_OK) {
                        var image = imageSource.fromFile(imageFile.getAbsolutePath());
                        if (image && image.android) {
                            d.resolve(image);
                        }
                        else {
                            d.reject(new Error("invalid image at: " + imageFile));
                        }
                    }
                    else {
                        d.reject(new Error("user cancel"));
                    }
                }
                if (imageFile) {
                    imageFile.delete();
                }
            }
        });
        var broadcastReceiver = new CameraBroadcastReceiver();
        var localBroadcast = (<any>android).support.v4.content.LocalBroadcastManager.getInstance(androidApp.currentActivity);
        localBroadcast.registerReceiver(broadcastReceiver, new android.content.IntentFilter("inline-data"));
        imageFile = getTempFile();
        takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, android.net.Uri.fromFile(imageFile));

        // warning this code might not work on all devices
        if (options && options.cameraPosition && (types.CameraPosition.FRONT === options.cameraPosition)) {
            takePictureIntent.putExtra("android.intent.extras.CAMERA_FACING", 1);
        }

        androidApp.currentActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    }

    return d.promise();
}
