export function checkKey(key: string): boolean {
	if (typeof key !== 'string') {
		console.error("key: '" + key + "' must be a string");
		return false;
	}
	return true;
}

export function ensureValidValue(value: any, valueType: string): boolean {
	if (typeof value !== valueType) {
		console.error("value: '" + value + "' must be a " + valueType);
		return false;
	}
	return true;
}
