import imageSource = require("image-source");
import frame = require("ui/frame");

class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];

    static new(): UIImagePickerControllerDelegateImpl {
        return <UIImagePickerControllerDelegateImpl>super.new();
    }

    private _callback: (result?: imageSource.ImageSource) => void;

    private _width: number;
    private _height: number;

    public initWithCallback(callback: (result?: imageSource.ImageSource) => void): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    public initWithCallbackWidthAndHeight(callback: (result?: imageSource.ImageSource) => void, width, height): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        this._width = width;
        this._height = height;
        return this;
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(picker, info): void {
        if (info) {
            var source = info.valueForKey(UIImagePickerControllerOriginalImage);
            if (source) {
                var image = null;
                if (this._width || this._height) {
                    console.log("Image resized!!!");
                    var newSize = CGSizeMake(this._width, this._height);
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

export var takePicture = function (width?, height?): Promise<imageSource.ImageSource> {
    return new Promise<imageSource.ImageSource>((resolve, reject) => {
        var imagePickerController = new UIImagePickerController();
        var listener = null;
        var reqWidth = width || 0;
        var reqHeight = height || reqWidth;
        if (reqWidth && reqHeight) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackWidthAndHeight(resolve, reqWidth, reqHeight);
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
