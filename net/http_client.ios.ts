/**
  * iOS specific http client implementation.
  */
import http_client = require("net/http_client");
import image_module = require("Image/image");
import promises = require("promises/promises");

export class http {
    /**
      * Gets string from url.
      */
    public static getString(url: string): promises.Promise<string> {
        var d = promises.defer<string>();

        http.request({ url: url, method: "GET" },
            r => d.resolve(Foundation.NSString.initWithDataEncoding(r.body, 4).toString()),
            e => d.reject(e));

        return d.promise();
    }

    /**
      * Gets JSON from url.
      */
    public static getJSON<T>(url: string): promises.Promise<T> {
        var d = promises.defer<T>();

        http.request({ url: url, method: "GET" },
            r => d.resolve(JSON.parse(Foundation.NSString.initWithDataEncoding(r.body, 4).toString())),
            e => d.reject(e));

        return d.promise();
    }

    /**
      * Gets image from url.
      */
    public static getImage(url: string): promises.Promise<image_module.Image> {
        var d = promises.defer<image_module.Image>();

        http.request({ url: url, method: "GET" },
            r => {
                var image = new image_module.Image();
                image.loadFromData(r.body);
                d.resolve(image);
            },
            e => d.reject(e));

        return d.promise();
    }

    private static request(options: http_client.IHttpRequestOptions,
        successCallback: (r: http_client.IHttpResponse) => void,
        errorCallback?: (e: Error) => void) {

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
                        if (errorCallback) {
                            errorCallback(new Error(error.localizedDescription()));
                        }
                    } else if (successCallback) {

                        var headers = new Array<http_client.IHttpHeader>();
                        var headerFields = response.allHeaderFields();
                        var keys = headerFields.allKeys();

                        for (var i = 0, l = keys.count(); i < l; i++) {
                            var key = keys.objectAtIndex(i);

                            headers.push({ name: key, value: headerFields.valueForKey(key) });
                        }

                        successCallback(
                            {
                                body: data,
                                statusCode: response.statusCode,
                                headers: headers
                            });
                    }
                });

            dataTask.resume();
        } catch (ex) {
            if (errorCallback) {
                errorCallback(ex);
            }
        }

    }
}
