import { HttpRequestOptions, HttpResponse, Headers } from '../http-interfaces';
/**
 * Makes a generic http request using the provided options and returns a HttpResponse Object.
 * @param options An object that specifies various request options.
 */
export const request: (options: HttpRequestOptions) => Promise<HttpResponse>;
export function addHeader(headers: Headers, key: string, value: string): void;
