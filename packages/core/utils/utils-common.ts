import * as types from './types';
import { dispatchToMainThread, dispatchToUIThread, isMainThread } from './mainthread-helper';
import { sanitizeModuleName } from '../ui/builder/module-name-sanitizer';
import * as layout from './layout-helper';

import { GC } from './index';

export { layout };
export * from './mainthread-helper';
export * from './macrotask-scheduler';

export const RESOURCE_PREFIX = 'res://';
export const FILE_PREFIX = 'file:///';

export function escapeRegexSymbols(source: string): string {
	const escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

	return source.replace(escapeRegex, '\\$&');
}

export function convertString(value: any): any {
	let result;

	if (!types.isString(value) || value.trim() === '') {
		result = value;
	} else {
		// Try to convert value to number.
		const valueAsNumber = +value;
		if (!isNaN(valueAsNumber)) {
			result = valueAsNumber;
		} else if (value && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
			result = value.toLowerCase() === 'true' ? true : false;
		} else {
			result = value;
		}
	}

	return result;
}

export function getModuleName(path: string): string {
	const moduleName = path.replace('./', '');

	return sanitizeModuleName(moduleName);
}

export function isFileOrResourcePath(path: string): boolean {
	if (!types.isString(path)) {
		return false;
	}

	return (
		path.indexOf('~/') === 0 || // relative to AppRoot
		path.indexOf('/') === 0 || // absolute path
		path.indexOf(RESOURCE_PREFIX) === 0
	); // resource
}

export function isFontIconURI(uri: string): boolean {
	if (!types.isString(uri)) {
		return false;
	}

	const firstSegment = uri.trim().split('//')[0];

	return firstSegment && firstSegment.indexOf('font:') === 0;
}

export function isDataURI(uri: string): boolean {
	if (!types.isString(uri)) {
		return false;
	}

	const firstSegment = uri.trim().split(',')[0];

	return firstSegment && firstSegment.indexOf('data:') === 0 && firstSegment.indexOf('base64') >= 0;
}

export function mergeSort(arr, compareFunc) {
	if (arr.length < 2) {
		return arr;
	}

	const middle = arr.length / 2;
	const left = arr.slice(0, middle);
	const right = arr.slice(middle, arr.length);

	return merge(mergeSort(left, compareFunc), mergeSort(right, compareFunc), compareFunc);
}

export function merge(left, right, compareFunc) {
	const result = [];
	while (left.length && right.length) {
		if (compareFunc(left[0], right[0]) <= 0) {
			result.push(left.shift());
		} else {
			result.push(right.shift());
		}
	}

	while (left.length) {
		result.push(left.shift());
	}

	while (right.length) {
		result.push(right.shift());
	}

	return result;
}

export function hasDuplicates(arr: Array<any>): boolean {
	return arr.length !== eliminateDuplicates(arr).length;
}

export function eliminateDuplicates(arr: Array<any>): Array<any> {
	return Array.from(new Set(arr));
}

export function executeOnMainThread(func: Function) {
	if (isMainThread()) {
		return func();
	} else {
		dispatchToMainThread(func);
	}
}

export function executeOnUIThread(func: Function) {
	dispatchToUIThread(func);
}

export function mainThreadify(func: Function): (...args: any[]) => void {
	return function (...args) {
		const argsToPass = args;
		executeOnMainThread(() => func.apply(this, argsToPass));
	};
}

export function debounce(fn: any, delay = 300) {
	let timer: NodeJS.Timeout;
	return (...args: Array<any>) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
}

export function throttle(fn: any, delay = 300) {
	let waiting = false;
	return function () {
		if (!waiting) {
			fn.apply(this, arguments);
			waiting = true;
			setTimeout(function () {
				waiting = false;
			}, delay);
		}
	};
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
				throttle(() => GC(), delay)
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
				debounce(() => GC(), delay)
			);
		}
		debouncedGC.get(delay)();
	}
}
