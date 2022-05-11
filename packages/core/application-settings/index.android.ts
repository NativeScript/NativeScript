import * as common from './application-settings-common';
import { getNativeApplication } from '../application';
import { Trace } from '../trace';

const DB_KEY = 'prefs.db';
let sharedPreferences: android.content.SharedPreferences;
function ensureSharedPreferences() {
	let context = getNativeApplication().getApplicationContext();
	if (context && !sharedPreferences) {
		if (android.os.Build.VERSION.SDK_INT >= 24) {
			const deviceContext = context.createDeviceProtectedStorageContext();
			if (deviceContext && !deviceContext.moveSharedPreferencesFrom(context, DB_KEY)) {
				const warnMessage = 'Failed to migrate Application Settings to Device Protected Storage';
				if (Trace.isEnabled()) {
					Trace.write(warnMessage, Trace.categories.Debug, Trace.messageType.warn);
				} else {
					console.log(warnMessage);
				}
			}
			context = deviceContext;
		}
		sharedPreferences = context.getSharedPreferences(DB_KEY, android.content.Context.MODE_PRIVATE);
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
		return sharedPreferences.getFloat(key, float(0.0));
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
	editor.putFloat(key, float(value));
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
