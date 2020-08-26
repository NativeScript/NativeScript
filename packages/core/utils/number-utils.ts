const epsilon = 1e-5;

export function areClose(value1: number, value2: number): boolean {
	return Math.abs(value1 - value2) < epsilon;
}

export function greaterThanOrClose(value1: number, value2: number): boolean {
	return value1 > value2 || areClose(value1, value2);
}

export function greaterThan(value1: number, value2: number): boolean {
	return value1 > value2 && !areClose(value1, value2);
}

export function lessThan(value1: number, value2: number): boolean {
	return value1 < value2 && !areClose(value1, value2);
}

export function isZero(value: number): boolean {
	return Math.abs(value) < epsilon;
}

export function greaterThanZero(value: Object): boolean {
	return <number>value > 0;
}

export function notNegative(value: Object): boolean {
	return <number>value >= 0;
}

export const radiansToDegrees = (a: number) => a * (180 / Math.PI);

export const degreesToRadians = (a: number) => a * (Math.PI / 180);
