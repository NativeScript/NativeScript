import { platformCheck } from './platform-check';
import { collections, getCurrentAppPath, joinPaths, getWindow, iOSNativeHelper, isRealDevice } from './native-helper.macos';

export * from './types';
export * from './utils-shared';
export * from './native-helper';

export const ios = {
	collections,
	getCurrentAppPath,
	getWindow,
	isRealDevice,
	joinPaths,
};

export const android = platformCheck('utils.android');

export function openUrl(location: string): boolean {
	try {
		const value = location?.trim();
		if (!value) {
			return false;
		}
		const url = NSURL.URLWithString(value);
		if (!url) {
			return false;
		}
		return NSWorkspace.sharedWorkspace.openURL(url);
	} catch {
		return false;
	}
}

export function openUrlAsync(location: string): Promise<boolean> {
	return Promise.resolve(openUrl(location));
}

export function openFile(filePath: string): boolean {
	return openUrl(`file://${filePath}`);
}

export function GC() {
	if (typeof __collect === 'function') {
		__collect();
	}
}

let queuedGCHandle: NodeJS.Timeout;

export function queueGC(delay = 900) {
	clearTimeout(queuedGCHandle);
	queuedGCHandle = setTimeout(() => GC(), delay);
}

export function releaseNativeObject(object: NSObject) {
	if (typeof __releaseNativeCounterpart === 'function') {
		__releaseNativeCounterpart(object);
	}
}

export const ad = 0;

export function dismissSoftInput(_nativeView?: NSView): void {}

export function dismissKeyboard() {
	dismissSoftInput();
}

export function copyToClipboard(value: string) {
	const pasteboard = NSPasteboard.generalPasteboard;
	pasteboard.clearContents();
	pasteboard.setStringForType(value, NSPasteboardTypeString);
}

export { iOSNativeHelper };
