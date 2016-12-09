import common = require("./image-cache-common");
import trace = require("trace");
import * as httpRequestModule from "http/http-request";

import * as utils from "utils/utils";
import getter = utils.ios.getter;

var httpRequest: typeof httpRequestModule;
function ensureHttpRequest() {
    if (!httpRequest) {
        httpRequest = require("http/http-request");
    }
}

//class NSCacheDelegateImpl extends NSObject implements NSCacheDelegate {
//    public static ObjCProtocols = [NSCacheDelegate];

//    static new(): NSCacheDelegateImpl {
//        return <NSCacheDelegateImpl>super.new();
//    }

//    public cacheWillEvictObject(cache: NSCache, obj: any): void {
//        traceWrite("NSCacheDelegateImpl.cacheWillEvictObject(" + obj + ");", traceCategories.Debug);
//    }
//}

class MemmoryWarningHandler extends NSObject {
    static new(): MemmoryWarningHandler {
        return <MemmoryWarningHandler>super.new();
    }

    private _cache: NSCache<any, any>;

    public initWithCache(cache: NSCache<any, any>): MemmoryWarningHandler {
        this._cache = cache;

        getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).addObserverSelectorNameObject(this, "clearCache", "UIApplicationDidReceiveMemoryWarningNotification", null);
        if (traceEnabled) {
            traceWrite("[MemmoryWarningHandler] Added low memory observer.", traceCategories.Debug);
        }

        return this;
    }

    public dealloc(): void {
        getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).removeObserverNameObject(this, "UIApplicationDidReceiveMemoryWarningNotification", null);
        if (traceEnabled) {
            traceWrite("[MemmoryWarningHandler] Removed low memory observer.", traceCategories.Debug);
        }
        super.dealloc();
    }

    public clearCache(): void {
        if (traceEnabled) {
            traceWrite("[MemmoryWarningHandler] Clearing Image Cache.", traceCategories.Debug);
        }
        this._cache.removeAllObjects();
        utils.GC();
    }

    public static ObjCExposedMethods = {
        "clearCache": { returns: interop.types.void, params: [] }
    };
}

export class Cache extends common.Cache {
    private _cache: NSCache<any, any>;
    //private _delegate: NSCacheDelegate;
    private _memoryWarningHandler: MemmoryWarningHandler;

    constructor() {
        super();

        this._cache = new NSCache<any, any>();
        
        //this._delegate = NSCacheDelegateImpl.new();
        //this._cache.delegate = this._delegate;

        this._memoryWarningHandler = MemmoryWarningHandler.new().initWithCache(this._cache);
    }

    public _downloadCore(request: common.DownloadRequest) {
        ensureHttpRequest();

        var that = this;
        httpRequest.request({ url: request.url, method: "GET" })
            .then(response => {
                var image = UIImage.alloc().initWithData(response.content.raw);
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
        utils.GC();
    }
}
