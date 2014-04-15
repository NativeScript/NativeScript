/**
  * The http client interface.
  */
import image_module = require("Image/image");
import promises = require("promises/promises");

export declare class http {
    private static getString(url: string): promises.Promise;
    private static getJSON(url: string): promises.Promise;
    private static getImage(url: string): promises.Promise;
}