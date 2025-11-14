const g: any = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof global !== 'undefined' && global) || {};

// Feature support detection
interface Support {
	searchParams: boolean;
	iterable: boolean;
	blob: boolean;
	formData: boolean;
	arrayBuffer: boolean;
}
const support: Support = {
	searchParams: 'URLSearchParams' in g,
	iterable: 'Symbol' in g && 'iterator' in Symbol,
	blob:
		'FileReader' in g &&
		'Blob' in g &&
		(() => {
			try {
				new Blob();
				return true;
			} catch (e) {
				return false;
			}
		})(),
	formData: 'FormData' in g,
	arrayBuffer: 'ArrayBuffer' in g,
};

function isDataView(obj: any): obj is DataView {
	return obj && DataView.prototype.isPrototypeOf(obj);
}

let isArrayBufferView: (obj: any) => boolean;
if (support.arrayBuffer) {
	const viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];

	isArrayBufferView =
		ArrayBuffer.isView ||
		((obj: any) => {
			return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
		});
}

function normalizeName(name: any): string {
	if (typeof name !== 'string') {
		name = String(name);
	}
	if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
		throw new TypeError('Invalid character in header field name: "' + name + '"');
	}
	return name.toLowerCase();
}

function normalizeValue(value: any): string {
	if (typeof value !== 'string') {
		value = String(value);
	}
	return value;
}

// Build a destructive iterator for the value list
function iteratorFor(items: any[]): IterableIterator<any> {
	const iterator: any = {
		next: () => {
			const value = items.shift();
			return { done: value === undefined, value };
		},
	};

	if (support.iterable) {
		(iterator as any)[Symbol.iterator] = () => iterator;
	}

	return iterator;
}

export type HeaderInit = Headers | string[][] | Record<string, string>;

export class Headers {
	private map: Record<string, string> = {};

	constructor(headers?: HeaderInit) {
		if (headers instanceof Headers) {
			headers.forEach((value, name) => {
				this.append(name, value);
			});
		} else if (Array.isArray(headers)) {
			headers.forEach((header) => {
				if (header.length !== 2) {
					throw new TypeError('Headers constructor: expected name/value pair to be length 2, found ' + header.length);
				}
				this.append(header[0], header[1]);
			});
		} else if (headers) {
			Object.getOwnPropertyNames(headers).forEach((name) => {
				this.append(name, (headers as Record<string, string>)[name]);
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
		return Object.prototype.hasOwnProperty.call(this.map, normalizeName(name));
	}

	set(name: string, value: string): void {
		this.map[normalizeName(name)] = normalizeValue(value);
	}

	forEach(callback: (value: string, name: string, headers: Headers) => void, thisArg?: any): void {
		for (const name in this.map) {
			if (Object.prototype.hasOwnProperty.call(this.map, name)) {
				callback.call(thisArg, this.map[name], name, this);
			}
		}
	}

	keys(): IterableIterator<string> {
		const items: string[] = [];
		this.forEach((_, name) => items.push(name));
		return iteratorFor(items);
	}

	values(): IterableIterator<string> {
		const items: string[] = [];
		this.forEach((value) => items.push(value));
		return iteratorFor(items);
	}

	entries(): IterableIterator<[string, string]> {
		const items: [string, string][] = [];
		this.forEach((value, name) => items.push([name, value]));
		return iteratorFor(items);
	}

	[Symbol.iterator](): IterableIterator<[string, string]> {
		return this.entries();
	}
}

// Body mixin
export class Body {
	bodyUsed = false;
	_bodyInit: any;
	protected _bodyText?: string;
	protected _bodyBlob?: Blob;
	protected _bodyFormData?: FormData;
	protected _bodyArrayBuffer?: ArrayBuffer;
	protected _noBody?: boolean;
	protected headers!: Headers;

	protected _initBody(body: any): void {
		// Ensure bodyUsed property exists
		this.bodyUsed = this.bodyUsed;
		this._bodyInit = body;

		if (!body) {
			this._noBody = true;
			this._bodyText = '';
		} else if (typeof body === 'string') {
			this._bodyText = body;
		} else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
			this._bodyBlob = body as Blob;
		} else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
			this._bodyFormData = body as FormData;
		} else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
			this._bodyText = body.toString();
		} else if (support.arrayBuffer && support.blob && isDataView(body)) {
			// @ts-ignore
			this._bodyArrayBuffer = bufferClone((body as DataView).buffer);
			this._bodyInit = new Blob([this._bodyArrayBuffer]);
		} else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
			this._bodyArrayBuffer = bufferClone(body as ArrayBuffer);
		} else {
			this._bodyText = body = Object.prototype.toString.call(body);
		}

