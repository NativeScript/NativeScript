import { ImageSource } from '../image-source';
import { File } from '../file-system';
import * as httpRequest from './http-request';
export * from './http-request';

/**
 * Provides options for the http requests.
 */
export interface HttpRequestOptions {
	/**
	 * Gets or sets the request url.
	 */
	url: string;

	/**
	 * Gets or sets the request method.
	 */
	method: string;

	/**
	 * Gets or sets the request headers in JSON format.
	 */
	headers?: any;

	/**
	 * Gets or sets the request body.
	 */
	content?: string | FormData | ArrayBuffer;

	/**
	 * Gets or sets the request timeout in milliseconds.
	 */
	timeout?: number;

	/**
	 * Gets or sets whether to *not* follow server's redirection responses.
	 */
	dontFollowRedirects?: boolean;
}

/**
 * Encapsulates HTTP-response information from an HTTP-request.
 */
export interface HttpResponse {
	/**
	 * Gets the response status code.
	 */
	statusCode: number;

	/**
	 * Gets the response headers.
	 */
	headers: Headers;

	/**
	 * Gets the response content.
	 */
	content?: HttpContent;
}

export type Headers = { [key: string]: string | string[] };

export enum HttpResponseEncoding {
	UTF8,
	GBK,
}
/**
 * Encapsulates the content of an HttpResponse.
 */
export interface HttpContent {
	/**
	 * Gets the response body as raw data.
	 */
	raw: any;

	/**
	 * Gets the response body as ArrayBuffer
	 */
	toArrayBuffer: () => ArrayBuffer;

	/**
	 * Gets the response body as string.
	 */
	toString: (encoding?: HttpResponseEncoding) => string;

	/**
	 * Gets the response body as JSON object.
	 */
	toJSON: (encoding?: HttpResponseEncoding) => any;

	/**
	 * Gets the response body as ImageSource.
	 */
	toImage: () => Promise<ImageSource>;

	/**
	 * Gets the response body as file.
	 */
	toFile: (destinationFilePath?: string) => File;
}

export function getString(arg: any): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		httpRequest.request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const str = r.content.toString();
					resolve(str);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e)
		);
	});
}

export function getJSON<T>(arg: any): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		httpRequest.request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const json = r.content.toJSON();
					resolve(json);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e)
		);
	});
}

export function getImage(arg: any): Promise<ImageSource> {
	return new Promise<any>((resolve, reject) => {
		httpRequest.request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					resolve(r.content.toImage());
				} catch (err) {
					reject(err);
				}
			},
			(err) => {
				reject(err);
			}
		);
	});
}

export function getFile(arg: any, destinationFilePath?: string): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		httpRequest.request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const file = r.content.toFile(destinationFilePath);
					resolve(file);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e)
		);
	});
}

export function getBinary(arg: any): Promise<ArrayBuffer> {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		httpRequest.request(typeof arg === 'string' ? { url: arg, method: 'GET' } : arg).then(
			(r) => {
				try {
					const arrayBuffer = r.content.toArrayBuffer();
					resolve(arrayBuffer);
				} catch (e) {
					reject(e);
				}
			},
			(e) => reject(e)
		);
	});
}
