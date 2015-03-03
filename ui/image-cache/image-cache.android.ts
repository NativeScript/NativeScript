import common = require("ui/image-cache/image-cache-common");
import imageSource = require("image-source");

module.exports.knownEvents = common.knownEvents;

export class Cache extends common.Cache {
    private _callback: any;

    constructor() {
        super();

        var that = new WeakRef(this);
        this._callback = new (<any>com).tns.Async.CompleteCallback({
            onComplete: function (result: any, context: any) {
                var instance = that.get();
                if (instance) {
                    instance._onBitmapDownloaded(result, context);
                }
            }
        });
    }

    public _downloadCore(request: common.DownloadRequest) {
        (<any>com).tns.Async.DownloadImage(request.url, this._callback, request.key);
    }

    /* tslint:disable:no-unused-variable */
    private _onBitmapDownloaded(result: android.graphics.Bitmap, context: any) {
        // as a context we are receiving the key of the request
        var source = imageSource.fromNativeSource(result);
        this._onDownloadCompleted(context, source);
    }
    /* tslint:enable:no-unused-variable */
}