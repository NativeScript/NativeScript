export function checkKey(key: string): void {
	if (typeof key !== 'string') {
		throw new Error("key: '" + key + "' must be a string");
	}
}

export function ensureValidValue(value: any, valueType: string): void {
	if (typeof value !== valueType) {
		throw new Error("value: '" + value + "' must be a " + valueType);
	}
}
