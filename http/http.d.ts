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

    /**
    * Provides options for the http requests.
    */
    interface HttpRequestOptions {
        /**
          * Gets or sets the request url.
          */
        url: string;

        /**
          * Gets or sets the request method.
          */
        method: string;

        /**
          * Gets or sets the request headers in JSON format.
          */
        headers?: any;

        /**
          * Gets or sets the request body.
          */
        content?: any;

        /**
          * Gets or sets the request timeout.
          */
        timeout?: number;
    }

    /**
    * Encapsulates HTTP-response information from an HTTP-request.
    */
    interface HttpResponse {
        /**
        * Gets the response status code.
        */
        statusCode: number;

        /**
        * Gets the response headers.
        */
        headers: any;

        /**
        * Gets the response content.
        */
        content?: HttpContent;
    }

    /**
    * Encapsulates the content of an HttpResponse.
    */
    interface HttpContent {
        /**
        * Gets the response body as raw data.
        */
        raw: any;

        /**
        * Gets the response body as string.
        */
        toString: () => string;

        /**
        * Gets the response body as JSON object.
        */
        toJSON: () => any;

        /**
        * Gets the response body as ImageSource.
        */
        toImage: () => image.ImageSource;
    }
}