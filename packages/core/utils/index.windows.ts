import { Trace } from '../trace';
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

export function GC() {
	if (typeof gc === 'function') {
		(gc as any)();
	}
}

let throttledGC: Map<number, () => void>;
let debouncedGC: Map<number, () => void>;

export function queueGC(delay = 900, useThrottle?: boolean) {
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

export function releaseNativeObject(_object: any): void {}

export function openUrl(location: string): boolean {
	try {
		Windows.System.Launcher.LaunchUriAsync(new Windows.Foundation.Uri(location.trim()));
		return true;
	} catch (e) {
		Trace.write(`Failed to open URL: ${location}`, Trace.categories.Error, Trace.messageType.error);
		return false;
	}
}

export function openUrlAsync(location: string): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		try {
			Windows.System.Launcher.LaunchUriAsync(new Windows.Foundation.Uri(location.trim())).then((result: boolean) => resolve(result));
		} catch (e) {
			Trace.write(`Failed to open URL: ${location}`, Trace.categories.Error, Trace.messageType.error);
			resolve(false);
		}
	});
}

export function openFile(filePath: string, _title: string = 'Open File...'): boolean {
	try {
		Windows.System.StorageFile.GetFileFromPathAsync(filePath).then((file: any) => {
			Windows.System.Launcher.LaunchFileAsync(file);
		});
		return true;
	} catch (e) {
		Trace.write(`Error in openFile: ${e.message}`, Trace.categories.Error, Trace.messageType.error);
		return false;
	}
}

export function dismissSoftInput(_nativeView?: any): void {
	try {
		Windows.UI.ViewManagement.InputPane.GetForCurrentView()?.TryHide();
	} catch {}
}

export function dismissKeyboard(): void {
	dismissSoftInput();
}

export function copyToClipboard(value: string): void {
	try {
		const dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
		dataPackage.SetText(value);
		Windows.ApplicationModel.DataTransfer.Clipboard.SetContent(dataPackage);
	} catch (err) {
		console.log(err);
	}
}
