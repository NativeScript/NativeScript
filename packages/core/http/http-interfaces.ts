import type { ImageSource } from '../image-source';
import type { File } from '../file-system';
import type { BaseHttpContent } from './http-request-internal';

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
	content?: string | FormData | ArrayBuffer | Uint8Array<ArrayBufferLike>;

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
export interface HttpResponse<T = HttpContent> {
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
	content?: T;
}

export type Headers = { [key: string]: string | string[] };

export enum HttpResponseEncoding {
	UTF8,
	GBK,
}

export interface HttpContentHandler {
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

/**
 * Encapsulates the content of an HttpResponse.
 */
export interface HttpContent extends HttpContentHandler, BaseHttpContent {}
