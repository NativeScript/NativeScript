import { HttpRequestOptions, HttpResponse, Headers } from '..';
export const request: (options: HttpRequestOptions) => Promise<HttpResponse>;
export function addHeader(headers: Headers, key: string, value: string): void;
