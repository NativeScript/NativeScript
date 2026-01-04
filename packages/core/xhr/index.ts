import type { HttpRequestOptions, HttpResponse } from '../http/http-interfaces';
import { request } from '../http';
import { isString, isFunction } from '../utils/types';
import { Trace } from '../trace';

namespace XMLHttpRequestResponseType {
	export const empty = '';
	export const text = 'text';
	export const json = 'json';
	export const blob = 'blob';
	export const arraybuffer = 'arraybuffer';
}

export class XMLHttpRequest {
	public UNSENT = 0;
	public OPENED = 1;
	public HEADERS_RECEIVED = 2;
	public LOADING = 3;
	public DONE = 4;

	public onabort: (...args: any[]) => void;
	public onerror: (...args: any[]) => void;
	public onload: (...args: any[]) => void;
	public onloadend: (...args: any[]) => void;
	public onloadstart: (...args: any[]) => void;
	public onprogress: (...args: any[]) => void;

	private _options: HttpRequestOptions;
	private _readyState: number;
	private _status: number;
	private _response: any;
	private _responseTextReader: Function;
	private _headers: any;
	private _errorFlag: boolean;
	private _sendFlag: boolean;
	private _responseType = '';
	private _overrideMimeType: string;

	private _listeners: Map<string, Array<Function>> = new Map<string, Array<Function>>();

	public onreadystatechange: Function;

	public get upload() {
		return this;
	}

	public get readyState(): number {
		return this._readyState;
	}

	public get responseType(): string {
		return this._responseType;
	}

	public set responseType(value: string) {
		if (value === XMLHttpRequestResponseType.empty || value in XMLHttpRequestResponseType) {
			this._responseType = value;
		} else {
			throw new Error(`Response type of '${value}' not supported.`);
		}
	}

	public get responseText(): string {
		if (this._responseType !== XMLHttpRequestResponseType.empty && this._responseType !== XMLHttpRequestResponseType.text) {
			throw new Error("Failed to read the 'responseText' property from 'XMLHttpRequest': " + "The value is only accessible if the object's 'responseType' is '' or 'text' " + `(was '${this._responseType}').`);
		}

		if (isFunction(this._responseTextReader)) {
			return this._responseTextReader();
		}

		return '';
	}

	public get response(): any {
		if (this._responseType === XMLHttpRequestResponseType.empty || this._responseType === XMLHttpRequestResponseType.text) {
			if (this._readyState !== this.LOADING && this._readyState !== this.DONE) {
				return '';
			} else {
				return this._response;
			}
		} else {
			if (this._readyState !== this.DONE) {
				return null;
			} else {
				return this._response;
			}
		}
	}

	public get status(): number {
		return this._status;
	}

	public get statusText(): string {
		if (this._readyState === this.UNSENT || this._readyState === this.OPENED || this._errorFlag) {
			return '';
		}

		return statuses[this._status];
	}

	constructor() {
		this._readyState = this.UNSENT;
	}

	private _loadResponse(r: HttpResponse) {
		this._status = r.statusCode;
		this._headers = r.headers;
		this._setReadyState(this.HEADERS_RECEIVED);

		this._setReadyState(this.LOADING);

		this._responseTextReader = () => r.content.toString();

		const contentType = this.getResponseHeader('Content-Type');
		const mimeType = (contentType && contentType.toLowerCase()) || 'text/xml';
		const finalMimeType = this._overrideMimeType || mimeType;

		if (this._responseType === XMLHttpRequestResponseType.json) {
			this._response = r.content.toJSON();
		} else if (this._responseType === XMLHttpRequestResponseType.text || this._responseType === XMLHttpRequestResponseType.empty) {
			this._response = this.responseText;
		} else if (this._responseType === XMLHttpRequestResponseType.arraybuffer) {
			this._response = r.content.toArrayBuffer();
		} else if (this._responseType === XMLHttpRequestResponseType.blob) {
			this._response = new Blob([r.content.toArrayBuffer()], {
				type: finalMimeType,
			});
		}

		this.emitEvent('progress');

		this._sendFlag = false;
		this._setReadyState(this.DONE);
	}

	private emitEvent(eventName: string, ...args: Array<any>) {
		if (isFunction(this['on' + eventName])) {
			this['on' + eventName](...args);
		}

		const handlers = this._listeners.get(eventName) || [];
		handlers.forEach((handler) => {
			handler(...args);
		});
	}

	private _setReadyState(value: number) {
		if (this._readyState !== value) {
			this._readyState = value;
			this.emitEvent('readystatechange');
		}

		if (this._readyState === this.DONE) {
			this.emitEvent('load');
			this.emitEvent('loadend');
		}
	}

	private _setRequestError(eventName: string, error?: any) {
		this._readyState = this.DONE;

		this._response = error;

		this.emitEvent('readystatechange');

		this.emitEvent(eventName, error);

		this.emitEvent('loadend');
	}

