// >> image-cache-require
import * as imageCacheModule from "tns-core-modules/ui/image-cache";
import * as imageSource from "tns-core-modules/image-source";
// << image-cache-require

export let test_DummyTestForSnippetOnly = function() {
    // >> image-cache-request-images
    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    // Enable download while not scrolling
    cache.enableDownload();

    let imgSource: imageSource.ImageSource;
    const url = "https://github.com/NativeScript.png";
    // Try to read the image from the cache
    const image = cache.get(url);
    if (image) {
        // If present -- use it.
        imgSource = imageSource.fromNativeSource(image);
    }
    else {
        // If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    imgSource = imageSource.fromNativeSource(image);
                }
            }
        });
    }

    // Disable download while scrolling
    cache.disableDownload();
    // << image-cache-request-images
}

export let test_ImageCache_NothingAtProvidedUrl = function() {
    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    // Enable download while not scrolling
    cache.enableDownload();

    let imgSource: imageSource.ImageSource;
    const url = "https://github.com/NativeScript-NoImage.png";
    // Try to read the image from the cache
    const image = cache.get(url);
    if (image) {
        // If present -- use it.
        imgSource = imageSource.fromNativeSource(image);
    }
    else {
        // If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    imgSource = imageSource.fromNativeSource(image);
                }
            },
            error: (key: string) => {
                console.log("No image for key: ", key);
            }
        });
    }

    // Disable download while scrolling
    cache.disableDownload();
}
