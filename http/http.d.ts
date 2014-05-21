
declare module "http" {
    import image = require("image-source");
    import promises = require("promises/promises");

    function getString(url: string): promises.Promise<string>
    function getString(options: HttpRequestOptions): promises.Promise<string>

    function getJSON<T>(url: string): promises.Promise<T>
    function getJSON<T>(options: HttpRequestOptions): promises.Promise<T>

    function getImage(url: string): promises.Promise<image.ImageSource>
    function getImage(options: HttpRequestOptions): promises.Promise<image.ImageSource>

    function request(options: HttpRequestOptions): promises.Promise<HttpResponse>;

    interface HttpRequestOptions {
        url: string;
        method: string;
        headers?: any;
        content?: any;
        timeout?: number;
    }

    interface HttpResponse {
        statusCode: number;
        headers: any;
        content?: HttpContent;
    }

    interface HttpContent {
        raw: any;
        toString: () => string;
        toJSON: () => any;
        toImage: () => image.ImageSource;
    }
}