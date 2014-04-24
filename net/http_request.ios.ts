/**
  * iOS specific http client implementation.
  */
import promises = require("promises/promises");
import http = require("net/http_request");

export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var sessionConfig = Foundation.NSURLSessionConfiguration.defaultSessionConfiguration();
        var queue = Foundation.NSOperationQueue.mainQueue();
        var session = Foundation.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
            sessionConfig, null, queue);

        var urlRequest = Foundation.NSMutableURLRequest.requestWithURL(
            Foundation.NSURL.URLWithString(options.url));

        urlRequest.setHTTPMethod(options.method);

        if (options.headers && options.headers.length) {
            for (var i = 0, l = options.headers.length; i < l; i++) {
                var header = options.headers[i];

                urlRequest.setValueForHTTPHeaderField(header.name, header.value);
            }
        }

        if (typeof options.content == "string") {
            urlRequest.setHTTPBody(Foundation.NSString.initWithString(options.content).dataUsingEncoding(4));
        }

        var dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest,
            function (data, response, error) {
                if (error) {
                    d.reject(new Error(error.localizedDescription()));
                } else {

                    var headers = new Array<http.HttpHeader>();
                    var headerFields = response.allHeaderFields();
                    var keys = headerFields.allKeys();

                    for (var i = 0, l = keys.count(); i < l; i++) {
                        var key = keys.objectAtIndex(i);

                        headers.push({ name: key, value: headerFields.valueForKey(key) });
                    }

                    d.resolve({
                        content: {
                            toString: () => { return NSDataToString(data); },
                            toJSON: () => { return JSON.parse(NSDataToString(data)); },
                            toImage: () => { return require("Image/image").Image.imageFromData(data); }
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
