import imageSource = require("image-source");
import frame = require("ui/frame");

class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];

    static new(): UIImagePickerControllerDelegateImpl {
        return <UIImagePickerControllerDelegateImpl>super.new();
    }

    private _callback: (result?: imageSource.ImageSource) => void;

    public initWithCallback(callback: (result?: imageSource.ImageSource) => void): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(picker, info): void {
        if (info) {
            var source = info.valueForKey(UIImagePickerControllerOriginalImage);
            if (source) {
                var image = imageSource.fromNativeSource(source);

                if (this._callback) {
                    this._callback(image);
                }
            }
        }
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
    }

    imagePickerControllerDidCancel(picker): void {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
    }
}

export var takePicture = function (): Promise<imageSource.ImageSource> {
    return new Promise<imageSource.ImageSource>((resolve, reject) => {
        var imagePickerController = new UIImagePickerController();
        var listener = UIImagePickerControllerDelegateImpl.new().initWithCallback(resolve);
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
