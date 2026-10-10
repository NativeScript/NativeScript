// whatwg-fetch, https://github.com/github/fetch
// Copyright (c) 2014-2016 GitHub, Inc., MIT License (see LICENSE in this folder).
// Requests go through core's XMLHttpRequest, and bodies are core's Blob, FileReader and FormData.

import { Blob, FileReader, FormData, XMLHttpRequest } from '../xhr';
import type AbortSignal from '../abortcontroller/abortsignal';

export type HeadersInit = Headers | string[][] | Record<string, string>;
export type BodyInit = string | Blob | FormData | ArrayBuffer | ArrayBufferView | URLSearchParams | null;
export type RequestInfo = Request | string;

export interface RequestInit {
	body?: BodyInit;
	credentials?: string;
	headers?: HeadersInit;
	method?: string;
	mode?: string;
	signal?: AbortSignal | null;
}

export interface ResponseInit {
	headers?: HeadersInit;
	status?: number;
	statusText?: string;
	url?: string | null;
}

// URLSearchParams is the runtime's, where it has one.
const supportsSearchParams = 'URLSearchParams' in global;

function isSearchParams(body: any): boolean {
	return supportsSearchParams && (global as any).URLSearchParams.prototype.isPrototypeOf(body);
}

function normalizeName(name: string): string {
	if (typeof name !== 'string') {
		name = String(name);
	}
	if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
		throw new TypeError('Invalid character in header field name');
	}
	return name.toLowerCase();
}

function normalizeValue(value: string): string {
	if (typeof value !== 'string') {
		value = String(value);
	}
	return value;
}

export class Headers {
	map: Record<string, string> = {};

	constructor(headers?: HeadersInit) {
		if (headers instanceof Headers) {
			headers.forEach((value, name) => {
				this.append(name, value);
			});
		} else if (Array.isArray(headers)) {
			headers.forEach((header) => {
				this.append(header[0], header[1]);
			});
		} else if (headers) {
			const record = headers as Record<string, string>;
			Object.getOwnPropertyNames(record).forEach((name) => {
				this.append(name, record[name]);
			});
		}
	}

	append(name: string, value: string): void {
		name = normalizeName(name);
		value = normalizeValue(value);
		const oldValue = this.map[name];
		this.map[name] = oldValue ? oldValue + ', ' + value : value;
	}

	delete(name: string): void {
		delete this.map[normalizeName(name)];
	}

	get(name: string): string | null {
		name = normalizeName(name);
		return this.has(name) ? this.map[name] : null;
	}

	has(name: string): boolean {
		return this.map.hasOwnProperty(normalizeName(name));
	}

	set(name: string, value: string): void {
		this.map[normalizeName(name)] = normalizeValue(value);
	}

	forEach(callback: (value: string, name: string, headers: Headers) => void, thisArg?: any): void {
		for (const name in this.map) {
			if (this.map.hasOwnProperty(name)) {
				callback.call(thisArg, this.map[name], name, this);
			}
		}
	}

	keys(): IterableIterator<string> {
		const items: string[] = [];
		this.forEach((value, name) => {
			items.push(name);
		});
		return items.values();
	}

	values(): IterableIterator<string> {
		const items: string[] = [];
		this.forEach((value) => {
			items.push(value);
		});
		return items.values();
	}

	entries(): IterableIterator<[string, string]> {
		const items: [string, string][] = [];
		this.forEach((value, name) => {
			items.push([name, value]);
		});
		return items.values();
	}

	[Symbol.iterator](): IterableIterator<[string, string]> {
		return this.entries();
	}
}

/** Marks the body read: whether it was already. */
function consumed(body: Body): boolean {
	if (body.bodyUsed) {
		return true;
	}
	body.bodyUsed = true;
	return false;
}

function fileReaderReady<T>(reader: FileReader): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		reader.onload = () => {
			resolve(reader.result as T);
		};
		reader.onerror = () => {
			reject((reader as any).error);
		};
	});
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	const reader = new FileReader();
	const promise = fileReaderReady<ArrayBuffer>(reader);
	reader.readAsArrayBuffer(blob);
	return promise;
}

function readBlobAsText(blob: Blob): Promise<string> {
	const reader = new FileReader();
	const promise = fileReaderReady<string>(reader);
	reader.readAsText(blob);
	return promise;
}

