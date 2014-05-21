//@private
import promises = require("promises");
import http = require("http");

export declare var request: (options: http.HttpRequestOptions) => promises.Promise<http.HttpResponse>;