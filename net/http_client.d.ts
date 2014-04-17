/**
  * The http client interface.
  */
import image_module = require("Image/image");
import promises = require("promises/promises");

export declare class http {
    static getString(url: string): promises.Promise<string>;
    static getJSON<T>(url: string): promises.Promise<T>;
    static getImage(url: string): promises.Promise<image_module.Image>;

    static request(options: IHttpRequestOptions, successCallback: (r: IHttpResponse) => void, errorCallback?: (e: Error) => void);
}

export interface IHttpRequestOptions {
    url: string;
    method: string;
    headers?: IHttpHeader[];
    body?: string;
}

export interface IHttpHeader {
    name: string;
    value: string;
}

export interface IHttpResponse {
    statusCode: number;
    headers: IHttpHeader[];
    body: any;
}