	public addEventListener(eventName: string, handler: Function) {
		if (['abort', 'error', 'load', 'loadend', 'loadstart', 'progress', 'readystatechange'].indexOf(eventName) === -1) {
			if (Trace.isEnabled()) {
				Trace.write('XHR Event not supported: ' + eventName, Trace.categories.Debug, Trace.messageType.warn);
			}
		}

		const handlers = this._listeners.get(eventName) || [];
		handlers.push(handler);
		this._listeners.set(eventName, handlers);
	}

	public removeEventListener(eventName: string, toDetach: Function) {
		let handlers = this._listeners.get(eventName) || [];
		handlers = handlers.filter((handler) => handler !== toDetach);
		this._listeners.set(eventName, handlers);
	}

	public open(method: string, url: string, async?: boolean, user?: string, password?: string) {
		if (isString(method) && isString(url)) {
			this._options = { url: url, method: method };
			this._options.headers = {};

			if (isString(user)) {
				this._options.headers['user'] = user;
			}

			if (isString(password)) {
				this._options.headers['password'] = password;
			}

			this._setReadyState(this.OPENED);
		}
	}

	public abort() {
		this._response = null;
		this._responseTextReader = null;
		this._headers = null;
		this._status = null;

		if ((this._readyState === this.OPENED && this._sendFlag) || this._readyState === this.HEADERS_RECEIVED || this._readyState === this.LOADING) {
			this._errorFlag = true;
			this._sendFlag = false;
			this._setRequestError('abort');
		}

		if (this._readyState === this.DONE) {
			this._readyState = this.UNSENT;
		}
	}

	public send(data?: any) {
		this._errorFlag = false;
		this._response = null;
		this._responseTextReader = null;
		this._headers = null;
		this._status = null;

		if (this._readyState !== this.OPENED || this._sendFlag) {
			throw new Error("Failed to execute 'send' on 'XMLHttpRequest': " + "The object's state must be OPENED.");
		}

		if (isString(data) && this._options.method !== 'GET') {
			//The Android Java HTTP lib throws an exception if we provide a
			//a request body for GET requests, so we avoid doing that.
			//Browser implementations silently ignore it as well.
			this._options.content = data;
		} else if (data instanceof FormData) {
			this._options.content = (<FormData>data).toString();
		} else if (data instanceof Blob) {
			this.setRequestHeader('Content-Type', data.type);
			this._options.content = BlobInternalAccessor.getBuffer(data);
		} else if (data instanceof ArrayBuffer) {
			this._options.content = data;
		}

		this._sendFlag = true;

		this.emitEvent('loadstart');

		request(this._options)
			.then((r) => {
				if (!this._errorFlag && this._sendFlag) {
					this._loadResponse(r);
				}
			})
			.catch((e) => {
				this._errorFlag = true;
				this._sendFlag = false;
				this._setRequestError('error', e);
			});
	}

	public setRequestHeader(header: string, value: string) {
		if (this._readyState !== this.OPENED || this._sendFlag) {
			throw new Error("Failed to execute 'setRequestHeader' on 'XMLHttpRequest': " + "The object's state must be OPENED.");
		}

		if (isString(header) && isString(value)) {
			this._options.headers[header] = value;
		}
	}

	public getAllResponseHeaders(): string {
		if (this._readyState < 2 || this._errorFlag) {
			return '';
		}

		let result = '';

		for (const i in this._headers) {
			result += i + ': ' + this._headers[i] + '\r\n';
		}

		return result.substr(0, result.length - 2);
	}

	public getResponseHeader(header: string): string {
		if (isString(header) && this._readyState > 1 && this._headers && !this._errorFlag) {
			header = header.toLowerCase();
			for (const i in this._headers) {
				if (i.toLowerCase() === header) {
					return this._headers[i];
				}
			}
		}

		return null;
	}

	public overrideMimeType(mime: string) {
		if (this._readyState === this.LOADING || this._readyState === this.DONE) {
			throw new Error("Failed to execute 'overrideMimeType' on 'XMLHttpRequest': " + 'MimeType cannot be overridden when the state is LOADING or DONE.');
		}

		this._overrideMimeType = mime;
	}
}

const statuses = {
	100: 'Continue',
	101: 'Switching Protocols',
	200: 'OK',
	201: 'Created',
	202: 'Accepted',
	203: 'Non - Authoritative Information',
	204: 'No Content',
	205: 'Reset Content',
	206: 'Partial Content',
	300: 'Multiple Choices',
	301: 'Moved Permanently',
	302: 'Found',
	303: 'See Other',
	304: 'Not Modified',
	305: 'Use Proxy',
	307: 'Temporary Redirect',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	406: 'Not Acceptable',
	407: 'Proxy Authentication Required',
	408: 'Request Timeout',
	409: 'Conflict',
	410: 'Gone',
	411: 'Length Required',
	412: 'Precondition Failed',
	413: 'Request Entity Too Large',
	414: 'Request - URI Too Long',
	415: 'Unsupported Media Type',
	416: 'Requested Range Not Satisfiable',
	417: 'Expectation Failed',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
	505: 'HTTP Version Not Supported',
};

export class FormData {
	private _data: Map<string, any>;

	constructor() {
		this._data = new Map<string, any>();
	}

	append(name: string, value: any) {
		this._data.set(name, value);
	}

