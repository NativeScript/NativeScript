/**
 * Allows you to send web requests and receive the responses.
 */
declare module "http" {
    import image = require("image-source");
    

   /**
    * Downloads the content from the specified URL as a string.
    * @param url The URL to request from.
    */
    export function getString(url: string): Promise<string>

   /**
    * Downloads the content from the specified URL as a string.
    * @param options An object that specifies various request options.
    */
    export function getString(options: HttpRequestOptions): Promise<string>

   /**
    * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
    * @param url The URL to request from.
    */
    export function getJSON<T>(url: string): Promise<T>

   /**
    * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
    * @param options An object that specifies various request options.
    */
    export function getJSON<T>(options: HttpRequestOptions): Promise<T>

   /**
    * Downloads the content from the specified URL and attempts to decode it as an image.
    * @param url The URL to request from.
    */
    export function getImage(url: string): Promise<image.ImageSource>

   /**
    * Downloads the content from the specified URL and attempts to decode it as an image.
    * @param options An object that specifies various request options.
    */
    export function getImage(options: HttpRequestOptions): Promise<image.ImageSource>

   /**
    * Makes a generic http request using the provided options and returns a HttpResponse Object.
    * @param options An object that specifies various request options.
    */
    export function request(options: HttpRequestOptions): Promise<HttpResponse>;

   /**
    * Provides options for the http requests.
    */
    export interface HttpRequestOptions {
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
        content?: string | FormData;

         /**
          * Gets or sets the request timeout in milliseconds.
          */
        timeout?: number;
    }

   /**
    * Encapsulates HTTP-response information from an HTTP-request.
    */
    export interface HttpResponse {
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
    export interface HttpContent {
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
        toImage: () => Promise<image.ImageSource>;
    }
}