import * as imageCacheModule from "tns-core-modules/ui/image-cache";
import * as imageSource from "tns-core-modules/image-source";
import * as types from "tns-core-modules/utils/types";
import * as TKUnit from "../../TKUnit";

export const test_ImageCache_ValidUrl = function() {
    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    let validKey: string;

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
                    validKey = key;
                    console.log("Valid url: ", key);
                }
            }
        });
    }

    TKUnit.waitUntilReady(() => types.isDefined(validKey), 8);
    TKUnit.assertEqual(validKey, url, "Key should equal the provided url");
}

export const test_ImageCache_NothingAtProvidedUrl = function() {
    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    let errorCaught = false;
    let errorMessage: string;

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
                errorMessage = `No image for key: ${key}`;
                errorCaught = true;
            }
        });
    }

    TKUnit.waitUntilReady(() => errorCaught);
    TKUnit.assertEqual(`No image for key: ${url}`, errorMessage);
}
