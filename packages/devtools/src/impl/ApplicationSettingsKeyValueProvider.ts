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
		return ApplicationSettings.getString(key);
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
