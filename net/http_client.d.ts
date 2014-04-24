/**
  * The http client interface.
  */
import image_module = require("Image/image");
import promises = require("promises/promises");

export declare function getString(url: string): promises.Promise<string>;
export declare function getJSON<T>(url: string): promises.Promise<T>;
export declare function getImage(url: string): promises.Promise<image_module.Image>;

export declare function request(options: HttpRequestOptions): promises.Promise<HttpResponse>;

export interface HttpRequestOptions {
    url: string;
    method: string;
    headers?: HttpHeader[];
    content?: HttpContent;
}

export interface HttpHeader {
    name: string;
    value: string;
}

export interface HttpResponse {
    statusCode: number;
    headers: HttpHeader[];
    content?: HttpContent;
}

export interface HttpContent {
    toString: () => string;
    toJSON: () => any;
    toImage: () => image_module.Image;
}