/**
 * Contains the Cache class, which handles image download requests and caches the already downloaded images.
 */
declare module "ui/image-cache" {
    import * as observable from "data/observable";
    import * as imageSource from "image-source";

    /**
     * Represents a single download request.
     */
    export interface DownloadRequest {
        /**
         * The url of the image.
         */
        url: string;
        /**
         * The key used to cache the image.
         */
        key: string;
        /**
         * An optional function to be called when the download is complete.
         */
        completed?: (image: any, key: string) => void;
    }

    /**
     * Represents a class that stores handles image download requests and caches the already downloaded images.
     */
    export class Cache extends observable.Observable {
        /**
         * String value used when hooking to downloaded event.
         */
        public static downloadedEvent: string;
        /**
         * The image to be used to notify for a pending download request - e.g. loading indicator.
         */
        placeholder: imageSource.ImageSource;
        /**
         * The maximum number of simultaneous download requests. Defaults to 5.
         */
        maxRequests: number;

        /**
         * Enables previously suspended download requests.
         */
        enableDownload(): void;
        /**
         * Temporary disables download requests.
         */
        disableDownload(): void;

        /**
         * Adds a new download request at the top of the download queue. This will be the next immediate download to start.
         */
        push(request: DownloadRequest);
        /**
         * Adds a new download request at the end of the download queue. This will be the last download to start.
         */
        enqueue(request: DownloadRequest);

        /**
         * Gets the image for the specified key. May be undefined if the key is not present in the cache.
         */
        get(key: string): any;
        /**
         * Sets the image for the specified key.
         */
        set(key: string, image: any): void;
        /**
         * Removes the cache for the specified key.
         */
        remove(key: string): void;
        /**
         * Removes all the previously cached images.
         */
        clear(): void;

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (args: observable.EventData) => void , thisArg?: any);

        /**
         * Raised when the image has been downloaded.
         */
        on(event: "downloaded", callback: (args: DownloadedData) => void , thisArg?: any);

        //@private
        _downloadCore(request: DownloadRequest);
        _onDownloadCompleted(key: string, image: any);
        //@endprivate
    }

    /**
     * Provides data for downloaded event.
     */
    export interface DownloadedData extends observable.EventData {
        /**
         * A string indentifier of the cached image.
         */
        key: string;
        /**
         * Gets the cached image.
         */
        image: imageSource.ImageSource;
    }
} 