	toString(): string {
		const arr = new Array<string>();

		this._data.forEach(function (value, name, map) {
			arr.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
		});

		return arr.join('&');
	}
}

// Blob and File are now provided by the runtime (Runtime.mm) with a complete
// File API spec implementation. We just need a helper to access internal bytes
// for XHR and FileReader operations.
// The runtime stores blob data using a Symbol accessible via globalThis.__BLOB_INTERNALS__

/**
 * Helper to access internal Blob buffer for XHR and FileReader.
 * Works with the runtime's Blob implementation which stores data
 * using the __BLOB_INTERNALS__ symbol.
 */
export const BlobInternalAccessor = {
	getBuffer(blob: Blob): Uint8Array {
		// Access the runtime's internal symbol for Blob data
		const internalsSymbol = (globalThis as any).__BLOB_INTERNALS__;
		if (internalsSymbol && blob[internalsSymbol]) {
			return blob[internalsSymbol].bytes;
		}
		// Fallback for any edge cases
		return new Uint8Array(0);
	},
};

// Re-export Blob and File from globalThis for backwards compatibility
// These are defined by the runtime
export const Blob = globalThis.Blob;
export const File = globalThis.File;

// Backwards compatibility: Add InternalAccessor to the exported Blob
// Some code may still reference Blob.InternalAccessor
if (Blob && !(Blob as any).InternalAccessor) {
	(Blob as any).InternalAccessor = {
		getBuffer(blob: Blob): Uint8Array {
			return BlobInternalAccessor.getBuffer(blob);
		},
	};
}

export class FileReader {
	public EMPTY = 0;
	public LOADING = 1;
	public DONE = 2;

	public onabort: (...args: any[]) => void;
	public onerror: (...args: any[]) => void;
	public onload: (...args: any[]) => void;
	public onloadend: (...args: any[]) => void;
	public onloadstart: (...args: any[]) => void;
	public onprogress: (...args: any[]) => void;

	private _readyState: number;
	private _result: string | ArrayBuffer | SharedArrayBuffer | null;

	private _listeners: Map<string, Array<Function>> = new Map<string, Array<Function>>();

	public get readyState(): number {
		return this._readyState;
	}

	public get result(): string | ArrayBuffer | SharedArrayBuffer | null {
		return this._result;
	}

	constructor() {
		//
	}

	private _array2base64(input: Uint8Array): string {
		const byteToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

		const output = [];

		for (let i = 0; i < input.length; i += 3) {
			const byte1 = input[i];
			const haveByte2 = i + 1 < input.length;
			const byte2 = haveByte2 ? input[i + 1] : 0;
			const haveByte3 = i + 2 < input.length;
			const byte3 = haveByte3 ? input[i + 2] : 0;

			const outByte1 = byte1 >> 2;
			const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
			let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
			let outByte4 = byte3 & 0x3f;

			if (!haveByte3) {
				outByte4 = 64;

				if (!haveByte2) {
					outByte3 = 64;
				}
			}

			output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
		}

		return output.join('');
	}

	private _read(blob, kind) {
		if (!(blob instanceof Blob)) {
			throw new TypeError(`Failed to execute '${kind}' on 'FileReader': parameter 1 is not of type 'Blob'.`);
		}

		this._result = '';

		setTimeout(() => {
			this._readyState = this.LOADING;
			this.emitEvent('load');
			this.emitEvent('loadend');
		});
	}

	private emitEvent(eventName: string, ...args: Array<any>) {
		if (isFunction(this['on' + eventName])) {
			this['on' + eventName](...args);
		}

		const handlers = this._listeners.get(eventName) || [];
		handlers.forEach((handler) => {
			handler(...args);
		});
	}

	public addEventListener(eventName: string, handler: Function) {
		if (['abort', 'error', 'load', 'loadend', 'loadstart', 'progress'].indexOf(eventName) === -1) {
			throw new Error('Event not supported: ' + eventName);
		}

		const handlers = this._listeners.get(eventName) || [];
		handlers.push(handler);
		this._listeners.set(eventName, handlers);
	}

	public removeEventListener(eventName: string, toDetach: Function) {
		let handlers = this._listeners.get(eventName) || [];
		handlers = handlers.filter((handler) => handler !== toDetach);
		this._listeners.set(eventName, handlers);
	}

	public readAsDataURL(blob: Blob) {
		this._read(blob, 'readAsDataURL');
		this._result = `data:${blob.type};base64,${this._array2base64(BlobInternalAccessor.getBuffer(blob))}`;
	}

	public readAsText(blob: Blob) {
		this._read(blob, 'readAsText');
		const textDecoder = new TextDecoder();
		this._result = textDecoder.decode(BlobInternalAccessor.getBuffer(blob));
	}

	public readAsArrayBuffer(blob: Blob) {
		this._read(blob, 'readAsArrayBuffer');
		this._result = BlobInternalAccessor.getBuffer(blob).buffer.slice(0);
	}

	public abort() {
		//
	}

	public toString() {
		return '[object FileReader]';
	}

	[Symbol.toStringTag] = 'FileReader';
}
