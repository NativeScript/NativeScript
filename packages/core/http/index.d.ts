import { ImageSource } from '../image-source';
import { File } from '../file-system';

/**
 * Downloads the content from the specified URL as a string.
 * @param url The URL to request from.
 */
export function getString(url: string): Promise<string>;

/**
 * Downloads the content from the specified URL as a string.
 * @param options An object that specifies various request options.
 */
export function getString(options: HttpRequestOptions): Promise<string>;

/**
 * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
 * @param url The URL to request from.
 */
export function getJSON<T>(url: string): Promise<T>;

/**
 * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
 * @param options An object that specifies various request options.
 */
export function getJSON<T>(options: HttpRequestOptions): Promise<T>;

/**
 * Downloads the content from the specified URL and attempts to decode it as an image.
 * @param url The URL to request from.
 */
export function getImage(url: string): Promise<ImageSource>;

/**
 * Downloads the content from the specified URL and attempts to decode it as an image.
 * @param options An object that specifies various request options.
 */
export function getImage(options: HttpRequestOptions): Promise<ImageSource>;

/**
 * Downloads the content from the specified URL and attempts to save it as file.
 * @param url The URL to request from.
 * @param destinationFilePath Optional. The downloaded file path.
 */
export function getFile(url: string, destinationFilePath?: string): Promise<File>;

/**
 * Downloads the content from the specified URL and attempts to save it as file.
 * @param options An object that specifies various request options.
 * @param destinationFilePath Optional. The downloaded file path.
 */
export function getFile(options: HttpRequestOptions, destinationFilePath?: string): Promise<File>;

/**
 * Downloads the content from the specified URL as binary and returns an ArrayBuffer.
 * @param url The URL to request from.
 */
export function getBinary(url: string): Promise<ArrayBuffer>;

/**
 * Downloads the content from the specified URL as binary and returns an ArrayBuffer.
 * @param options An object that specifies various request options.
 */
export function getBinary(options: HttpRequestOptions): Promise<ArrayBuffer>;

/**
 * Makes a generic http request using the provided options and returns a HttpResponse Object.
 * @param options An object that specifies various request options.
 */
export function request(options: HttpRequestOptions): Promise<HttpResponse>;

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
	 * Gets or sets wether to *not* follow server's redirection responses.
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
