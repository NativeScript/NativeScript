import { ios } from './native-helper';
import { Trace } from '../trace';

export { ios } from './native-helper';
export * from './utils-common';

export function openFile(filePath: string): boolean {
  try {
    const appPath = ios.getCurrentAppPath();
    let path = ios.isRealDevice() ? filePath.replace('~', appPath) : filePath;

    const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
    controller.delegate = <UIDocumentInteractionControllerDelegate>new ios.UIDocumentInteractionControllerDelegateImpl();

    return controller.presentPreviewAnimated(true);
  } catch (e) {
    Trace.write('Error in openFile', Trace.categories.Error, Trace.messageType.error);
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
  } catch (e) {
    // We Don't do anything with an error.  We just output it
    Trace.write('Error in OpenURL', Trace.categories.Error, Trace.messageType.error);
  }

  return false;
}

export function isRealDevice(): boolean {
  return ios.isRealDevice();
}
