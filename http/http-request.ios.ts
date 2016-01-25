/**
 * iOS specific http request implementation.
 */
import http = require("http");
import * as types from "utils/types";
import * as imageSourceModule from "image-source";
import * as utilsModule from "utils/utils";

var GET = "GET";
var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25";

var utils: typeof utilsModule;
function ensureUtils() {
    if (!utils) {
        utils = require("utils/utils");
    }
}

var imageSource: typeof imageSourceModule;
function ensureImageSource() {
    if (!imageSource) {
        imageSource = require("image-source");
    }
}

export function request(options: http.HttpRequestOptions): Promise<http.HttpResponse> {
    return new Promise<http.HttpResponse>((resolve, reject) => {

        try {
            var sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration();
            var queue = NSOperationQueue.mainQueue();
            var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
                sessionConfig, null, queue);

            var urlRequest = NSMutableURLRequest.requestWithURL(
                NSURL.URLWithString(options.url.replace("%", "%25")));

            urlRequest.HTTPMethod = types.isDefined(options.method) ? options.method : GET;

            urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);

            if (options.headers) {
                for (var header in options.headers) {
                    urlRequest.setValueForHTTPHeaderField(options.headers[header] + "", header);
                }
            }

            if (types.isString(options.content) || options.content instanceof FormData) {
                urlRequest.HTTPBody = NSString.alloc().initWithString(options.content.toString()).dataUsingEncoding(4);
            }

            if (types.isNumber(options.timeout)) {
                urlRequest.timeoutInterval = options.timeout / 1000;
            }

            var dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest,
                function (data: NSData, response: NSHTTPURLResponse, error: NSError) {
                    if (error) {
                        reject(new Error(error.localizedDescription));
                    } else {
                        var headers = {};
                        if (response && response.allHeaderFields) {
                            var headerFields = response.allHeaderFields;
                            var keys = headerFields.allKeys;

                            for (var i = 0, l = keys.count; i < l; i++) {
                                var key = keys.objectAtIndex(i);
                                headers[key] = headerFields.valueForKey(key);
                            }
                        }

                        resolve({
                            content: {
                                raw: data,
                                toString: () => { return NSDataToString(data); },
                                toJSON: () => {
                                    ensureUtils();
                                    return utils.parseJSON(NSDataToString(data));
                                },
                                toImage: () => {
                                    ensureImageSource();
                                    if (UIImage.imageWithData["async"]) {
                                        return UIImage.imageWithData["async"](UIImage, [data])
                                                      .then(image => {
                                                          if (!image) {
                                                              throw new Error("Response content may not be converted to an Image");
                                                          }
                                    
                                                          var source = new imageSource.ImageSource();
                                                          source.setNativeSource(image);
                                                          return source;
                                                      });
                                    }
   
                                    return new Promise<any>((resolveImage, rejectImage) => {
                                        var img = imageSource.fromData(data);
                                        if (img instanceof imageSource.ImageSource) {
                                            resolveImage(img);
                                        } else {
                                            rejectImage(new Error("Response content may not be converted to an Image"));
                                        }

                                    });
                                }
                            },
                            statusCode: response.statusCode,
                            headers: headers
                        });
                    }
                });

            dataTask.resume();
        } catch (ex) {
            reject(ex);
        }
    });
}

function NSDataToString(data: any): string {
    return NSString.alloc().initWithDataEncoding(data, 4).toString();
}
