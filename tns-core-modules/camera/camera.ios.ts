import types = require("utils/types");

import {Camera as Common} from "./camera-common";

import * as imageSourceModule from "image-source";
import * as frameModule from "ui/frame";

var listener;

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
	private _options: any;

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
			this._options = options.options;
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
                        let aspectSafeSize = (new Common()).getAspectSafeDimensions(source.size.width, source.size.height, this._width, this._height);
                        newSize = CGSizeMake(aspectSafeSize.width, aspectSafeSize.height);
                    } else {
                        newSize = CGSizeMake(this._width, this._height);
                    }

                    UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0);
                    source.drawInRect(CGRectMake(0, 0, newSize.width, newSize.height));
                    image = UIGraphicsGetImageFromCurrentImageContext();
                    UIGraphicsEndImageContext();
                }

                let imageSourceResult = image ? imageSourceModule.fromNativeSource(image) : imageSourceModule.fromNativeSource(source);

                if (this._callback) {
                    this._callback(imageSourceResult);
                    if (this._saveToGallery) {
                        UIImageWriteToSavedPhotosAlbum(imageSourceResult.ios, null, null, null);
                    }
                }
            } else if (info.valueForKey(UIImagePickerControllerReferenceURL)) {
            	// TODO: handle video
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

class Camera extends Common {
    static takePicture(options): Promise<any> {
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
                listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { width: reqWidth, height: reqHeight, keepAspectRatio: keepAspectRatio, saveToGallery: saveToGallery, options: options });
            } else if (saveToGallery) {
                listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { saveToGallery: saveToGallery, options: options });
            } else {
                listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { options : options });
            }

            imagePickerController.delegate = listener;
            options.source = Camera.getSource(options.source);

            let sourceType;

            switch (options.source) {
                case Camera.sources.device:
                    sourceType = UIImagePickerControllerSourceType.Camera;
                    break;
                case Camera.sources.library:
                    sourceType = UIImagePickerControllerSourceType.PhotoLibrary;
                    break;
                case Camera.sources.roll:
                    sourceType = UIImagePickerControllerSourceType.SavedPhotosAlbum;
                    break;
            }

            imagePickerController.sourceType = sourceType;
            options.mode = Camera.getMode(options.mode);

            if (options.source == Camera.sources.device) {
                switch (options.mode) {
                    case Camera.modes.photo:
                        imagePickerController.cameraCaptureMode = UIImagePickerControllerCameraCaptureModePhoto;
                        break;
                    case Camera.modes.video:
                        imagePickerController.cameraCaptureMode = UIImagePickerControllerCameraCaptureModeVideo;
                        break;
                }
            }

            imagePickerController.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

            let topMostFrame = frameModule.topmost();

            if (topMostFrame) {
                let viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;

                if (viewController) {
                    viewController.presentViewControllerAnimatedCompletion(imagePickerController, true, null);
                }
            }
        });
    }

    static isAvailable(source: string = Camera.sources.device): boolean {
        var sourceType;

        switch (source) {
            case Camera.sources.device:
                sourceType = UIImagePickerControllerSourceType.Camera;
                break;
            case Camera.sources.library:
                sourceType = UIImagePickerControllerSourceType.PhotoLibrary;
                break;
            case Camera.sources.roll:
                sourceType = UIImagePickerControllerSourceType.SavedPhotosAlbum;
                break;
        }

        return UIImagePickerController.isSourceTypeAvailable(sourceType);
    }
}

module.exports = Camera;