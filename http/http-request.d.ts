//@private

declare module "http/http-request" {
    import http = require("http");

    export var domainDebugger: any;
    export var request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;
}
