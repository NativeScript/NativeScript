//@private

declare module "http/http-request" {
    import http = require("http");

    export var request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;
}
