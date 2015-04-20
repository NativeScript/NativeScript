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
    
    var imgSouce: imageSource.ImageSource;
    var url = "https://github.com/NativeScript.png";
    //// Try to read the image from the cache
    var image = cache.get(url);
    if (image) {
        //// If present -- use it.
        imgSouce = imageSource.fromNativeSource(image);
    }
    else {
        //// If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    imgSouce = imageSource.fromNativeSource(image);
                }
            }
        });
    }

    //// Disable download while scrolling
    cache.disableDownload();
    // ```
    // </snippet>
}