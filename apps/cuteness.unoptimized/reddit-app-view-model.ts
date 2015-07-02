import imageSource = require("image-source");
import observableArray = require("data/observable-array");
import http = require("http");
import observable = require("data/observable");
import imageCache = require("ui/image-cache");

import redditModel = require("./reddit-model");
import redditViewModel = require("./reddit-item-view-model");

var aboutText = "Cuteness is a proof of concept app demonstrating the Telerik's NativeScript for writing native mobile applications using JavaScript.";
export var defaultThumbnailImageSource = imageSource.fromFile("~/res/reddit-logo.png");
export var defaultNoThumbnailImageSource = imageSource.fromFile("~/res/no-image.png");

var redditUrl = "http://www.reddit.com/r/aww.json?limit=50";

// initialize the image cache for the main list
export var cache = new imageCache.Cache();
cache.placeholder = defaultThumbnailImageSource;
cache.maxRequests = 5;

export class AppViewModel extends observable.Observable {
    private _redditItems = new observableArray.ObservableArray<redditViewModel.RedditViewModel>();
    private _isLoading = false;
    private _after = "";

    get redditItems(): observableArray.ObservableArray<redditViewModel.RedditViewModel> {
        return this._redditItems;
    }

    public loadItemsAsync() {
        if (this._isLoading) {
            return;
        }
        this._isLoading = true;
        var requestUrl = redditUrl + this._after;
        //console.log(`>>> Requesting ${requestUrl}`);
        var that = this;
        http.getJSON<redditModel.Data>(requestUrl).then(result => {
            //console.log(`>>> Received ${result.data.children.length} reddit items`);
            var newItems = result.data.children.map(i=> {
                return new redditViewModel.RedditViewModel(i.data);
            });
            that._redditItems.push(newItems);
            that._after = "&after=" + newItems[newItems.length - 1].source.name; 
            that._isLoading = false;
        },(e) => {
                console.log(e.message);
                that._isLoading = false;
            })
            .catch(function (e) {
                that._isLoading = false;
                setTimeout(function () { throw e; });
        });
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