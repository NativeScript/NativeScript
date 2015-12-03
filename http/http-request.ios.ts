/**
 * iOS specific http request implementation.
 */

declare var __inspectorTimestamp;
import http = require("http");

import * as types from "utils/types";
import * as imageSourceModule from "image-source";
import * as utilsModule from "utils/utils";
import * as fsModule from "file-system";

import resource_data = require("./resource-data");
import debuggerDomains = require("./../debugger/debugger");

var GET = "GET";
var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25";
var sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration();
var queue = NSOperationQueue.mainQueue();
var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);

export var domainDebugger: any;

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
            // var sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration();
            // var queue = NSOperationQueue.mainQueue();
            // var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
            //     sessionConfig, null, queue);

            var requestId = Math.random().toString();
            var resourceData = new resource_data.ResourceData(requestId);
            domainDebugger.resource_datas[requestId] = resourceData;

            var urlRequest = NSMutableURLRequest.requestWithURL(
                NSURL.URLWithString(options.url));

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
                        var headers: http.Headers = {};
                        if (response && response.allHeaderFields) {
                            var headerFields = response.allHeaderFields;
                            var keys = headerFields.allKeys;

                            for (var i = 0, l = keys.count; i < l; i++) {
                                let key = keys.objectAtIndex(i);
                                let value = headerFields.valueForKey(key);
                                
                                (<any>http).addHeader(headers, key, value);
                            }
                        }

                        domainDebugger.resource_datas[requestId].mimeType = response.MIMEType;
                        domainDebugger.resource_datas[requestId].data = data;
                        var debugResponse = {
                            // Response URL. This URL can be different from CachedResource.url in case of redirect.
                            url: options.url,
                            // HTTP response status code.
                            status: response.statusCode,
                            // HTTP response status text.
                            statusText: NSHTTPURLResponse.localizedStringForStatusCode(response.statusCode),
                            // HTTP response headers.
                            headers: headers,
                            // HTTP response headers text.
                            mimeType: response.MIMEType,
                            fromDiskCache: false
                        }

                        // Loader Identifier is hardcoded in the runtime and should be the same string
                        // __inspectorTimestamp is provided by the runtime and returns a frontend friendly timestamp 
                        domainDebugger.events.responseReceived(requestId, "NativeScriptMainFrameIdentifier", "Loader Identifier", __inspectorTimestamp(), exports.domainDebugger.resource_datas[requestId].resourceType, debugResponse);
                        domainDebugger.events.loadingFinished(requestId, __inspectorTimestamp());

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
                                },
                                toFile: (destinationFilePath?: string) => {
                                    var fs: typeof fsModule = require("file-system");
                                    var fileName = options.url;
                                    if (!destinationFilePath) {
                                        destinationFilePath = fs.path.join(fs.knownFolders.documents().path, fileName.substring(fileName.lastIndexOf('/') + 1));
                                    }
                                    if (data instanceof NSData) {
                                        data.writeToFileAtomically(destinationFilePath, true);
                                        return fs.File.fromPath(destinationFilePath);
                                    } else {
                                        reject(new Error(`Cannot save file with path: ${destinationFilePath}.`));
                                    }
                                }
                            },
                            statusCode: response.statusCode,
                            headers: headers
                        });
                    }
                });

            if(options.url) {
                var request = {
                        url: options.url,
                        method: "GET",
                        headers: options.headers
                };

                domainDebugger.events.requestWillBeSent(requestId, "NativeScriptMainFrameIdentifier", "Loader Identifier", options.url, request, __inspectorTimestamp(), { type: 'Script' });
            }

            dataTask.resume();
        } catch (ex) {
            reject(ex);
        }
    });
}

function NSDataToString(data: any): string {
    return NSString.alloc().initWithDataEncoding(data, 4).toString();
}
