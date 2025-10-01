import { Trace } from '../trace';
import { ios as iOSUtils, isRealDevice } from './native-helper';
import { debounce, throttle } from './shared';

export { clearInterval, clearTimeout, setInterval, setTimeout } from '../timer';
export * from './animation-helpers';
export * from './common';
export * from './constants';
export * from './debug';
export * from './layout-helper';
export * from './macrotask-scheduler';
export * from './mainthread-helper';
export * from './native-helper';
export * from './shared';
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

let throttledGC: Map<number, () => void>;
let debouncedGC: Map<number, () => void>;

export function queueGC(delay = 900, useThrottle?: boolean) {
	/**
	 * developers can use different queueGC settings to optimize their own apps
	 * each setting is stored in a Map to reuse each time app calls it
	 */
	if (useThrottle) {
		if (!throttledGC) {
			throttledGC = new Map();
		}
		if (!throttledGC.get(delay)) {
			throttledGC.set(
				delay,
				throttle(() => GC(), delay),
			);
		}
		throttledGC.get(delay)();
	} else {
		if (!debouncedGC) {
			debouncedGC = new Map();
		}
		if (!debouncedGC.get(delay)) {
			debouncedGC.set(
				delay,
				debounce(() => GC(), delay),
			);
		}
		debouncedGC.get(delay)();
	}
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
