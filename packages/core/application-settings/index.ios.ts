import * as Common from './application-settings-common';

import * as utils from '../utils';

const userDefaults = NSUserDefaults.standardUserDefaults;

export function hasKey(key: string): boolean {
	if (!Common.checkKey(key)) {
		return;
	}

	return userDefaults.objectForKey(key) !== null;
}

// utils.ios.getters
export function getBoolean(key: string, defaultValue?: boolean): boolean {
	if (!Common.checkKey(key)) {
		return;
	}
	if (hasKey(key)) {
		return userDefaults.boolForKey(key);
	}

	return defaultValue;
}

export function getString(key: string, defaultValue?: string): string {
	if (!Common.checkKey(key)) {
		return;
	}
	if (hasKey(key)) {
		return userDefaults.stringForKey(key);
	}

	return defaultValue;
}

export function getNumber(key: string, defaultValue?: number): number {
	if (!Common.checkKey(key)) {
		return;
	}
	if (hasKey(key)) {
		return userDefaults.doubleForKey(key);
	}

	return defaultValue;
}

// setters
export function setBoolean(key: string, value: boolean): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'boolean')) {
		return;
	}
	userDefaults.setBoolForKey(value, key);
}

export function setString(key: string, value: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'string')) {
		return;
	}
	userDefaults.setObjectForKey(value, key);
}

export function setNumber(key: string, value: number): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'number')) {
		return;
	}
	userDefaults.setDoubleForKey(value, key);
}

export function remove(key: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	userDefaults.removeObjectForKey(key);
}

export function clear(): void {
	userDefaults.removePersistentDomainForName(NSBundle.mainBundle.bundleIdentifier);
}

export function flush(): boolean {
	return userDefaults.synchronize();
}

export function getAllKeys(): Array<string> {
	return utils.ios.collections.nsArrayToJSArray(userDefaults.dictionaryRepresentation().allKeys);
}