function readArrayBufferAsText(buf: any): string {
	const view = new Uint8Array(buf);
	const chars = new Array<string>(view.length);

	for (let i = 0; i < view.length; i++) {
		chars[i] = String.fromCharCode(view[i]);
	}
	return chars.join('');
}

function bufferClone(buf: any): any {
	return buf.slice(0);
}

abstract class Body {
	bodyUsed = false;
	abstract headers: Headers;
	_bodyInit: any;
	_bodyText: string;
	_bodyBlob: Blob;
	_bodyFormData: FormData;
	// A copy of the buffer or view the body was made from: `arrayBuffer()` resolves with a view's copy as it is.
	_bodyArrayBuffer: any;

	_initBody(body: any): void {
		this._bodyInit = body;
		if (!body) {
			this._bodyText = '';
		} else if (typeof body === 'string') {
			this._bodyText = body;
		} else if (body instanceof Blob) {
			this._bodyBlob = body;
		} else if (body instanceof FormData) {
			this._bodyFormData = body;
		} else if (isSearchParams(body)) {
			this._bodyText = body.toString();
		} else if (body instanceof DataView) {
			this._bodyArrayBuffer = bufferClone(body.buffer);
			this._bodyInit = new Blob([this._bodyArrayBuffer]);
		} else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
			this._bodyArrayBuffer = bufferClone(body);
		} else {
			this._bodyText = body = Object.prototype.toString.call(body);
		}

		if (!this.headers.get('content-type')) {
			if (typeof body === 'string') {
				this.headers.set('content-type', 'text/plain;charset=UTF-8');
			} else if (this._bodyBlob && this._bodyBlob.type) {
				this.headers.set('content-type', this._bodyBlob.type);
			} else if (isSearchParams(body)) {
				this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
			}
		}
	}

	blob(): Promise<Blob> {
		if (consumed(this)) {
			return Promise.reject(new TypeError('Already read'));
		}

		if (this._bodyBlob) {
			return Promise.resolve(this._bodyBlob);
		} else if (this._bodyArrayBuffer) {
			return Promise.resolve(new Blob([this._bodyArrayBuffer]));
		} else if (this._bodyFormData) {
			throw new Error('could not read FormData body as blob');
		} else {
			return Promise.resolve(new Blob([this._bodyText]));
		}
	}

	arrayBuffer(): Promise<ArrayBuffer> {
		if (this._bodyArrayBuffer) {
			if (consumed(this)) {
				return Promise.reject(new TypeError('Already read'));
			}
			return Promise.resolve(this._bodyArrayBuffer as ArrayBuffer);
		} else {
			return this.blob().then((blob) => readBlobAsArrayBuffer(blob));
		}
	}

	text(): Promise<string> {
		if (consumed(this)) {
			return Promise.reject(new TypeError('Already read'));
		}

		if (this._bodyBlob) {
			return readBlobAsText(this._bodyBlob);
		} else if (this._bodyArrayBuffer) {
			return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
		} else if (this._bodyFormData) {
			throw new Error('could not read FormData body as text');
		} else {
			return Promise.resolve(this._bodyText);
		}
	}

	formData(): Promise<FormData> {
		return this.text().then((text) => decode(text));
	}

	json(): Promise<any> {
		return this.text().then((text) => JSON.parse(text));
	}
}

// HTTP methods whose capitalization should be normalized
const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

function normalizeMethod(method: string): string {
	const upcased = method.toUpperCase();
	return methods.indexOf(upcased) > -1 ? upcased : method;
}

export class Request extends Body {
	url: string;
	credentials: string;
	headers: Headers;
	method: string;
	mode: string | null;
	signal: AbortSignal | null | undefined;
	referrer: string | null;

	constructor(input: RequestInfo, options?: RequestInit) {
		super();
		options = options || {};
		let body = options.body;

		if (input instanceof Request) {
			if (input.bodyUsed) {
				throw new TypeError('Already read');
			}
			this.url = input.url;
			this.credentials = input.credentials;
			if (!options.headers) {
				this.headers = new Headers(input.headers);
			}
			this.method = input.method;
			this.mode = input.mode;
			this.signal = input.signal;
			if (!body && input._bodyInit != null) {
				body = input._bodyInit;
				input.bodyUsed = true;
			}
		} else {
			this.url = String(input);
		}

		this.credentials = options.credentials || this.credentials || 'same-origin';
		if (options.headers || !this.headers) {
			this.headers = new Headers(options.headers);
		}
		this.method = normalizeMethod(options.method || this.method || 'GET');
		this.mode = options.mode || this.mode || null;
		this.signal = options.signal || this.signal;
		this.referrer = null;

		if ((this.method === 'GET' || this.method === 'HEAD') && body) {
			throw new TypeError('Body not allowed for GET or HEAD requests');
		}
		this._initBody(body);
	}

