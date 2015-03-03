//@private

import http = require("http");

export declare var request: (options: http.HttpRequestOptions) => Promise<http.HttpResponse>;