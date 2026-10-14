import * as Common from './application-settings-common';

export function hasKey(key: string): boolean | undefined {
	if (!Common.checkKey(key)) {
		return;
	}

	const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
	return localSettings.Values.HasKey(key);
}

export function getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
	if (!Common.checkKey(key)) {
		return undefined;
	}
	if (hasKey(key)) {
		const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
		return localSettings.Values[key] as never;
	}

	return defaultValue;
}

export function getString(key: string, defaultValue?: string): string | undefined {
	if (!Common.checkKey(key)) {
		return;
	}
	if (hasKey(key)) {
		const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
		return localSettings.Values[key] as never;
	}

	return defaultValue;
}

export function getNumber(key: string, defaultValue?: number): number | undefined {
	if (!Common.checkKey(key)) {
		return;
	}
	if (hasKey(key)) {
		const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
		return localSettings.Values[key] as never;
	}

	return defaultValue;
}

export function setBoolean(key: string, value: boolean): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'boolean')) {
		return;
	}
	const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
	localSettings.Values[key] = value;
}

export function setString(key: string, value: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'string')) {
		return;
	}
	const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
	localSettings.Values[key] = value;
}

export function setNumber(key: string, value: number): void {
	if (!Common.checkKey(key)) {
		return;
	}
	if (!Common.ensureValidValue(value, 'number')) {
		return;
	}
	const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
	localSettings.Values[key] = value;
}

export function remove(key: string): void {
	if (!Common.checkKey(key)) {
		return;
	}
	const localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
	localSettings.Values.Remove(key);
}

export function clear(): void {
	Windows.Storage.ApplicationData.Current.LocalSettings.Values.Clear();
}

export function flush(): boolean {
	// no-op since Windows.Storage.ApplicationData is automatically flushed by the system
	return true;
}

export function getAllKeys(): Array<string> {
	const Values = Windows.Storage.ApplicationData.Current.LocalSettings.Values;
	const first = Values.First();
	const ret: string[] = [];
	while (first && first.HasCurrent) {
		ret.push(first.Current.Key);
		first.MoveNext();
	}

	return ret;
}
