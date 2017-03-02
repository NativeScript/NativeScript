//@private

import * as http from "..";
export var request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;
export function addHeader(headers: http.Headers, key: string, value: string): void;
