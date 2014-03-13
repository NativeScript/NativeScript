import image_module = require("Image/image");

export module tk {
    export module web {
        /**
          * iOS specific WebClient implementation.
          */
        export class Client {
            /**
              * Downloads string from url.
              */
            public downloadString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void) {
                Client.getDataFromUrl(url, function (data) {
                    if (successCallback) {
                        successCallback(Foundation.NSString.initWithDataEncoding(data, 4));
                    }
                }, errorCallback);
            }

            public downloadImage(url: string, successCallback: (image: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void) {
                Client.getDataFromUrl(url, function (data) {
                    if (successCallback) {
                        var image = new image_module.tk.ui.Image();
                        image.loadFromData(data);
                        successCallback(image);
                    }
                }, errorCallback);
            }

            private static getDataFromUrl(url: string, successCallback: (result: any) => void, errorCallback?: (e: Error) => void)
            {
                try {
                    var sessionConfig = Foundation.NSURLSessionConfiguration.defaultSessionConfiguration();
                    var queue = Foundation.NSOperationQueue.mainQueue();
                    var session = Foundation.NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);
                    var dataTask = session.dataTaskWithURLCompletionHandler(Foundation.NSURL.URLWithString(url), function (data, response, error) {
                        if (error) {
                            if (errorCallback) {
                                errorCallback(error.description);
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
        }
    }
} 