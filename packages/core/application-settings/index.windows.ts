import * as Common from './application-settings-common';

// LocalSettings.Values is an IPropertySet: read and write through its IMap members.
function values() {
	return Windows.Storage.ApplicationData.Current.LocalSettings.Values;
}

export function hasKey(key: string): boolean | undefined {
	if (!Common.checkKey(key)) {
		return;
	}

	return values().HasKey(key);
}

function getValue(key: string, defaultValue: any): any {
	if (!Common.checkKey(key)) {
		return undefined;
	}
	const settings = values();
	return settings.HasKey(key) ? settings.Lookup(key) : defaultValue;
}

export function getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
	return getValue(key, defaultValue);
}

export function getString(key: string, defaultValue?: string): string | undefined {
	return getValue(key, defaultValue);
}

export function getNumber(key: string, defaultValue?: number): number | undefined {
	return getValue(key, defaultValue);
}

function setValue(key: string, value: any, valueType: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, valueType)) {
		return;
	}
	values().Insert(key, value);
}

export function setBoolean(key: string, value: boolean): void {
	setValue(key, value, 'boolean');
}

export function setString(key: string, value: string): void {
	setValue(key, value, 'string');
}

export function setNumber(key: string, value: number): void {
	setValue(key, value, 'number');
}

export function remove(key: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	const settings = values();
	// Remove throws E_BOUNDS for a missing key.
	if (settings.HasKey(key)) {
		settings.Remove(key);
	}
}

export function clear(): void {
	values().Clear();
}

export function flush(): boolean {
	// no-op since Windows.Storage.ApplicationData is automatically flushed by the system
	return true;
}

export function getAllKeys(): Array<string> {
	const iterator = values().First();
	const ret: string[] = [];
	while (iterator && iterator.HasCurrent) {
		ret.push(iterator.Current.Key);
		iterator.MoveNext();
	}

	return ret;
}
