import promises = require("promises");
import imageSource = require("image-source");
import types = require("camera/camera-types");

// merge the exports of the types module with the exports of this file
import merger = require("utils/module-merge");
declare var exports;
merger.merge(types, exports);

var imagePickerController;

export class CameraManager {
    public takePicture(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
    }

    // options { useSavedPhotos: true }
    public pictureFromLibrary(params: any, onSuccess: (imageData: any) => any, onError?: (error: any) => any) {
    }
}

function topViewController():UIKit.UIViewController {
    return topViewControllerWithRootViewController(UIKit.UIApplication.sharedApplication().keyWindow.rootViewController);
}

function topViewControllerWithRootViewController(rootViewController: any) {
    if (rootViewController.isKindOfClass(UIKit.UITabBarController.class())) {
//        console.log("Using tab view controller");
        return topViewControllerWithRootViewController(<UIKit.UITabBarController>rootViewController.selectedViewController);
    } else if (rootViewController.isKindOfClass(UIKit.UINavigationController.class())) {
//        console.log("Using navigation view controller");
        return topViewControllerWithRootViewController(<UIKit.UINavigationController>rootViewController.visibleViewController);
    } else if (rootViewController.presentedViewController) {
//        console.log("Using presented view controller");
        return topViewControllerWithRootViewController(rootViewController.presentedViewController);
    } else {
//        console.log("Using view controller");
        return rootViewController;
    }
}

export var takePicture = function (options?: types.Options): promises.Promise<imageSource.ImageSource> {
    var d = promises.defer<imageSource.ImageSource>();

    // This is done to prevent listener from being freed by JS garbage collector
    var listener;

    var ImagePickerControllerListener = Foundation.NSObject.extends({
    }, {}).implements({

            protocol: "UIImagePickerControllerDelegate",

            implementation: {
                imagePickerControllerDidFinishPickingMediaWithInfo: function (picker, info) {
//                    console.log('takeImage received');
                    picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
                    listener = null;
                    var image = imageSource.fromNativeSource(info.valueForKey(UIKit.UIImagePickerControllerOriginalImage));
                    d.resolve(image);
                },

                imagePickerControllerDidCancel: function (picker) {
//                    console.info('takeImage canceled');
                    picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
                    listener = null;
                    d.reject(new Error('takePicture canceled by user'));
                }
            }
    });

    imagePickerController = new UIKit.UIImagePickerController();
    listener = new ImagePickerControllerListener();
    imagePickerController.delegate = listener;
    imagePickerController.mediaTypes = UIKit.UIImagePickerController.availableMediaTypesForSourceType(UIKit.UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera);
    imagePickerController.sourceType = UIKit.UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera;
    imagePickerController.modalPresentationStyle = UIKit.UIModalPresentationStyle.UIModalPresentationCurrentContext;

    if (options && ("undefined" !== typeof options.cameraPosition) && (types.CameraPosition.FRONT === options.cameraPosition)) {
        imagePickerController.cameraDevice = UIKit.UIImagePickerControllerCameraDevice.UIImagePickerControllerCameraDeviceFront;
    }

    if (options && ("undefined" !== typeof options.flashMode)) {
        if (types.FlashMode.OFF === options.flashMode) {
            imagePickerController.cameraFlashMode = UIKit.UIImagePickerControllerCameraFlashMode.UIImagePickerControllerCameraFlashModeOff;
        }
        else if (types.FlashMode.ON === options.flashMode) {
            imagePickerController.cameraFlashMode = UIKit.UIImagePickerControllerCameraFlashMode.UIImagePickerControllerCameraFlashModeOn;
        }
    }

    topViewController().presentViewControllerAnimatedCompletion(imagePickerController, true, null);

    return d.promise();
}
