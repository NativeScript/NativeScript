import common = require("./image-cache-common");

class LruBitmapCache extends android.util.LruCache<string, android.graphics.Bitmap> {
    constructor(cacheSize: number) {
        super(cacheSize);
        return global.__native(this);
    }

    protected sizeOf(key: string, bitmap: android.graphics.Bitmap): number {
        // The cache size will be measured in kilobytes rather than
        // number of items.
        var result = Math.round(bitmap.getByteCount() / 1024);
        //console.log("sizeOf key: " + result);
        return result;
    }

    //protected entryRemoved(evicted: boolean, key: string, oldValue: android.graphics.Bitmap, newValue: android.graphics.Bitmap): void {
    //    console.log("entryRemoved("+evicted+", "+key+", "+oldValue+", "+newValue+")");
    //}
};

export class Cache extends common.Cache {
    private _callback: any;
    private _cache: LruBitmapCache;

    constructor() {
        super();

        var maxMemory = java.lang.Runtime.getRuntime().maxMemory() / 1024;
        var cacheSize = maxMemory / 8;
        //console.log("cacheSize: " + cacheSize);
        this._cache = new LruBitmapCache(cacheSize);

        var that = new WeakRef(this);
        this._callback = new (<any>com).tns.Async.CompleteCallback({
            onComplete: function (result: any, context: any) {
                var instance = that.get();
                if (instance) {
                    instance._onDownloadCompleted(context, result)
                }
            }
        });
    }

    public _downloadCore(request: common.DownloadRequest) {
        (<any>com).tns.Async.DownloadImage(request.url, this._callback, request.key);
    }

    public get(key: string): any {
        var result = this._cache.get(key);
        return result;
    }

    public set(key: string, image: any): void {
        this._cache.put(key, image);
    }

    public remove(key: string): void {
        this._cache.remove(key);
    }

    public clear() {
        this._cache.evictAll();
    }
}
