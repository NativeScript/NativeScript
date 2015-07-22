import {ImageSource, fromFile as imageSourceFromFile} from "image-source";
import {VirtualArray, ItemsLoading as virtualArrayItemsLoadingData} from "data/virtual-array";
import {Observable} from "data/observable";
import {Cache as ImageCache} from "ui/image-cache";

import {Data as RedditData} from "./reddit-model";
import {RedditViewModel} from "./reddit-item-view-model";

var aboutText = "Cuteness is a proof of concept app demonstrating the Telerik's NativeScript for writing native mobile applications using JavaScript.";
export var defaultThumbnailImageSource = imageSourceFromFile("~/res/reddit-logo.png");
export var defaultNoThumbnailImageSource = imageSourceFromFile("~/res/no-image.png");

var redditUrl = "http://www.reddit.com/r/aww.json?limit=";
var after: string;
var ISSCROLLING = "isLoading";

// initialize the image cache for the main list
export var cache = new ImageCache();
cache.placeholder = defaultThumbnailImageSource;
cache.maxRequests = 5;

export class AppViewModel extends Observable {

    private _redditItems: VirtualArray<RedditViewModel>;
    get redditItems(): VirtualArray<RedditViewModel> {
        if (!this._redditItems) {
            this._redditItems = new VirtualArray<RedditViewModel>(1000);
            this._redditItems.loadSize = 50;
            this._redditItems.on(VirtualArray.itemsLoadingEvent, (args: virtualArrayItemsLoadingData) => {

                fetch(redditUrl + args.count + (after ? "&after=" + after : "")).then<RedditData>(response=> response.json()).then(result => {

                    var itemsToLoad = result.data.children.map(i=> {
                        return new RedditViewModel(i.data);
                    });

                    this._redditItems.load(args.index, itemsToLoad);

                    var lastItem = itemsToLoad[itemsToLoad.length - 1];
                    if (lastItem) {
                        after = itemsToLoad[itemsToLoad.length - 1].source.name;
                    }

                }).catch(e => {
                setTimeout(() => { throw e; });
                });
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

            this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: ISSCROLLING, value: value });
        }
    }

    get aboutText(): string {
        return aboutText;
    }

    get defaultThumbnailImageSource(): ImageSource {
        return defaultThumbnailImageSource;
    }

    get defaultNoThumbnailImageSource(): ImageSource {
        return defaultNoThumbnailImageSource;
    }
}
