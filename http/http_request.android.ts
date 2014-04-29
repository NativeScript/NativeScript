/**
  * Android specific http client implementation.
  */
import promises = require("promises/promises");
import http = require("http/http_request");

// TODO: Replace with similar to iOS implementation!
export function request(options: http.HttpRequestOptions): promises.Promise<http.HttpResponse> {
    var d = promises.defer<http.HttpResponse>();

    try {
        var context = require("Application/application").Application.current.android.context;
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

        var StringCallback = com.koushikdutta.async.http.AsyncHttpClient.StringCallback.extends({
            onCompleted: function (error, response, result) {
                if (error) {
                    d.reject(error);
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
                            toImage: () =>
                            {
                                // TODO: Implement this!
                                return null;
                                //return require("Image/image").Image.imageFromNativeBitmap(response);
                            }
                        },
                        statusCode: rawHeaders.getResponseCode(),
                        headers: headers
                    });
                }
            }
        });

        com.koushikdutta.async.http.AsyncHttpClient.getDefaultInstance().execute(request, new StringCallback());

    } catch (ex) {
        d.reject(ex);
    }
    return d.promise();
}
