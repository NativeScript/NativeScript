import { platformCheck } from './platform-check';

export function getCurrentAppPath(): string {
	if (!global.__dirname) {
		global.__dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname;
	}
	const currentDir = global.__dirname;
	const tnsModulesIndex = currentDir.indexOf('/tns_modules');

	let appPath = currentDir;
	if (tnsModulesIndex !== -1) {
		appPath = currentDir.substring(0, tnsModulesIndex);
	}

	return appPath;
}

export function joinPaths(...paths: string[]): string {
	if (!paths || paths.length === 0) {
		return '';
	}

	return NSString.stringWithString(NSString.pathWithComponents(<any>paths)).stringByStandardizingPath;
}

export function isRealDevice(): boolean {
	return true;
}

export function getWindow(): NSWindow {
	const app = NSApplication.sharedApplication;
	if (!app) {
		return null;
	}
	return app.keyWindow || app.mainWindow;
}

export function getter<T>(_this: any, property: T | { (): T }): T {
	if (typeof property === 'function') {
		return (<{ (): T }>property).call(_this);
	}
	return <T>property;
}

export namespace collections {
	export function jsArrayToNSArray<T>(arr: T[]): NSArray<T> {
		return NSArray.arrayWithArray(arr);
	}

	export function nsArrayToJSArray<T>(arr: NSArray<T>): Array<T> {
		const result = [];
		if (!arr) {
			return result;
		}
		const count = arr.count;
		for (let i = 0; i < count; i++) {
			result.push(arr.objectAtIndex(i));
		}
		return result;
	}
}

export const iOSNativeHelper = {
	getCurrentAppPath,
	joinPaths,
	getWindow,
};

export const android = platformCheck('utils.android');
