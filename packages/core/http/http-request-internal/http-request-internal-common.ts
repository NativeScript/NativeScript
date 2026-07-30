import type { Headers } from '../http-interfaces';

export function addHeader(headers: Headers, key: string, value: string): void {
	if (!headers[key]) {
		headers[key] = value;
	} else if (Array.isArray(headers[key])) {
		headers[key].push(value);
	} else {
		headers[key] = [headers[key], value];
	}
}
