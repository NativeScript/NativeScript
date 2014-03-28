/**
  * iOS specific WebClient implementation.
  */

import image_module = require("Image/image");

export class Client {
    /**
      * Downloads string from url.
      */
    public getString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void) {
        try {
            Client.get(url, function (data) {
                if (successCallback) {
                    successCallback(Foundation.NSString.initWithDataEncoding(data, 4));
                }
            }, errorCallback);
        } catch (ex) {
            if (errorCallback) {
                errorCallback(ex);
            }
        }
    }

    public getJSON(url: string, successCallback: (result: Object) => void, errorCallback?: (e: Error) => void) {
        try {
            this.getString(url, function (data) {
                if (successCallback) {
                    successCallback(JSON.parse(data));
                }
            }, errorCallback);
        } catch (ex) {
            if (errorCallback) {
                errorCallback(ex);
            }
        }
    }

    public getImage(url: string, successCallback: (result: image_module.Image) => void, errorCallback?: (e: Error) => void) {
        Client.get(url, function (data) {
            if (successCallback) {
                var image = new image_module.Image();
                image.loadFromData(data);
                successCallback(image);
            }
        }, errorCallback);
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
