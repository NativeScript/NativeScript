/**
  * The http client interface.
  */
import image_module = require("Image/image");
import promises = require("promises/promises");

export declare class http {
    static getString(url: string): promises.Promise<string>;
    static getJSON<T>(url: string): promises.Promise<T>;
    static getImage(url: string): promises.Promise<image_module.Image>;
}