// Utility functions for validation and parsing, shared between core-types and properties

export function makeValidator<T>(...values: T[]): (value: any) => value is T {
	return function (value: any): value is T {
		return values.indexOf(value) !== -1;
	};
}

export function makeParser<T>(isValid: (value: any) => boolean, allowNumbers = false): (value: any) => T {
	return function (value: any): T {
		if (allowNumbers && typeof value === 'number') {
			return value as T;
		}
		if (isValid(value)) {
			return value as T;
		}
		throw new Error(`Invalid value: ${value}`);
	};
}
