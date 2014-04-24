/**
  * Android specific http client implementation.
  */
import promises = require("promises/promises");
import http = require("net/http_request");

// TODO: Replace with similar to iOS implementation!
export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var headers = new com.koushikdutta.async.http.libcore.RawHeaders();

        if (options.headers) {
            for (var key in options.headers) {
                headers.add(key, options.headers[key])
            }
        }

        var isImage = options.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

        var context = require("Application/application").Application.current.android.context;
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
                            toImage: () => { return require("Image/image").Image.imageFromNativeBitmap(data); }
                        },
                        statusCode: 0,
                        headers: {}
                    });
                }
            }
        }));
    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}
