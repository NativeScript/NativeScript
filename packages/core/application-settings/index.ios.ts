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
export function getAllJSON(): string {
	const nsDictionary = userDefaults.dictionaryRepresentation();
	const jsonDictionary = NSMutableDictionary.new();
	nsDictionary.enumerateKeysAndObjectsUsingBlock((key, value, stop) => {
		// we try to filter Apple internal settings. Though some might still be there like AddingEmojiKeybordHandled
		if (key.startsWith('AK') || key.startsWith('Apple') || key.startsWith('NS') || key.startsWith('PK')) {
			return;
		}

		let valueClassString = value.classForCoder || value.class ? NSStringFromClass(value.classForCoder?.() ?? value.class?.()) : undefined;
		if (valueClassString) {
			if (valueClassString.startsWith('__')) {
				valueClassString = valueClassString.slice(2);
			}
			switch (valueClassString) {
				case 'NSDate':
					jsonDictionary.setObjectForKey(NSISO8601DateFormatter.alloc().init().stringFromDate(value), key);
					break;
				case 'NSURL':
					jsonDictionary.setObjectForKey((value as NSURL).absoluteString, key);
					break;
				default:
					jsonDictionary.setObjectForKey(value, key);
			}
		} else {
			jsonDictionary.setObjectForKey(value, key);
		}
	});
	const jsonData = NSJSONSerialization.dataWithJSONObjectOptionsError(jsonDictionary, 0 as any);
	if (jsonData) {
		return NSString.alloc().initWithDataEncoding(jsonData, NSUTF8StringEncoding).toString();
	}
	return null;
}

export function getNative() {
	return userDefaults;
}
