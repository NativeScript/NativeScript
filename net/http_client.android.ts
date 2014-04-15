/**
  * Android specific http client implementation.
  */

import image_module = require("Image/image");
import app_module = require("Application/application");
import promises = require("promises/promises");

export class http {
    /**
      * Gets string from url.
      */
    public static getString(url: string): promises.Promise<string> {
        var d = promises.defer<string>();
        http.get(url, r => d.resolve(r), e => d.reject(e));
        return d.promise();
    }

    /**
      * Gets JSON from url.
      */
    public static getJSON<T>(url: string): promises.Promise<T> {
        var d = promises.defer<T>();
        http.get(url, r => d.resolve(JSON.parse(r)), e => d.reject(e));
        return d.promise();
    }

    /**
      * Gets image from url.
      */
    public static getImage(url: string): promises.Promise<image_module.Image> {
        var d = promises.defer<image_module.Image>();
        http.get(url, r => {
            var image = new image_module.Image();
            image.loadFromBitmap(r);
            d.resolve(image);
        }, e => d.reject(e));
        return d.promise();
    }

    // TODO: Accept: application/json header for JSON calls and check the response for Image not url!
    private static get(url: string, successCallback: (result: any) => void, errorCallback?: (e: Error) => void) {
        try {
            var isImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;

            var context = app_module.tk.ui.Application.current.android.context;
            var request = com.koushikdutta.ion.Ion.with(context, url);

            request = isImage ? request.asBitmap() : request.asString();

            request.setCallback(new com.koushikdutta.async.future.FutureCallback({
                onCompleted: function (error, data) {
                    if (error && errorCallback) {
                        errorCallback(new Error(error.toString()));
                    } else if (successCallback) {
                        successCallback(data);
                    }
                }
            }));
        } catch (ex) {
            if (errorCallback) {
                errorCallback(ex);
            }
        }
    }
}
