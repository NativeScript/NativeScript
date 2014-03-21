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
            private static get(url: string, successCallback: (result: any) => void, errorCallback?: (e: Error) => void)
            getString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void)
            getJSON(url: string, successCallback: (result: Object) => void, errorCallback?: (e: Error) => void)
            getImage(url: string, successCallback: (result: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void)
        }
    }
} 