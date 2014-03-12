import image_module = require("Image/image");
// TODO: Not implemented for iOS

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
                try {
                    if (successCallback) {
                        // successCallback(result);
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }
                }
            }

            public downloadImage(url: string, successCallback: (image: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void) {
                try {
                    if (successCallback) {
                        // successCallback(response);
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