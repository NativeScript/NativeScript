/**
  * Android specific http request implementation.
  */
import promises = require("promises");

// this is imported for definition purposes only
import http = require("http");

export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var request = new com.koushikdutta.async.http.AsyncHttpRequest(java.net.URI.create(options.url), options.method);

        if (options.headers) {
            for (var key in options.headers) {
                request.addHeader(key, options.headers[key])
            }
        }

        if (typeof options.timeout == "number") {
            request.setTimeout(options.timeout);
        }

        if (typeof options.content == "string") {
            var stringBody = com.koushikdutta.async.http.body.StringBody.extends({
                getContentType: function () {
                    return null;
                }
            });
            request.setBody(new stringBody(options.content));
        }
        else if (typeof options.content !== "undefined") {
            var streamBody = com.koushikdutta.async.http.body.StreamBody.extends({
                getContentType: function () {
                    return null;
                }
            });
            request.setBody(new com.koushikdutta.async.http.body.StreamBody(new java.io.ByteArrayInputStream(options.content), options.content.length));
        }

        var callback = new com.koushikdutta.async.http.callback.HttpConnectCallback({
            onConnectCompleted: function (error, response) {
                if (error) {
                    d.reject(new Error(error.toString()));
                } else {
                    var headers = {};
                    var rawHeaders = response.getHeaders().headers;

                    for (var i = 0, l = rawHeaders.length(); i < l; i++) {
                        var key = rawHeaders.getFieldName(i);
                        headers[key] = rawHeaders.getValue(i);
                    }

                    var outputStream = new java.io.ByteArrayOutputStream();

                    var dataCallback = new com.koushikdutta.async.callback.DataCallback({
                        onDataAvailable: function (emitter, byteBufferList) {
                            var bb = byteBufferList.getAll();
                            outputStream.write(bb.array(), bb.arrayOffset() + bb.position(), bb.remaining());
                        }
                    });

                    response.setDataCallback(dataCallback);

                    var endCallback = new com.koushikdutta.async.callback.CompletedCallback({
                        onCompleted: function (error) {
                            d.resolve({
                                content: {
                                    raw: outputStream,
                                    toString: () => { return outputStream.toString(); },
                                    toJSON: () => { return JSON.parse(outputStream.toString()); },
                                    toImage: () => {
                                        return require("image-source").fromData(new java.io.ByteArrayInputStream(outputStream.toByteArray()));
                                    }
                                },
                                statusCode: rawHeaders.getResponseCode(),
                                headers: headers
                            });
                        }
                    });

                    response.setEndCallback(endCallback);
                }
            }
        });

        com.koushikdutta.async.http.AsyncHttpClient.getDefaultInstance().execute(request, callback);

    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}