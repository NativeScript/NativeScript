declare module "http" {
    import image = require("image-source");
    import promises = require("promises");

    /**
    * Downloads the content from the specified URL as a string.
    * @param url The URL to request from.
    */
    function getString(url: string): promises.Promise<string>

    /**
    * Downloads the content from the specified URL as a string.
    * @param options An object that specifies various request options.
    */
    function getString(options: HttpRequestOptions): promises.Promise<string>

    /**
    * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
    * @param url The URL to request from.
    */
    function getJSON<T>(url: string): promises.Promise<T>

    /**
    * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
    * @param options An object that specifies various request options.
    */
    function getJSON<T>(options: HttpRequestOptions): promises.Promise<T>

    /**
    * Downloads the content from the specified URL and attempts to decode it as an image.
    * @param url The URL to request from.
    */
    function getImage(url: string): promises.Promise<image.ImageSource>

    /**
    * Downloads the content from the specified URL and attempts to decode it as an image.
    * @param options An object that specifies various request options.
    */
    function getImage(options: HttpRequestOptions): promises.Promise<image.ImageSource>

    /**
    * Makes a generic http request using the provided options and returns a HttpResponse Object.
    * @param options An object that specifies various request options.
    */
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
        // TODO: Isn't parseJSON better naming? toJSON sounds to me like we will return a string object
        toJSON: () => any;
        toImage: () => image.ImageSource;
    }
}