//@private

declare module "http/http-request" {
    import { HttpResponse, HttpRequestOptions, Headers } from "http";
    export var request: (options: HttpRequestOptions) => Promise<HttpResponse>;
    export function addHeader(headers: Headers, key: string, value: string): void;
}
