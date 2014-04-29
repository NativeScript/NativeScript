/**
  * The http client interface.
  */
import image_module = require("Image/image");
import promises = require("promises/promises");

export declare function request(options: HttpRequestOptions): promises.Promise<HttpResponse>;

export interface HttpRequestOptions {
    url: string;
    method: string;
    headers?: any;
    content?: any;
    timeout?: number;
}

export interface HttpResponse {
    statusCode: number;
    headers: any;
    content?: HttpContent;
}

export interface HttpContent {
    raw: any;
    toString: () => string;
    toJSON: () => any;
    toImage: () => image_module.Image;
}