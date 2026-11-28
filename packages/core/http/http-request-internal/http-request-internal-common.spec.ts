import { describe, expect, it } from 'vitest';
import { getDebugRequestMethodAndBody, getRequestBodyBytes } from './http-request-internal-common';

describe('getDebugRequestMethodAndBody', () => {
	it('defaults to GET with no body', () => {
		expect(getDebugRequestMethodAndBody({ url: 'https://example.com' })).toEqual({ method: 'GET' });
	});

	it('reports the request method and string content', () => {
		const content = JSON.stringify({ user: 'name' });
		expect(getDebugRequestMethodAndBody({ url: 'https://example.com', method: 'POST', content })).toEqual({ method: 'POST', postData: content });
	});

	it('reports FormData content as its serialized string', () => {
		const content = new FormData();
		content.append('user', 'name');
		expect(getDebugRequestMethodAndBody({ url: 'https://example.com', method: 'PUT', content })).toEqual({ method: 'PUT', postData: content.toString() });
	});

	it('omits binary content', () => {
		expect(getDebugRequestMethodAndBody({ url: 'https://example.com', method: 'POST', content: new ArrayBuffer(4) })).toEqual({ method: 'POST' });
	});
});

describe('getRequestBodyBytes', () => {
	it('returns the bytes of an ArrayBuffer', () => {
		const buffer = new Uint8Array([1, 2, 3]).buffer;
		const bytes = getRequestBodyBytes(buffer);
		expect(bytes.buffer).toBe(buffer);
		expect(Array.from(bytes)).toEqual([1, 2, 3]);
	});

	it('returns only the bytes a typed array view covers, without copying', () => {
		const source = new Uint16Array([0x0101, 0x0202, 0x0303, 0x0404]);
		const bytes = getRequestBodyBytes(source.subarray(1, 3));
		expect(bytes.buffer).toBe(source.buffer);
		expect(Array.from(bytes)).toEqual([2, 2, 3, 3]);
	});

	it('returns only the bytes a DataView covers', () => {
		const source = new Uint8Array([9, 1, 2, 9]);
		expect(Array.from(getRequestBodyBytes(new DataView(source.buffer, 1, 2)))).toEqual([1, 2]);
	});

	it('ignores non-binary content', () => {
		expect(getRequestBodyBytes('text')).toBeUndefined();
		expect(getRequestBodyBytes(undefined)).toBeUndefined();
		expect(getRequestBodyBytes([1, 2])).toBeUndefined();
	});
});
