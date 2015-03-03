import common = require("ui/image-cache/image-cache-common");
import imageSource = require("image-source");

module.exports.knownEvents = common.knownEvents;

export class Cache extends common.Cache {
    public _downloadCore(request: common.DownloadRequest) {
        // TODO: WeakRef?
        var that = this;
        imageSource.fromUrl(request.url).
            then(function (value) {
                that._onDownloadCompleted(request.key, value);
            });
    }
}