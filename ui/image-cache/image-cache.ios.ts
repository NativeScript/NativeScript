import common = require("ui/image-cache/image-cache-common");
import httpRequest = require("http/http-request");

module.exports.knownEvents = common.knownEvents;

export class Cache extends common.Cache {
    private _cache: NSCache;

    constructor() {
        super();

        this._cache = new NSCache();
    }

    public _downloadCore(request: common.DownloadRequest) {
        var that = this;
        httpRequest.request({ url: request.url, method: "GET" })
            .then(response => {
                var image = UIImage.imageWithData(response.content.raw);
                that._onDownloadCompleted(request.key, image);
            });
    }

    public get(key: string): any {
        return this._cache.objectForKey(key);
    }

    public set(key: string, image: any): void {
        this._cache.setObjectForKey(image, key);
    }

    public remove(key: string): void {
        this._cache.removeObjectForKey(key);
    }

    public clear() {
        this._cache.removeAllObjects();
    }
}