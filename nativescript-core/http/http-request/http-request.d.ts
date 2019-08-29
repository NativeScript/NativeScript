/**
 * @module "http/http-request"
 */ /** */

import * as http from "..";
export const request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;
export function addHeader(headers: http.Headers, key: string, value: string): void;
