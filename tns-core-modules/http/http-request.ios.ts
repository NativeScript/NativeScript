/**
 * iOS specific http request implementation.
 */

import http = require("http");

import * as types from "utils/types";
import * as imageSourceModule from "image-source";
import * as fsModule from "file-system";

import * as utils from "utils/utils";
import getter = utils.ios.getter;

import domainDebugger = require("./../debugger/debugger");

var device = utils.ios.getter(UIDevice, UIDevice.currentDevice).userInterfaceIdiom === UIUserInterfaceIdiom.Phone ? "Phone" : "Pad";

var GET = "GET";
var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25`;
var sessionConfig = getter(NSURLSessionConfiguration, NSURLSessionConfiguration.defaultSessionConfiguration);
var queue = getter(NSOperationQueue, NSOperationQueue.mainQueue);
var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);

var imageSource: typeof imageSourceModule;
function ensureImageSource() {
    if (!imageSource) {
        imageSource = require("image-source");
    }
}

export function request(options: http.HttpRequestOptions): Promise<http.HttpResponse> {
    return new Promise<http.HttpResponse>((resolve, reject) => {

        try {
            var network = domainDebugger.getNetwork();
            var debugRequest = network && network.create();

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
                urlRequest.HTTPBody = NSString.stringWithString(options.content.toString()).dataUsingEncoding(4);
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
                            
                            headerFields.enumerateKeysAndObjectsUsingBlock((key, value, stop) => {
                                (<any>http).addHeader(headers, key, value);
                            });
                        }
                        
                        if (debugRequest) {
                            debugRequest.mimeType = response.MIMEType;
                            debugRequest.data = data;
                            var debugResponse = {
                                url: options.url,
                                status: response.statusCode,
                                statusText: NSHTTPURLResponse.localizedStringForStatusCode(response.statusCode),
                                headers: headers,
                                mimeType: response.MIMEType,
                                fromDiskCache: false
                            }
                            debugRequest.responseReceived(debugResponse);
                            debugRequest.loadingFinished();
                        }

                        resolve({
                            content: {
                                raw: data,
                                toString: (encode?:http.ResponseEncode) => { return NSDataToString(data,encode); },
                                toJSON: (encode?:http.ResponseEncode) => {
                                    return utils.parseJSON(NSDataToString(data,encode));
                                },
                                toImage: () => {
                                    ensureImageSource();
                                    return new Promise((resolve, reject) => {
                                        (<any>UIImage).tns_decodeImageWithDataCompletion(data, image => {
                                            if (image) {
                                                resolve(imageSource.fromNativeSource(image))
                                            } else {
                                                reject(new Error("Response content may not be converted to an Image"));
                                            }
                                        });
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

            if(options.url && debugRequest) {
                var request = {
                    url: options.url,
                    method: "GET",
                    headers: options.headers
                };
                debugRequest.requestWillBeSent(request);
            }

            dataTask.resume();
        } catch (ex) {
            reject(ex);
        }
    });
}

function NSDataToString(data: any,encode?:http.ResponseEncode): string {
    let code = 4; //UTF8
    if(encode === http.ResponseEncode.GBK) {
        code = 1586;
    }
    return NSString.alloc().initWithDataEncoding(data, code).toString();
}
