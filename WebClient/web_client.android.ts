import image_module = require("Image/image");

export module tk {
    export module web {
        /**
          * Android specific WebClient implementation.
          */
        export class Client {
            /**
              * Downloads string from url.
              */
            public getString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void) {
                try {
                    if (successCallback) {
                        var httpClient = new org.apache.http.impl.client.DefaultHttpClient();
                        var httpGet = new org.apache.http.client.methods.HttpGet(url);
                        var responseHandler = new org.apache.http.impl.client.BasicResponseHandler();
                        var responseBody = httpClient.execute(httpGet, responseHandler);

                        successCallback(responseBody);
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }

            public getImage(url: string, successCallback: (result: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void) {
                try {
                    if (successCallback) {
                        var image = new image_module.tk.ui.Image();
                        image.loadFromData(new java.net.URL(url).getContent());
                        successCallback(image);
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }
        }
    }
}