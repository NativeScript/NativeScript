import types = require("utils/types");
import * as cameraCommonModule from "./camera-common";
import * as imageSourceModule from "image-source";
import * as frameModule from "ui/frame";

@Deprecated
class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];

    static new(): UIImagePickerControllerDelegateImpl {
        return <UIImagePickerControllerDelegateImpl>super.new();
    }

    private _callback: (result?) => void;

    private _width: number;
    private _height: number;
    private _keepAspectRatio: boolean;
    private _saveToGallery: boolean;

    public initWithCallback(callback: (result?) => void): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    public initWithCallbackAndOptions(callback: (result?) => void, options?): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        if (options) {
            this._width = options.width;
            this._height = options.height;
            this._saveToGallery = options.saveToGallery;
            this._keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
        }
        return this;
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(picker, info): void {
        if (info) {
            let source = info.valueForKey(UIImagePickerControllerOriginalImage);
            if (source) {
                let image = null;
                if (this._width || this._height) {
                    let newSize = null;
                    if (this._keepAspectRatio) {
                        let common: typeof cameraCommonModule = require("./camera-common");

                        let aspectSafeSize = common.getAspectSafeDimensions(source.size.width, source.size.height, this._width, this._height);
                        newSize = CGSizeMake(aspectSafeSize.width, aspectSafeSize.height);
                    }
                    else {
                        newSize = CGSizeMake(this._width, this._height);
                    }
                    UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0);
                    source.drawInRect(CGRectMake(0, 0, newSize.width, newSize.height));
                    image = UIGraphicsGetImageFromCurrentImageContext();
                    UIGraphicsEndImageContext();
                }

                let imageSource: typeof imageSourceModule = require("image-source");

                let imageSourceResult = image ? imageSource.fromNativeSource(image) : imageSource.fromNativeSource(source);

                if (this._callback) {
                    this._callback(imageSourceResult);
                    if (this._saveToGallery) {
                        UIImageWriteToSavedPhotosAlbum(imageSourceResult.ios, null, null, null);
                    }
                }
            }
        }
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }

    imagePickerControllerDidCancel(picker): void {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }
}

var listener;

/**
 * [Deprecated. Please use same functionality from `nativescript-camera` npm module]
 */
export var takePicture = function (options): Promise<any> {
    return new Promise((resolve, reject) => {
        listener = null;
        let imagePickerController = UIImagePickerController.new();
        let reqWidth = 0;
        let reqHeight = 0;
        let keepAspectRatio = true;
        let saveToGallery = true;
        if (options) {
            reqWidth = options.width || 0;
            reqHeight = options.height || reqWidth;
            keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
            saveToGallery = options.saveToGallery ? true : false;
        }
        if (reqWidth && reqHeight) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { width: reqWidth, height: reqHeight, keepAspectRatio: keepAspectRatio, saveToGallery: saveToGallery });
        } else if (saveToGallery) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { saveToGallery: saveToGallery });
        }
        else {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallback(resolve);
        }
        imagePickerController.delegate = listener;

        let sourceType = UIImagePickerControllerSourceType.Camera;
        let mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(sourceType);

        if (mediaTypes) {
            imagePickerController.mediaTypes = mediaTypes;
            imagePickerController.sourceType = sourceType;
        }

        imagePickerController.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

        let frame: typeof frameModule = require("ui/frame");

        let topMostFrame = frame.topmost();
        if (topMostFrame) {
            let viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
            if (viewController) {
                viewController.presentViewControllerAnimatedCompletion(imagePickerController, true, null);
            }
        }
    });
}

/**
 * [Deprecated. Please use same functionality from `nativescript-camera` npm module]
 */
export var isAvailable = function () {
    return UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.Camera);
}
