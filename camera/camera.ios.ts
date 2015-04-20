import imageSource = require("image-source");
import frame = require("ui/frame");
import definition = require("camera");
import common = require("./camera-common");
import types = require("utils/types");

class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];

    static new(): UIImagePickerControllerDelegateImpl {
        return <UIImagePickerControllerDelegateImpl>super.new();
    }

    private _callback: (result?: imageSource.ImageSource) => void;

    private _width: number;
    private _height: number;
    private _keepAspectRatio: boolean;

    public initWithCallback(callback: (result?: imageSource.ImageSource) => void): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    public initWithCallbackAndOptions(callback: (result?: imageSource.ImageSource) => void, options?): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        if (options) {
            this._width = options.width;
            this._height = options.height;
            this._keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
        }
        return this;
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(picker, info): void {
        if (info) {
            var source = info.valueForKey(UIImagePickerControllerOriginalImage);
            if (source) {
                var image = null;
                if (this._width || this._height) {
                    var newSize = null;
                    if (this._keepAspectRatio) {
                        var aspectSafeSize = common.getAspectSafeDimensions(source.size.width, source.size.height, this._width, this._height);
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

                var imageSourceResult = image ? imageSource.fromNativeSource(image) : imageSource.fromNativeSource(source);

                if (this._callback) {
                    this._callback(imageSourceResult);
                }
            }
        }
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
    }

    imagePickerControllerDidCancel(picker): void {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
    }
}

export var takePicture = function (options?: definition.CameraOptions): Promise<imageSource.ImageSource> {
    return new Promise<imageSource.ImageSource>((resolve, reject) => {
        var imagePickerController = new UIImagePickerController();
        var listener = null;
        var reqWidth = 0;
        var reqHeight = 0;
        var keepAspectRatio = true;
        if (options) {
            reqWidth = options.width || 0;
            reqHeight = options.height || reqWidth;
            keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
        }
        if (reqWidth && reqHeight) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { width: reqWidth, height: reqHeight, keepAspectRatio: keepAspectRatio });
        }
        else {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallback(resolve);
        }
        imagePickerController.delegate = listener;

        if (UIDevice.currentDevice().model !== "iPhone Simulator") {
            // UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera is not available in emulators!
            imagePickerController.mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera);
            imagePickerController.sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera;
        }

        imagePickerController.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationCurrentContext;

        var topMostFrame = frame.topmost();
        if (topMostFrame) {
            var viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
            if (viewController) {

                viewController.presentModalViewControllerAnimated(imagePickerController, true);
            }
        }
    });
}
