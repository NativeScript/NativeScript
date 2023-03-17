import * as common from './application-settings-common';
import { getNativeApplication } from '../application';

let sharedPreferences: android.content.SharedPreferences;
function ensureSharedPreferences() {
	if (!sharedPreferences) {
		sharedPreferences = (<android.app.Application>getNativeApplication()).getApplicationContext().getSharedPreferences('prefs.db', 0);
	}
}

function verify(key: string) {
	common.checkKey(key);
	ensureSharedPreferences();
}

export function hasKey(key: string): boolean {
	verify(key);

	return sharedPreferences.contains(key);
}

// getters
export function getBoolean(key: string, defaultValue?: boolean): boolean {
	verify(key);
	if (hasKey(key)) {
		return sharedPreferences.getBoolean(key, false);
	}

	return defaultValue;
}

export function getString(key: string, defaultValue?: string): string {
	verify(key);
	if (hasKey(key)) {
		return sharedPreferences.getString(key, '');
	}

	return defaultValue;
}

export function getNumber(key: string, defaultValue?: number): number {
	verify(key);
	if (hasKey(key)) {
		let val;

		// TODO: Remove this migration step in a future release
		try {
			val = sharedPreferences.getLong(key, long(0));
		} catch (err) {
			// If value is old, it might have been stored as a float so we store it anew as a long value to avoid errors
			const oldVal = sharedPreferences.getFloat(key, float(0.0));
			setNumber(key, oldVal);

			val = sharedPreferences.getLong(key, long(0));
		}
		// SharedPreferences has no getter or setter for double so we retrieve value as a long and convert it to double
		return java.lang.Double.longBitsToDouble(val);
	}

	return defaultValue;
}

// setters
export function setBoolean(key: string, value: boolean): void {
	verify(key);
	common.ensureValidValue(value, 'boolean');
	const editor = sharedPreferences.edit();
	editor.putBoolean(key, value);
	editor.apply();
}

export function setString(key: string, value: string): void {
	verify(key);
	common.ensureValidValue(value, 'string');
	const editor = sharedPreferences.edit();
	editor.putString(key, value);
	editor.apply();
}

export function setNumber(key: string, value: number): void {
	verify(key);
	common.ensureValidValue(value, 'number');
	const editor = sharedPreferences.edit();
	// SharedPreferences has no getter or setter for double so we convert value and store it as a long
	editor.putLong(key, java.lang.Double.doubleToRawLongBits(double(value)));
	editor.apply();
}

export function remove(key: string): void {
	verify(key);
	const editor = sharedPreferences.edit();
	editor.remove(key);
	editor.apply();
}

export function clear(): void {
	ensureSharedPreferences();
	sharedPreferences.edit().clear().apply();
}

export function flush(): boolean {
	ensureSharedPreferences();

	return sharedPreferences.edit().commit();
}

export function getAllKeys(): Array<string> {
	ensureSharedPreferences();
	const mappedPreferences = sharedPreferences.getAll();
	const iterator = mappedPreferences.keySet().iterator();
	const result = [];
	while (iterator.hasNext()) {
		const key = iterator.next();
		result.push(key);
	}

	return result;
}
