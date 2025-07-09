import { Trace } from '../trace';
import { ios as iOSUtils, isRealDevice } from './native-helper';

export { clearInterval, clearTimeout, setInterval, setTimeout } from '../timer';
export * from './common';
export * from './constants';
export * from './debug';
export * from './layout-helper';
export * from './macrotask-scheduler';
export * from './mainthread-helper';
export * from './native-helper'; // do not re-export getWindow here, use ios-helper.ts for that
export * from './types';
export * from './native-helper';

export function openFile(filePath: string): boolean {
	try {
		const appPath = iOSUtils.getCurrentAppPath();
		const path = isRealDevice() ? filePath.replace('~', appPath) : filePath;

		const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
		controller.delegate = iOSUtils.createUIDocumentInteractionControllerDelegate();

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
			openUrlAsync(location);
			return true;
		}
	} catch (e) {
		// We Don't do anything with an error.  We just output it
		Trace.write('Error in OpenURL', Trace.categories.Error, Trace.messageType.error);
	}

	return false;
}

export function openUrlAsync(location: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		try {
			const url = NSURL.URLWithString(location.trim());
			const app = UIApplication.sharedApplication;
			if (app.canOpenURL(url)) {
				app.openURLOptionsCompletionHandler(url, null, (success: boolean) => {
					resolve(success);
				});
			} else {
				resolve(false);
			}
		} catch (e) {
			Trace.write('Error in OpenURL', Trace.categories.Error, Trace.messageType.error);
			reject(e);
		}
	});
}

export const ad = 0;

export function dismissSoftInput(nativeView?: UIView): void {
	if (nativeView instanceof UIView && !nativeView.isFirstResponder) {
		return;
	}
	UIApplication.sharedApplication.sendActionToFromForEvent('resignFirstResponder', null, null, null);
}

export function dismissKeyboard() {
	dismissSoftInput();
}

export function copyToClipboard(value: string) {
	try {
		UIPasteboard.generalPasteboard.setValueForPasteboardType(value, kUTTypePlainText);
	} catch (err) {
		console.log(err);
	}
}
