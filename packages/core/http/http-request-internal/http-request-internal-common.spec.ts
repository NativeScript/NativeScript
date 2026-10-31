import { describe, expect, it } from 'vitest';
import { getDebugRequestMethodAndBody } from './http-request-internal-common';

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
