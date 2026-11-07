import { outPointer } from './gtk.linux';
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

function launch(uri: string): boolean {
	const error = outPointer();
	const ok = !!g_app_info_launch_default_for_uri(uri, null, error);
	if (!ok) {
		Trace.write(`Failed to open ${uri}`, Trace.categories.Error, Trace.messageType.error);
	}
	return ok;
}

export function openUrl(location: string): boolean {
	return launch(location.trim());
}

export function openUrlAsync(location: string): Promise<boolean> {
	return Promise.resolve(openUrl(location));
}

export function openFile(filePath: string, _title: string = 'Open File...'): boolean {
	const file = g_file_new_for_path(filePath);
	const uri = g_file_get_uri(file);
	g_object_unref(file);
	const ok = launch(interop.stringFromCString(uri));
	g_free(uri);
	return ok;
}

export function dismissSoftInput(_nativeView?: any): void {
	// no soft keyboard on desktop
}

export function dismissKeyboard(): void {
	dismissSoftInput();
}

export function copyToClipboard(value: string): void {
	const display = gdk_display_get_default();
	if (display) {
		gdk_clipboard_set_text(gdk_display_get_clipboard(display), value);
	}
}
