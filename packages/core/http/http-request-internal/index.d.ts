import { HttpRequestOptions, HttpResponse, Headers, HttpResponseEncoding, HttpContentHandler } from '../http-interfaces';

export interface BaseHttpContent {
	/**
	 * Gets the response body as raw data.
	 */
	raw: any;
	/**
	 * Gets the request options URL.
	 */
	requestURL: string;
	/**
	 * Gets the response native image.
	 */
	toNativeImage: () => Promise<any>;
	/**
	 * Gets the response as native string.
	 */
	toNativeString: (encoding?: HttpResponseEncoding) => any;
}

/**
 * Makes a generic http request using the provided options and returns a HttpResponse Object.
 * @param options An object that specifies various request options.
 * @param contentHandler An object that specifies various functions to parse raw response content.
 */
export function requestInternal<T extends object>(options: HttpRequestOptions, contentHandler?: T): Promise<HttpResponse<BaseHttpContent & T>>;
export function addHeader(headers: Headers, key: string, value: string): void;
