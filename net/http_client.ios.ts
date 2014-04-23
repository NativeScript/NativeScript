/**
  * iOS specific http client implementation.
  */
import image = require("Image/image");
import promises = require("promises/promises");
import http = require("net/http_client");

/*
// merge common
import http_common = require("net/http_common");
declare var exports;
exports.getString = http_common.getString;
exports.getJSON = http_common.getJSON;
exports.getImage = http_common.getImage;
*/

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

        if (typeof (options.body) == "string") {
            urlRequest.setHTTPBody(Foundation.NSString.initWithString(options.body).dataUsingEncoding(4));
        }

        var dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest,
            function (data, response, error) {
                if (error) {
                    d.reject(error);
                } else {

                    var headers = new Array<http.HttpHeader>();
                    var headerFields = response.allHeaderFields();
                    var keys = headerFields.allKeys();

                    for (var i = 0, l = keys.count(); i < l; i++) {
                        var key = keys.objectAtIndex(i);

                        headers.push({ name: key, value: headerFields.valueForKey(key) });
                    }

                    d.resolve({
                        body: {
                            toString: () => { return NSDataToString(data); },
                            toJSON: () => { return JSON.parse(NSDataToString(data)); },
                            toImage: () => { return image.Image.imageFromData(data); }
                        },
                        statusCode: response.statusCode,
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
