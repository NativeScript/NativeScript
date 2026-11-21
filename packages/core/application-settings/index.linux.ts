import { outPointer } from '../utils/gtk.linux';
import * as Common from './application-settings-common';

// JSON file in $XDG_CONFIG_HOME/<application name>/settings.json
let cache: Record<string, any> | null = null;

function path(): string {
	const app = g_get_prgname() || 'nativescript-app';
	return `${g_get_user_config_dir()}/${app}/settings.json`;
}

function load(): Record<string, any> {
	if (cache) {
		return cache;
	}
	const contents = outPointer();
	cache = {};
	if (g_file_get_contents(path(), contents, null, null)) {
		try {
			cache = JSON.parse(interop.stringFromCString(contents.value)) ?? {};
		} catch {}
		g_free(contents.value);
	}
	return cache;
}

function save(): boolean {
	const file = path();
	g_mkdir_with_parents(file.substring(0, file.lastIndexOf('/')), 0o700);
	return !!g_file_set_contents(file, JSON.stringify(load()), -1, null);
}

function values() {
	const data = load();
	return {
		HasKey: (key: string) => Object.prototype.hasOwnProperty.call(data, key),
		Lookup: (key: string) => data[key],
		Insert: (key: string, value: any) => {
			data[key] = value;
			save();
		},
		Remove: (key: string) => {
			delete data[key];
			save();
		},
		Clear: () => {
			for (const key of Object.keys(data)) delete data[key];
			save();
		},
		Keys: () => Object.keys(data),
	};
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
	if (settings.HasKey(key)) {
		settings.Remove(key);
	}
}

export function clear(): void {
	values().Clear();
}

export function flush(): boolean {
	return save();
}

export function getAllKeys(): Array<string> {
	return values().Keys();
}
