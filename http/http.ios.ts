/**
  * iOS specific http request implementation.
  */
import promises = require("promises/promises");
import http = require("http");

declare var exports;
require("utils/module-merge").merge(require("http/http-common"), exports);

export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var sessionConfig = Foundation.NSURLSessionConfiguration.defaultSessionConfiguration();
        var queue = Foundation.NSOperationQueue.mainQueue();
        var session = Foundation.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
            sessionConfig, null, queue);

        var urlRequest = Foundation.NSMutableURLRequest.requestWithURL(
            Foundation.NSURL.URLWithString(options.url));

        urlRequest.setHTTPMethod(typeof options.method !== "undefined" ? options.method : "GET");

        if (options.headers) {
            for (var header in options.headers) {
                urlRequest.setValueForHTTPHeaderField(options.headers[header], header);
            }
        }

        if (typeof options.timeout == "number") {
            urlRequest.setTimeoutInterval(options.timeout * 1000);
        }

        if (typeof options.content == "string") {
            urlRequest.setHTTPBody(Foundation.NSString.initWithString(options.content).dataUsingEncoding(4));
        }
        else {
            urlRequest.setHTTPBody(options.content);
        }

        var dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest,
            function (data, response, error) {
                if (error) {
                    d.reject(new Error(error.localizedDescription()));
                } else {
                    var headers = {};
                    var headerFields = response.allHeaderFields();
                    var keys = headerFields.allKeys();

                    for (var i = 0, l = keys.count(); i < l; i++) {
                        var key = keys.objectAtIndex(i);
                        headers[key] = headerFields.valueForKey(key);
                    }

                    d.resolve({
                        content: {
                            raw: data,
                            toString: () => { return NSDataToString(data); },
                            toJSON: () => { return JSON.parse(NSDataToString(data)); },
                            toImage: () => { return require("image-source").fromData(data); }
                        },
                        statusCode: response.statusCode(),
                        headers: headers
                    });
                }
            });

        dataTask.resume();
    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}

function NSDataToString(data: any): string {
    return Foundation.NSString.initWithDataEncoding(data, 4).toString();
}
