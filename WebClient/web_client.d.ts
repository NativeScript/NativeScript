/**
  * The Client interface.
  */
import image_module = require("Image/image");

export declare class Client {
    private static get(url: string, successCallback?: (result: any) => void, errorCallback?: (e: Error) => void)
    getString(url: string, successCallback?: (result: string) => void, errorCallback?: (e: Error) => void)
    getJSON(url: string, successCallback?: (result: Object) => void, errorCallback?: (e: Error) => void)
    getImage(url: string, successCallback?: (result: image_module.Image) => void, errorCallback?: (e: Error) => void)
}