		// Set Content-Type header if not set
		if (!this.headers.get('content-type')) {
			if (typeof body === 'string') {
				this.headers.set('content-type', 'text/plain;charset=UTF-8');
			} else if (this._bodyBlob && this._bodyBlob.type) {
				this.headers.set('content-type', this._bodyBlob.type);
			} else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
				this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
			}
		}
	}

	blob?(): Promise<Blob> {
		const rejected = consumed(this);
		if (rejected) {
			return rejected as Promise<any>;
		}

		if (this._bodyBlob) {
			return Promise.resolve(this._bodyBlob);
		} else if (this._bodyArrayBuffer) {
			return Promise.resolve(new Blob([this._bodyArrayBuffer]));
		} else if (this._bodyFormData) {
			throw new Error('could not read FormData body as blob');
		} else {
			return Promise.resolve(new Blob([this._bodyText!]));
		}
	}

	arrayBuffer(): Promise<ArrayBuffer> {
		if (this._bodyArrayBuffer) {
			const consumedResult = consumed(this);
			if (consumedResult) {
				return consumedResult as Promise<any>;
			} else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
				return Promise.resolve((this._bodyArrayBuffer as any).buffer.slice((this._bodyArrayBuffer as any).byteOffset, (this._bodyArrayBuffer as any).byteOffset + (this._bodyArrayBuffer as any).byteLength));
			} else {
				return Promise.resolve(this._bodyArrayBuffer);
			}
		} else if (support.blob) {
			// @ts-ignore
			return this.blob!().then(readBlobAsArrayBuffer);
		} else {
			throw new Error('could not read as ArrayBuffer');
		}
	}

	text(): Promise<string> {
		const rejected = consumed(this);
		if (rejected) {
			return rejected as Promise<any>;
		}

		if (this._bodyBlob) {
			return readBlobAsText(this._bodyBlob);
		} else if (this._bodyArrayBuffer) {
			return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
		} else if (this._bodyFormData) {
			throw new Error('could not read FormData body as text');
		} else {
			return Promise.resolve(this._bodyText!);
		}
	}

	formData?(): Promise<FormData> {
		return this.text().then(decode);
	}

	json(): Promise<any> {
		return this.text().then(JSON.parse);
	}
}

// Helper functions for Body
function consumed(body: any): Promise<any> | undefined {
	if (body._noBody) return;
	if (body.bodyUsed) {
		return Promise.reject(new TypeError('Already read'));
	}
	body.bodyUsed = true;
}

