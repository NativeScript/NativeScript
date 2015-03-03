import observable = require("data/observable");
import imageSource = require("image-source");

import redditModel = require("./reddit-model");
import redditAppViewModel = require("./reddit-app-view-model");

var firstThumbnailImageSource = imageSource.fromFile("~/app/res/first-image.png");
var defaultImageSource = imageSource.fromFile("~/app/res/reddit-logo-transparent.png");

var ISLOADING = "isLoading";
var THUMBNAIL_IMAGE_SOURCE = "thumbnailImageSource";
var IMAGE_SOURCE = "imageSource";

export class RedditViewModel extends observable.Observable {

    private _source: redditModel.ItemData;
    constructor(source: redditModel.ItemData) {
        super();

        this._source = source;

        if (this._source) {
            var property: string;
            for (property in this._source) {
                this.set(property, this._source[property]);
            }
        }
    }

    get source(): redditModel.ItemData {
        return this._source;
    }

    private _isLoading = false;
    get isLoading(): boolean {
        return this._isLoading;
    }
    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: ISLOADING, value: value });
        }
    }

    private _thumbnailImageSource: imageSource.ImageSource;
    get thumbnailImageSource(): imageSource.ImageSource {
        if (this._source) {
            if (this._source.title === "reddit 101") {
                this._thumbnailImageSource = firstThumbnailImageSource;
            } else if (redditAppViewModel.cache) {
                var url = this._source.thumbnail;

                var imgSource = redditAppViewModel.cache.get(url);

                if (imgSource) {
                    this._thumbnailImageSource = imgSource;
                }
                else if (_isValidImageUrl(url)) {
                    this.isLoading = true;

                    redditAppViewModel.cache.push({
                        key: url,
                        url: url,
                        completed: (result: imageSource.ImageSource, key: string) => {
                            if (url === key) {
                                this.isLoading = false;
                                this._thumbnailImageSource = result;
                                this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: THUMBNAIL_IMAGE_SOURCE, value: result });
                            }
                        }
                    });
                } else {
                    this._thumbnailImageSource = redditAppViewModel.defaultNoThumbnailImageSource;
                }
            }
        }

        return this._thumbnailImageSource || redditAppViewModel.defaultThumbnailImageSource;
    }

    get imageSource(): imageSource.ImageSource {
        if (this._source) {
            var url = this._source.url;

            if (_isValidImageUrl(url)) {

                this.isLoading = true;

                imageSource.fromUrl(url).then(result => {
                    this.isLoading = false;
                    this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: IMAGE_SOURCE, value: result });
                });
            }
        }

        return defaultImageSource;
    }
}

function _isValidImageUrl(url: string): boolean {
    return url && (url.indexOf(".png") !== -1 || url.indexOf(".jpg") !== -1);
}
