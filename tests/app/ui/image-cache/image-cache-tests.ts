import * as imageCacheModule from "@nativescript/core/ui/image-cache";
import { ImageSource } from "@nativescript/core/image-source";
import * as types from "@nativescript/core/utils/types";
import { isAndroid, device } from "@nativescript/core/platform";
import lazy from "@nativescript/core/utils/lazy";

import * as TKUnit from "../../tk-unit";

const sdkVersion = lazy(() => parseInt(device.sdkVersion));

export const test_ImageCache_ValidUrl = function () {
    // see https://github.com/NativeScript/NativeScript/issues/6643
    if (isAndroid && sdkVersion() < 20) {
        return;
    }

    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    let validKey: string;

    let imgSource: ImageSource;
    const url = "https://github.com/NativeScript.png";
    // Try to read the image from the cache
    const image = cache.get(url);
    if (image) {
        // If present -- use it.
        imgSource = new ImageSource(image);
    }
    else {
        // If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    imgSource = new ImageSource(image);
                    validKey = key;
                    console.log("Valid url: ", key);
                }
            }
        });
    }

    TKUnit.waitUntilReady(() => types.isDefined(validKey), 8);
    TKUnit.assertEqual(validKey, url, "Key should equal the provided url");
};

export const test_ImageCache_NothingAtProvidedUrl = function () {
    const cache = new imageCacheModule.Cache();
    cache.maxRequests = 5;

    let errorCaught = false;
    let errorMessage: string;

    let imgSource: ImageSource;
    const url = "https://github.com/NativeScript-NoImage.png";
    // Try to read the image from the cache
    const image = cache.get(url);
    if (image) {
        // If present -- use it.
        imgSource = new ImageSource(image);
    }
    else {
        // If not present -- request its download.
        cache.push({
            key: url,
            url: url,
            completed: (image: any, key: string) => {
                if (url === key) {
                    imgSource = new ImageSource(image);
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
};
