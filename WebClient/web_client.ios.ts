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

            public getImage(url: string, successCallback: (result: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void) {
                Client.get(url, function (data) {
                    if (successCallback) {
                        var image = new image_module.tk.ui.Image();
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