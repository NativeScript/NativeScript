import { ios } from "./native-helper";
import {
    write as traceWrite, categories as traceCategories, messageType as traceMessageType
} from "../trace";

export { ios };
export * from "./utils-common";

export function openFile(filePath: string): boolean {
    try {
        const appPath = ios.getCurrentAppPath();
        const path = filePath.replace("~", appPath);

        const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
        controller.delegate = <UIDocumentInteractionControllerDelegate>new ios.UIDocumentInteractionControllerDelegateImpl();

        return controller.presentPreviewAnimated(true);
    }
    catch (e) {
        traceWrite("Error in openFile", traceCategories.Error, traceMessageType.error);
    }

    return false;
}

export function GC() {
    __collect();
}

export function releaseNativeObject(object: NSObject) {
    __releaseNativeCounterpart(object);
}

export function openUrl(location: string): boolean {
    try {
        const url = NSURL.URLWithString(location.trim());
        if (UIApplication.sharedApplication.canOpenURL(url)) {
            return UIApplication.sharedApplication.openURL(url);
        }
    }
    catch (e) {
        // We Don't do anything with an error.  We just output it
        traceWrite("Error in OpenURL", traceCategories.Error, traceMessageType.error);
    }

    return false;
}
