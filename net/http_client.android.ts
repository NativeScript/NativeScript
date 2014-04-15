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
    public static getString(url: string): promises.Promise {
        var d = new promises.Deferred();

        var context = app_module.tk.ui.Application.current.android.context;
        com.koushikdutta.ion.Ion.with(context, url).asString().setCallback(new com.koushikdutta.async.future.FutureCallback({
            onCompleted: function (e, result) {
                if (e) {
                    d.reject(e);
                    return;
                }
                d.resolve(result);
            }
        }));

        return d.promise();
    }

    /**
      * Gets JSON from url.
      */
    public static getJSON(url: string): promises.Promise {
        var d = new promises.Deferred();

        var context = app_module.tk.ui.Application.current.android.context;
        com.koushikdutta.ion.Ion.with(context, url).asString().setCallback(new com.koushikdutta.async.future.FutureCallback({
            onCompleted: function (e, result) {
                if (e) {
                    d.reject(e);
                    return;
                }
                d.resolve(JSON.parse(result));
            }
        }));

        return d.promise();
    }

    /**
      * Gets image from url.
      */
    public static getImage(url: string): promises.Promise {
        var d = new promises.Deferred();

        var context = app_module.tk.ui.Application.current.android.context;
        com.koushikdutta.ion.Ion.with(context, url).asBitmap().setCallback(new com.koushikdutta.async.future.FutureCallback({
            onCompleted: function (e, result) {
                if (e) {
                    d.reject(e);
                    return;
                }

                var image = new image_module.Image();
                image.loadFromBitmap(result);

                d.resolve(image);
            }
        }));


        return d.promise();
    }
}
