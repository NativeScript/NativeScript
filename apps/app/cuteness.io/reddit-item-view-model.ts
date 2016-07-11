import {Observable} from "data/observable";
import {ImageSource, fromFile as imageSourceFromFile, fromUrl as imageSourceFromUrl} from "image-source";

import {ItemData} from "./reddit-model";
import {defaultThumbnailImageSource, defaultNoThumbnailImageSource, cache} from "./reddit-app-view-model";

var firstThumbnailImageSource = imageSourceFromFile("~/cuteness.io/res/first-image.png");
var defaultImageSource = imageSourceFromFile("~/cuteness.io/res/reddit-logo-transparent.png");

var ISLOADING = "isLoading";
var THUMBNAIL_IMAGE = "thumbnailImage";
var IMAGE_SOURCE = "imageSource";

export class RedditViewModel extends Observable {

    private _source: ItemData;
    constructor(source: ItemData) {
        super();

        this._source = source;

        if (this._source) {
            var property: string;
            for (property in this._source) {
                this.set(property, this._source[property]);
            }
        }
    }

    get source(): ItemData {
        return this._source;
    }

    private _isLoading = false;
    get isLoading(): boolean {
        return this._isLoading;
    }
    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: ISLOADING, value: value });
        }
    }

    get thumbnailImage(): ImageSource {
        if (!this._source) {
            return defaultThumbnailImageSource;
        }

        if (this._source.title === "reddit 101") {
            return firstThumbnailImageSource;
        }

        var url = this._source.thumbnail;

        if (!_isValidImageUrl(url)) {
            return defaultNoThumbnailImageSource
        }

        var image = cache.get(url);
        if (image) {
            return image;
        }

        this.isLoading = true;
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    this.isLoading = false;
                    this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: THUMBNAIL_IMAGE, value: image });
                }
            }
        });

        return defaultThumbnailImageSource;
    }

    get imageSource(): ImageSource {
        if (this._source) {
            var url;
            try {
                url = (<any>this._source).preview.images[0].source.url;
            }
            catch (e) {
                url = this._source.url;
            }

            if (_isValidImageUrl(url)) {

                this.isLoading = true;

                imageSourceFromUrl(url).then(result => {
                    this.isLoading = false;
                    this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: IMAGE_SOURCE, value: result });
                });
            }
        }

        return defaultImageSource;
    }
}

function _isValidImageUrl(url: string): boolean {
    return url && (url.indexOf(".png") !== -1 || url.indexOf(".jpg") !== -1);
}
