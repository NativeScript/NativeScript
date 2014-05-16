/**
  * Android specific http request implementation.
  */
import promises = require("promises/promises");
import http = require("http/http");

declare var exports;
require("utils/module-merge").merge(require("http/http-common"), exports);

export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {

        var isImage = options.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

        var context = require("application").android.context;

        if (isImage && options.method && options.method.toLowerCase() == "get") {
            var request = com.koushikdutta.ion.Ion.with(context, options.url);
            request.asBitmap().setCallback(new com.koushikdutta.async.future.FutureCallback({
                onCompleted: function (error, data) {
                    if (error) {
                        d.reject(new Error(error.toString()));
                    } else {
                        d.resolve({
                            content: {
                                raw: data,
                                toString: () => { return null },
                                toJSON: () => { return null },
                                toImage: () => { return require("image-source").fromNativeSource(data); }
                            },
                            statusCode: 0,
                            headers: {}
                        });
                    }
                }
            }));
        }
        else {
            var request = com.koushikdutta.ion.Ion.getDefault(context).configure().getAsyncHttpRequestFactory()
                .createAsyncHttpRequest(java.net.URI.create(options.url), options.method, null);

            if (options.headers) {
                for (var key in options.headers) {
                    request.addHeader(key, options.headers[key])
                }
            }

            if (typeof options.timeout == "number") {
                request.setTimeout(options.timeout);
            }

            if (typeof options.content == "string") {
                request.setBody(new com.koushikdutta.async.http.body.StringBody(options.content));
            }
            else {
                // TODO: How to transfer everything else?
            }

            var StringCallback = com.koushikdutta.async.http.AsyncHttpClient.StringCallback.extends({
                onCompleted: function (error, response, result) {
                    if (error) {
                        d.reject(new Error(error.toString()));
                    } else {
                        var headers = {};
                        var rawHeaders = response.getHeaders().headers;

                        for (var i = 0, l = rawHeaders.length(); i < l; i++) {
                            var key = rawHeaders.getFieldName(i);
                            headers[key] = rawHeaders.getValue(i);
                        }

                        d.resolve({
                            content: {
                                raw: result,
                                toString: () => { return result },
                                toJSON: () => { return JSON.parse(result) },
                                toImage: () => {
                                    return null;
                                }
                            },
                            statusCode: rawHeaders.getResponseCode(),
                            headers: headers
                        });
                    }
                }
            });

            com.koushikdutta.async.http.AsyncHttpClient.getDefaultInstance().execute(request, new StringCallback());
        }

    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}