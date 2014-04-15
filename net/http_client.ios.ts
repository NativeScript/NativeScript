/**
  * iOS specific http client implementation.
  */

import image_module = require("Image/image");
import promises = require("promises/promises");

export class http {
    /**
      * Gets string from url.
      */
    public static getString(url : string) : promises.Promise {
        var d = new promises.Deferred();
        http.get(url, r => d.resolve(Foundation.NSString.initWithDataEncoding(r, 4).toString()), e => d.reject(e));
        return d.promise();
    }

    /**
      * Gets JSON from url.
      */
    public static getJSON(url: string) : promises.Promise {
        var d = new promises.Deferred();
        http.get(url, r => d.resolve(JSON.parse(Foundation.NSString.initWithDataEncoding(r, 4).toString())), e => d.reject(e));
        return d.promise();
    }

    /**
      * Gets image from url.
      */
    public static getImage(url: string) : promises.Promise {
        var d = new promises.Deferred();
        http.get(url, r => {
            var image = new image_module.Image();
            image.loadFromData(r);
            d.resolve(image);
        }, e => d.reject(e));
        return d.promise();
    }

    private static get(url: string, successCallback: (result: any) => void, errorCallback?: (e: Error) => void) {
        try {
            var sessionConfig = Foundation.NSURLSessionConfiguration.defaultSessionConfiguration();
            var queue = Foundation.NSOperationQueue.mainQueue();
            var session = Foundation.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);
            var dataTask = session.dataTaskWithURLCompletionHandler(Foundation.NSURL.URLWithString(url), function (data, response, error) {
                if (error) {
                    if (errorCallback) {
                        errorCallback(new Error(error.localizedDescription()));
                    }
                } else if (successCallback) {
                    successCallback(data);
                }
            });

            dataTask.resume();
            session.finishTasksAndInvalidate();
        } catch (ex) {
            if (errorCallback) {
                errorCallback(ex);
            }
        }
    }

    private static post(url: string, postData: string, successCallback?: (result: any) => void, errorCallback?: (e: Error) => void) {
        try {
            var sessionConfig = Foundation.NSURLSessionConfiguration.defaultSessionConfiguration();
            var queue = Foundation.NSOperationQueue.mainQueue();
            var session = Foundation.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);

            var urlRequest = Foundation.NSMutableURLRequest.requestWithURL(Foundation.NSURL.URLWithString(url));
            urlRequest.setHTTPMethod("POST");
            urlRequest.setHTTPBody(Foundation.NSString.initWithString(postData).dataUsingEncoding(4));

            var dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest, function (data, response, error) {
                if (error) {
                    if (errorCallback) {
                        errorCallback(new Error(error.localizedDescription()));
                    }
                } else if (successCallback) {
                    successCallback(data);
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
