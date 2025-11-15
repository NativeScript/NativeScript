// Utility functions for validation and parsing, shared between core-types and properties
export function makeValidator<T>(...values: T[]): (value: any) => value is T {
	return (value: any): value is T => values.includes(value);
}

export function makeParser<T>(isValid: (value: any) => boolean, allowNumbers = false): (value: any) => T {
	return (value) => {
		const lower = value?.toLowerCase();
		if (isValid(lower)) {
			return lower;
		} else if (allowNumbers) {
			const convNumber = +value;
			if (!isNaN(convNumber)) {
				return value;
			}
		}
		throw new Error('Invalid value: ' + value);
	};
}
