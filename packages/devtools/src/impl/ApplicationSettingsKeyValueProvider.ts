import { ApplicationSettings } from '@nativescript/core';
import { KeyValueProvider } from '../providers/keyValueProvider';

/**
 * Exposes ApplicationSettings to Chrome Devtools
 */
export class ApplicationSettingsKeyValueProvider implements KeyValueProvider {
	getName(): string {
		return 'ApplicationSettings';
	}
	getKeys(): string[] {
		return ApplicationSettings.getAllKeys();
	}
	getValue(key: string) {
		// Android's typed getters throw ClassCastException when the stored value has a different type.
		const readers = [() => ApplicationSettings.getString(key), () => ApplicationSettings.getBoolean(key), () => ApplicationSettings.getNumber(key)];
		for (const read of readers) {
			try {
				const value = read();
				return value === undefined ? undefined : String(value);
			} catch {
				// try the next type
			}
		}

		return undefined;
	}
	setValue(key: string, value: string) {
		ApplicationSettings.setString(key, value);
		return true;
	}
	deleteKey(key: string) {
		ApplicationSettings.remove(key);
		return true;
	}
	clear() {
		ApplicationSettings.clear();
		return true;
	}
}
