/**
 * Contains the Cache class, which handles image download requests and caches the already downloaded images.
 */
declare module "ui/image-cache" {
    import observable = require("data/observable");
    import imageSource = require("image-source");

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
        completed?: (result: imageSource.ImageSource, key: string) => void;
    }

    /**
     * Represents a class that stores handles image download requests and caches the already downloaded images.
     */
    export class Cache extends observable.Observable {
        /**
         * The image to be used when the requested url is invalid or the result may not be decoded.
         */
        invalid: imageSource.ImageSource;
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
        get(key: string): imageSource.ImageSource;
        /**
         * Sets the image for the specified key.
         */
        set(key: string, source: imageSource.ImageSource): void;
        /**
         * Removes the cache for the specified key.
         */
        remove(key: string): void;
        /**
         * Removes all the previously cached images.
         */
        clear(): void;

        //@private
        _downloadCore(request: DownloadRequest);
        _onDownloadCompleted(key: string, result: imageSource.ImageSource);
        //@endprivate
    }

    /**
     * Defines an enum with events specific for image-cache class.
     */
    export module knownEvents {
        /**
         * Raised when the image has been downloaded.
         */
        export var downloaded: string;
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