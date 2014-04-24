/**
  * Android specific http client implementation.
  */
import image_module = require("Image/image");
import app_module = require("Application/application");
import promises = require("promises/promises");

import http = require("net/http_client");

/*
// merge common
import http_common = require("net/http_common");
declare var exports;
exports.getString = http_common.getString;
exports.getJSON = http_common.getJSON;
exports.getImage = http_common.getImage;
*/

// TODO: Replace with similar to iOS implementation!
export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var headers = new com.koushikdutta.async.http.libcore.RawHeaders();

        if (options.headers && options.headers.length) {
            for (var i = 0, l = options.headers.length; i < l; i++) {
                var header = options.headers[i];
                headers.add(header.name, header.value)
                }
        }

        var isImage = options.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

        var context = app_module.Application.current.android.context;
        var request = com.koushikdutta.ion.Ion.with(context, options.url);

        request = isImage ? request.asBitmap() : request.asString();

        request.setCallback(new com.koushikdutta.async.future.FutureCallback({
            onCompleted: function (error, data) {
                if (error) {
                    d.reject(error);
                } else {
                    d.resolve({
                        content: {
                            toString: () => { return data },
                            toJSON: () => { return JSON.parse(data) },
                            toImage: () => { return image_module.Image.imageFromNativeBitmap(data); }
                        },
                        statusCode: 0,
                        headers: []
                    });
                }
            }
        }));
    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}