	clone(): Request {
		return new Request(this, { body: this._bodyInit });
	}
}

function decode(body: string): FormData {
	const form = new FormData();
	body
		.trim()
		.split('&')
		.forEach((bytes) => {
			if (bytes) {
				const split = bytes.split('=');
				const name = split[0].replace(/\+/g, ' ');
				const value = split.slice(1).join('=').replace(/\+/g, ' ');
				form.append(decodeURIComponent(name), decodeURIComponent(value));
			}
		});
	return form;
}

function parseHeaders(rawHeaders: string): Headers {
	const headers = new Headers();
	// Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	// https://tools.ietf.org/html/rfc7230#section-3.2
	const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	preProcessedHeaders.split(/\r?\n/).forEach((line) => {
		const parts = line.split(':');
		const key = parts[0].trim();
		if (key) {
			const value = parts.slice(1).join(':').trim();
			headers.append(key, value);
		}
	});
	return headers;
}

const redirectStatuses = [301, 302, 303, 307, 308];

export class Response extends Body {
	type: string;
	status: number;
	ok: boolean;
	statusText: string;
	headers: Headers;
	url: string;

	constructor(bodyInit?: BodyInit, options?: ResponseInit) {
		super();
		if (!options) {
			options = {};
		}

		this.type = 'default';
		this.status = options.status === undefined ? 200 : options.status;
		this.ok = this.status >= 200 && this.status < 300;
		this.statusText = 'statusText' in options ? options.statusText : 'OK';
		this.headers = new Headers(options.headers);
		this.url = options.url || '';
		this._initBody(bodyInit);
	}

	clone(): Response {
		return new Response(this._bodyInit, {
			status: this.status,
			statusText: this.statusText,
			headers: new Headers(this.headers),
			url: this.url,
		});
	}

	static error(): Response {
		const response = new Response(null, { status: 0, statusText: '' });
		response.type = 'error';
		return response;
	}

	static redirect(url: string, status: number): Response {
		if (redirectStatuses.indexOf(status) === -1) {
			throw new RangeError('Invalid status code');
		}

		return new Response(null, { status: status, headers: { location: url } });
	}
}

/** whatwg-fetch's stand-in for a runtime without DOMException. */
class DOMExceptionPolyfill extends Error {
	constructor(message?: string, name?: string) {
		super(message);
		this.name = name;
	}
}

/** The runtime's DOMException, or whatwg-fetch's stand-in where it has none. */
export let DOMException: any = (global as any).DOMException;
try {
	new DOMException();
} catch (err) {
	DOMException = DOMExceptionPolyfill;
}

export function fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	return new Promise<Response>((resolve, reject) => {
		const request = new Request(input, init);

		if (request.signal && request.signal.aborted) {
			return reject(new DOMException('Aborted', 'AbortError'));
		}

		const xhr = new XMLHttpRequest();

		const abortXhr = () => {
			xhr.abort();
		};

		xhr.onload = () => {
			const headers = parseHeaders(xhr.getAllResponseHeaders() || '');
			// Core's XMLHttpRequest has no responseURL.
			const options: ResponseInit = {
				status: xhr.status,
				statusText: xhr.statusText,
				headers: headers,
				url: headers.get('X-Request-URL'),
			};
			resolve(new Response(xhr.response, options));
		};

		xhr.onerror = () => {
			reject(new TypeError('Network request failed'));
		};

		xhr.onabort = () => {
			reject(new DOMException('Aborted', 'AbortError'));
		};

		xhr.open(request.method, request.url, true);

		xhr.responseType = 'blob';

		request.headers.forEach((value, name) => {
			xhr.setRequestHeader(name, value);
		});

		if (request.signal) {
			request.signal.addEventListener('abort', abortXhr);

			xhr.onreadystatechange = () => {
				// DONE (success or failure)
				if (xhr.readyState === 4) {
					request.signal.removeEventListener('abort', abortXhr);
				}
			};
		}

		xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	});
}

/** Marks this fetch as a polyfill, as whatwg-fetch does. */
export namespace fetch {
	export const polyfill = true;
}
