import * as Common from './application-settings-common';

import * as utils from '../utils';

const userDefaults = NSUserDefaults.standardUserDefaults;

export function hasKey(key: string): boolean {
	Common.checkKey(key);

	return userDefaults.objectForKey(key) !== null;
}

// utils.ios.getters
export function getBoolean(key: string, defaultValue?: boolean): boolean {
	Common.checkKey(key);
	if (hasKey(key)) {
		return userDefaults.boolForKey(key);
	}

	return defaultValue;
}

export function getString(key: string, defaultValue?: string): string {
	Common.checkKey(key);
	if (hasKey(key)) {
		return userDefaults.stringForKey(key);
	}

	return defaultValue;
}

export function getNumber(key: string, defaultValue?: number): number {
	Common.checkKey(key);
	if (hasKey(key)) {
		return userDefaults.doubleForKey(key);
	}

	return defaultValue;
}

// setters
export function setBoolean(key: string, value: boolean): void {
	Common.checkKey(key);
	Common.ensureValidValue(value, 'boolean');
	userDefaults.setBoolForKey(value, key);
}

export function setString(key: string, value: string): void {
	Common.checkKey(key);
	Common.ensureValidValue(value, 'string');
	userDefaults.setObjectForKey(value, key);
}

export function setNumber(key: string, value: number): void {
	Common.checkKey(key);
	Common.ensureValidValue(value, 'number');
	userDefaults.setDoubleForKey(value, key);
}

export function remove(key: string): void {
	Common.checkKey(key);
	userDefaults.removeObjectForKey(key);
}

export function clear(): void {
	userDefaults.removePersistentDomainForName(NSBundle.mainBundle.bundleIdentifier);
}

export function flush(): boolean {
	return userDefaults.synchronize();
}

export function getAllKeys(): Array<string> {
	return utils.iOSNativeHelper.collections.nsArrayToJSArray(userDefaults.dictionaryRepresentation().allKeys);
}
