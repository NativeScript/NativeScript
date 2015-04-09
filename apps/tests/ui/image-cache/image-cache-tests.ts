// <snippet module="ui/image-cache" title="image-cache">
// # ImageCache
// Using the ImageCache requires the "ui/image-cache" module.
// ``` JavaScript
import imageCacheModule = require("ui/image-cache");
import imageSource = require("image-source");
import fs = require("file-system");
// ```
// </snippet>

export function test_DummyTestForSnippetOnly() {
    // <snippet module="ui/image-cache" title="image-cache">
    // ### Requesting Images
    // ``` JavaScript
    var cache = new imageCacheModule.Cache();
    cache.placeholder = imageSource.fromFile(fs.path.join(__dirname, "res/no-image.png"));
    cache.maxRequests = 5;
    
    //// Enable download while not scrolling
    cache.enableDownload();
    
    var src: imageSource.ImageSource;
    var url = "https://github.com/NativeScript.png";
    //// Try to read the image from the cache
    var result = cache.get(url);
    if (result) {
        //// If present -- use it.
        src = result;
    }
    else {
        //// If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (result: imageSource.ImageSource, key: string) => {
                if (url === key) {
                    src = result;
                }
            }
        });
    }

    //// Disable download while scrolling
    cache.disableDownload();
    // ```
    // </snippet>
}