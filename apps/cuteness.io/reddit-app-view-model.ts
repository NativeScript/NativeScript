import imageSource = require("image-source");
import virtualArray = require("data/virtual-array");
import http = require("http");
import observable = require("data/observable");
import imageCache = require("ui/image-cache");

import redditModel = require("./reddit-model");
import redditViewModel = require("./reddit-item-view-model");

var aboutText = "Cuteness is a proof of concept app demonstrating the Telerik's NativeScript for writing native mobile applications using JavaScript.";
export var defaultThumbnailImageSource = imageSource.fromFile("~/res/reddit-logo.png");
export var defaultNoThumbnailImageSource = imageSource.fromFile("~/res/no-image.png");

var redditUrl = "http://www.reddit.com/r/aww.json?limit=";
var after: string;
var ISSCROLLING = "isLoading";

// initialize the image cache for the main list
export var cache = new imageCache.Cache();
cache.placeholder = defaultThumbnailImageSource;
cache.maxRequests = 5;

export class AppViewModel extends observable.Observable {

    private _redditItems: virtualArray.VirtualArray<redditViewModel.RedditViewModel>;
    get redditItems(): virtualArray.VirtualArray<redditViewModel.RedditViewModel> {
        if (!this._redditItems) {
            this._redditItems = new virtualArray.VirtualArray<redditViewModel.RedditViewModel>(1000);
            this._redditItems.loadSize = 50;
            this._redditItems.on(virtualArray.VirtualArray.itemsLoadingEvent, (args: virtualArray.ItemsLoading) => {

                http.getJSON<redditModel.Data>(redditUrl + args.count +
                    (after ? "&after=" + after : "")).then(result => {

                        var itemsToLoad = result.data.children.map(i=> {
                            return new redditViewModel.RedditViewModel(i.data);
                        });

                        this._redditItems.load(args.index, itemsToLoad);

                        var lastItem = itemsToLoad[itemsToLoad.length - 1];
                        if (lastItem) {
                            after = itemsToLoad[itemsToLoad.length - 1].source.name;
                        }

                    }, (e) => { console.log(e.message) })
                    .catch(function(e) {
                        setTimeout(function() { throw e; });
                    });
;
            });
        }

        return this._redditItems;
    }

    private _isScrolling = false;
    get isScrolling(): boolean {
        return this._isScrolling;
    }
    set isScrolling(value: boolean) {
        if (this._isScrolling !== value) {
            this._isScrolling = value;

            if (value) {
                cache.disableDownload();
            }
            else {
                cache.enableDownload();
            }

            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: ISSCROLLING, value: value });
        }
    }

    get aboutText(): string {
        return aboutText;
    }

    get defaultThumbnailImageSource(): imageSource.ImageSource {
        return defaultThumbnailImageSource;
    }

    get defaultNoThumbnailImageSource(): imageSource.ImageSource {
        return defaultNoThumbnailImageSource;
    }
}
