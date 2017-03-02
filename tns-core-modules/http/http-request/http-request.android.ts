/**
 * Android specific http request implementation.
 */
import * as imageSourceModule from "image-source";
import * as platformModule from "platform";
import * as fsModule from "file-system";

// this is imported for definition purposes only
import * as http from "../../http";

export const enum HttpResponseEncoding {
    UTF8,
    GBK
}

function parseJSON(source: string): any {
    var src = source.trim();
    if (src.lastIndexOf(")") === src.length - 1) {
        return JSON.parse(src.substring(src.indexOf("(") + 1, src.lastIndexOf(")")));
    }

    return JSON.parse(src);
}

var requestIdCounter = 0;
var pendingRequests = {};

var imageSource: typeof imageSourceModule;
function ensureImageSource() {
    if (!imageSource) {
        imageSource = require("image-source");
    }
}

var platform: typeof platformModule;
function ensurePlatform() {
    if (!platform) {
        platform = require("platform");
    }
}

var completeCallback: org.nativescript.widgets.Async.CompleteCallback;
function ensureCompleteCallback() {
    if (completeCallback) {
        return;
    }

    completeCallback = new org.nativescript.widgets.Async.CompleteCallback({
        onComplete: function (result: any, context: any) {
            // as a context we will receive the id of the request
            onRequestComplete(context, result);
        }
    });
}

function onRequestComplete(requestId: number, result: org.nativescript.widgets.Async.Http.RequestResult) {
    var callbacks = pendingRequests[requestId];
    delete pendingRequests[requestId];

    if (result.error) {
        callbacks.rejectCallback(new Error(result.error.toString()));
        return;
    }

    // read the headers
    var headers: http.Headers = {};
    if (result.headers) {
        var jHeaders = result.headers;
        var length = jHeaders.size();
        var i;
        var pair: org.nativescript.widgets.Async.Http.KeyValuePair;
        for (i = 0; i < length; i++) {
            pair = jHeaders.get(i);
            addHeader(headers, pair.key, pair.value);
        }
    }

    callbacks.resolveCallback({
        content: {
            raw: result.raw,
            toString: (encoding?: HttpResponseEncoding) => {
                let str: string;
                if (encoding) {
                    str = decodeResponse(result.raw, encoding);
                } else {
                    str = result.responseAsString;
                }
                if (typeof str === "string") {
                    return str;
                } else {
                    throw new Error("Response content may not be converted to string");
                }
            },
            toJSON: (encoding?: HttpResponseEncoding) => {
                let str: string;
                if (encoding) {
                    str = decodeResponse(result.raw, encoding);
                } else {
                    str = result.responseAsString;
                }
                return parseJSON(str);
            },
            toImage: () => {
                ensureImageSource();

                return new Promise<any>((resolveImage, rejectImage) => {
                    if (result.responseAsImage != null) {
                        resolveImage(imageSource.fromNativeSource(result.responseAsImage));
                    }
                    else {
                        rejectImage(new Error("Response content may not be converted to an Image"));
                    }
                });
            },
            toFile: (destinationFilePath?: string) => {
                var fs: typeof fsModule = require("file-system");
                var fileName = callbacks.url;
                if (!destinationFilePath) {
                    destinationFilePath = fs.path.join(fs.knownFolders.documents().path, fileName.substring(fileName.lastIndexOf('/') + 1));
                }
                var stream: java.io.FileOutputStream;
                try {
                    var javaFile = new java.io.File(destinationFilePath);
                    stream = new java.io.FileOutputStream(javaFile);
                    stream.write(result.raw.toByteArray());
                    return fs.File.fromPath(destinationFilePath);
                }
                catch (exception) {
                    throw new Error(`Cannot save file with path: ${destinationFilePath}.`);
                }
                finally {
                    if (stream) {
                        stream.close();
                    }
                }
            }
        },
        statusCode: result.statusCode,
        headers: headers
    });
}

function buildJavaOptions(options: http.HttpRequestOptions) {
    if (typeof options.url !== "string") {
        throw new Error("Http request must provide a valid url.");
    }

    var javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();

    javaOptions.url = options.url;

    if (typeof options.method === "string") {
        javaOptions.method = options.method;
    }
    if (typeof options.content === "string" || options.content instanceof FormData) {
        javaOptions.content = options.content.toString();
    }
    if (typeof options.timeout === "number") {
        javaOptions.timeout = options.timeout;
    }
    if (typeof options.dontFollowRedirects === "boolean") {
        javaOptions.dontFollowRedirects = options.dontFollowRedirects;
    }

    if (options.headers) {
        var arrayList = new java.util.ArrayList<org.nativescript.widgets.Async.Http.KeyValuePair>();
        var pair = org.nativescript.widgets.Async.Http.KeyValuePair;

        for (var key in options.headers) {
            arrayList.add(new pair(key, options.headers[key] + ""));
        }

        javaOptions.headers = arrayList;
    }

    ensurePlatform();

    // pass the maximum available image size to the request options in case we need a bitmap conversion
    var screen = platform.screen.mainScreen;
    javaOptions.screenWidth = screen.widthPixels;
    javaOptions.screenHeight = screen.heightPixels;

    return javaOptions;
}

export function request(options: http.HttpRequestOptions): Promise<http.HttpResponse> {
    if (options === undefined || options === null) {
        // TODO: Shouldn't we throw an error here - defensive programming
        return;
    }

    return new Promise<http.HttpResponse>((resolve, reject) => {
        try {
            // initialize the options
            var javaOptions = buildJavaOptions(options);

            // remember the callbacks so that we can use them when the CompleteCallback is called
            var callbacks = {
                url: options.url,
                resolveCallback: resolve,
                rejectCallback: reject
            };
            pendingRequests[requestIdCounter] = callbacks;

            ensureCompleteCallback();
            //make the actual async call
            org.nativescript.widgets.Async.Http.MakeRequest(javaOptions, completeCallback, new java.lang.Integer(requestIdCounter));

            // increment the id counter
            requestIdCounter++;
        } catch (ex) {
            reject(ex);
        }
    });
}

function decodeResponse(raw: any, encoding?: HttpResponseEncoding) {
    let charsetName = "UTF-8";
    if (encoding === HttpResponseEncoding.GBK) {
        charsetName = 'GBK';
    }
    return raw.toString(charsetName)
}

export function addHeader(headers: http.Headers, key: string, value: string): void {
    if (!headers[key]) {
        headers[key] = value;
    } else if (Array.isArray(headers[key])) {
        (<string[]>headers[key]).push(value);
    } else {
        let values: string[] = [<string>headers[key]];
        values.push(value);
        headers[key] = values;
    }
}
