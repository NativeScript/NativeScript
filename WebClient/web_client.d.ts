import image_module = require("Image/image");
/**
 * Web (WebClient) module.
 */
export declare module tk {
    export module web {
        /**
          * The Client interface.
          */
        export class Client {
            downloadString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void)
            downloadImage(url: string, successCallback: (image: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void)
        }
    }
} 