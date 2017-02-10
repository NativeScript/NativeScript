//@private

declare module "http/http-request" {
    import * as http from "http";
    export var request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;
}