function fileReaderReady(reader: FileReader): Promise<any> {
	return new Promise((resolve, reject) => {
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
	});
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer | string | null> {
	const reader = new FileReader();
	const promise = fileReaderReady(reader);
	reader.readAsArrayBuffer(blob);
	return promise;
}

function readBlobAsText(blob: Blob): Promise<string | null> {
	const reader = new FileReader();
	const promise = fileReaderReady(reader);
	const match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
	const encoding = match ? match[1] : 'utf-8';
	reader.readAsText(blob, encoding);
	return promise;
}

function readArrayBufferAsText(buf: ArrayBuffer): string {
	const view = new Uint8Array(buf);
	const chars = new Array(view.length);

	for (let i = 0; i < view.length; i++) {
		chars[i] = String.fromCharCode(view[i]);
	}
	return chars.join('');
}

function bufferClone(buf: ArrayBuffer): ArrayBuffer {
	if (buf.slice) {
		return buf.slice(0);
	} else {
		const view = new Uint8Array(buf.byteLength);
		view.set(new Uint8Array(buf));
		return view.buffer;
	}
}

// HTTP methods whose capitalization should be normalized
const methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

function normalizeMethod(method: string): string {
	const upcased = method.toUpperCase();
	return methods.indexOf(upcased) > -1 ? upcased : method;
}

// Request class
export type RequestInfo = string | Request;
export interface RequestInit {
	method?: string;
	headers?: HeaderInit;
	body?: any;
	mode?: string | null;
	credentials?: RequestCredentials;
	cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
	signal?: AbortSignal;
}

export class Request extends Body {
	url: string;
	credentials: RequestCredentials;
	headers: Headers;
	method: string;
	mode: string | null;
	signal?: AbortSignal;
	referrer: string | null;

	constructor(input: RequestInfo, options: RequestInit = {}) {
		super();
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
		this.signal = options.signal || this.signal || ('AbortController' in g ? new AbortController().signal : undefined);
		this.referrer = null;

		if ((this.method === 'GET' || this.method === 'HEAD') && body) {
			throw new TypeError('Body not allowed for GET or HEAD requests');
		}
		this._initBody(body);

		if (this.method === 'GET' || this.method === 'HEAD') {
			if (options.cache === 'no-store' || options.cache === 'no-cache') {
				const reParamSearch = /([?&])_=[^&]*/;
				if (reParamSearch.test(this.url)) {
					this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
				} else {
					const reQueryString = /\?/;
					this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
				}
			}
		}
	}

	clone(): Request {
		return new Request(this, { body: this._bodyInit });
	}
}

// Decode URL-encoded form data
function decode(body: string): FormData {
	const form = new FormData();
	body
		.trim()
		.split('&')
		.forEach((bytes) => {
			if (bytes) {
				const split = bytes.split('=');
				const name = split.shift()!.replace(/\+/g, ' ');
				const value = split.join('=').replace(/\+/g, ' ');
				form.append(decodeURIComponent(name), decodeURIComponent(value));
			}
		});
	return form;
}

// Parse raw headers string into Headers
function parseHeaders(rawHeaders: string): Headers {
	const headers = new Headers();
	const preProcessed = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	preProcessed
		.split('\r')
		.map((header) => (header.indexOf('\n') === 0 ? header.substr(1) : header))
		.forEach((line) => {
			const parts = line.split(':');
			const key = parts.shift()!.trim();
			if (key) {
				const value = parts.join(':').trim();
				try {
					headers.append(key, value);
				} catch (err) {
					console.warn('Response ' + (err as Error).message);
				}
			}
		});
	return headers;
}

// Response class
export interface ResponseInit {
	status?: number;
	statusText?: string;
	headers?: HeaderInit;
	url?: string;
}

const redirectStatuses = [301, 302, 303, 307, 308];

export class Response extends Body {
	type: string;
	status: number;
	ok: boolean;
	statusText: string;
	headers: Headers;
	url: string;

	constructor(bodyInit: any, options: ResponseInit = {}) {
		super();
		this.type = 'default';
		this.status = options.status === undefined ? 200 : options.status!;
		if (this.status < 200 || this.status > 599) {
			throw new RangeError(`Failed to construct 'Response': The status provided (${this.status}) is outside the range [200, 599].`);
		}
		this.ok = this.status >= 200 && this.status < 300;
		this.statusText = options.statusText === undefined ? '' : String(options.statusText);
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
		const response = new Response(null, { status: 200, statusText: '' });
		response.ok = false;
		response.status = 0;
		response.type = 'error';
		return response;
	}

	static redirect(url: string, status: number): Response {
		if (!redirectStatuses.includes(status)) {
			throw new RangeError('Invalid status code');
		}
		return new Response(null, { status, headers: { location: url } });
	}
}

// DOMException polyfill
export let DOMException: any = g.DOMException;
try {
	new (g.DOMException as any)();
} catch (err) {
	DOMException = class {
		message: string;
		name: string;
		stack?: string;
		constructor(message: string, name: string) {
			this.message = message;
			this.name = name;
			const error = new Error(message);
			this.stack = error.stack;
		}
	};
}

// fetch function
export function fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
	return new Promise((resolve, reject) => {
		const request = new Request(input, init as any);

		if (request.signal && (request.signal as any).aborted) {
			return reject(new DOMException('Aborted', 'AbortError'));
		}

		const xhr = new XMLHttpRequest();

		function abortXhr() {
			xhr.abort();
		}

		xhr.onload = function () {
			const options: any = {
				statusText: xhr.statusText,
				headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
			};
			// Local file handling
			if (request.url.startsWith('file://') && (xhr.status < 200 || xhr.status > 599)) {
				options.status = 200;
			} else {
				options.status = xhr.status;
			}
			options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
			// @ts-ignore
			const body = 'response' in xhr ? xhr.response : xhr.responseText;
			setTimeout(() => resolve(new Response(body, options)), 0);
		};

		xhr.onerror = function () {
			setTimeout(() => reject(new TypeError('Network request failed')), 0);
		};

		xhr.ontimeout = function () {
			setTimeout(() => reject(new TypeError('Network request timed out')), 0);
		};

		xhr.onabort = function () {
			setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 0);
		};

		function fixUrl(url: string): string {
			try {
				return url === '' && g.location.href ? g.location.href : url;
			} catch (e) {
				return url;
			}
		}

		xhr.open(request.method, fixUrl(request.url), true);

		if (request.credentials === 'include') {
			xhr.withCredentials = true;
		} else if (request.credentials === 'omit') {
			xhr.withCredentials = false;
		}

		if ('responseType' in xhr) {
			if (support.blob) {
				(xhr as any).responseType = 'blob';
			} else if (support.arrayBuffer) {
				(xhr as any).responseType = 'arraybuffer';
			}
		}

		if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers) && !(g.Headers && init.headers instanceof g.Headers)) {
			const names: string[] = [];
			Object.getOwnPropertyNames(init.headers).forEach((name) => {
				names.push(normalizeName(name));
				xhr.setRequestHeader(name, normalizeValue((init.headers as any)[name]));
			});
			request.headers.forEach((value, name) => {
				if (!names.includes(name)) {
					xhr.setRequestHeader(name, value);
				}
			});
		} else {
			request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
		}

		if (request.signal) {
			request.signal.addEventListener('abort', abortXhr);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					(request.signal as any).removeEventListener('abort', abortXhr);
				}
			};
		}

		xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	});
}

// Attach polyfill to globals
(fetch as any).polyfill = true;
if (!g.fetch) {
	g.fetch = fetch;
	g.Headers = Headers;
	g.Request = Request;
	g.Response = Response;
}
