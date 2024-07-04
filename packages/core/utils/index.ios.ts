import { Trace } from '../trace';
import { ios as iOSUtils } from './native-helper';

export { clearInterval, clearTimeout, setInterval, setTimeout } from '../timer';
export * from './common';
export * from './constants';
export * from './debug';
export * from './layout-helper';
export * from './macrotask-scheduler';
export * from './mainthread-helper';
export * from './native-helper';
export * from './types';

export function openFile(filePath: string): boolean {
	try {
		const appPath = iOSUtils.getCurrentAppPath();
		const path = iOSUtils.isRealDevice() ? filePath.replace('~', appPath) : filePath;

		const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
		controller.delegate = iOSUtils.createUIDocumentInteractionControllerDelegate();

		return controller.presentPreviewAnimated(true);
	} catch (e) {
		Trace.write('Error in openFile', Trace.categories.Error, Trace.messageType.error);
	}

	return false;
}

export function wrapNativeException(ex: NSError, wrapError: (...args) => Error = (msg) => new Error(msg)) {
	if (!ex) {
		return;
	}
	if (typeof ex === 'string') {
		return wrapError(ex);
	}
	if (!(ex instanceof Error)) {
		const err = wrapError(ex.localizedDescription);
		err['nativeException'] = ex;
		err['code'] = ex.code;
		err['domain'] = ex.domain;
		// TODO: we loose native stack. see how to get it
		return err;
	}
	return ex;
}

export function GC() {
	__collect();
}

export function releaseNativeObject(object: NSObject) {
	__releaseNativeCounterpart(object);
}

export function openUrl(location: string): boolean {
	const url = NSURL.URLWithString(location.trim());
	if (UIApplication.sharedApplication.canOpenURL(url)) {
		return UIApplication.sharedApplication.openURL(url);
	}
}

export function isRealDevice(): boolean {
	return iOSUtils.isRealDevice();
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
