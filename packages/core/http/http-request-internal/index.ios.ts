import { SDK_VERSION } from '../../utils/constants';
import { isRealDevice } from '../../utils/native-helper';
import * as types from '../../utils/types';
import * as domainDebugger from '../../debugger';
import type { HttpRequestOptions, HttpResponse, Headers } from '../http-interfaces';
import { HttpResponseEncoding } from '../http-interfaces';
import { BaseHttpContent } from '.';
import { addHeader } from './http-request-internal-common';
export { addHeader } from './http-request-internal-common';

const currentDevice = UIDevice.currentDevice;
const device = currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Phone ? 'Phone' : 'Pad';
const osVersion = currentDevice.systemVersion;

const GET = 'GET';
const USER_AGENT_HEADER = 'User-Agent';
const USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS ${osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/${osVersion} Mobile/10A5355d Safari/8536.25`;
// mitigate iOS 18.4 simulator regression
// https://developer.apple.com/forums/thread/777999
const sessionConfig = SDK_VERSION === 18.4 && !isRealDevice() ? NSURLSessionConfiguration.ephemeralSessionConfiguration : NSURLSessionConfiguration.defaultSessionConfiguration;
const queue = NSOperationQueue.mainQueue;

@NativeClass
class NSURLSessionTaskDelegateImpl extends NSObject implements NSURLSessionTaskDelegate {
	public static ObjCProtocols = [NSURLSessionTaskDelegate];
	public URLSessionTaskWillPerformHTTPRedirectionNewRequestCompletionHandler(session: NSURLSession, task: NSURLSessionTask, response: NSHTTPURLResponse, request: NSURLRequest, completionHandler: (p1: NSURLRequest) => void): void {
		completionHandler(null);
	}
}
const sessionTaskDelegateInstance: NSURLSessionTaskDelegateImpl = <NSURLSessionTaskDelegateImpl>NSURLSessionTaskDelegateImpl.new();

let defaultSession;
function ensureDefaultSession() {
	if (!defaultSession) {
		defaultSession = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);
	}
}

let sessionNotFollowingRedirects;
function ensureSessionNotFollowingRedirects() {
	if (!sessionNotFollowingRedirects) {
		sessionNotFollowingRedirects = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, sessionTaskDelegateInstance, queue);
	}
}

export function requestInternal<T extends object>(options: HttpRequestOptions, contentHandler?: T): Promise<HttpResponse<BaseHttpContent & T>> {
	return new Promise<HttpResponse<BaseHttpContent & T>>((resolve, reject) => {
		if (!options.url) {
			reject(new Error('Request url was empty.'));
			return;
		}

		try {
			const network = domainDebugger.getNetwork();
			const debugRequest = network && network.create();

			const urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(options.url));

			urlRequest.HTTPMethod = types.isDefined(options.method) ? options.method : GET;

			urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);

			if (options.headers) {
				for (const header in options.headers) {
					urlRequest.setValueForHTTPHeaderField(options.headers[header] + '', header);
				}
			}

			if (types.isString(options.content) || options.content instanceof FormData) {
				urlRequest.HTTPBody = NSString.stringWithString(options.content.toString()).dataUsingEncoding(4);
			} else if (options.content instanceof ArrayBuffer) {
				const buffer = options.content as ArrayBuffer;
				urlRequest.HTTPBody = NSData.dataWithData(buffer as any);
			}

			if (types.isNumber(options.timeout)) {
				urlRequest.timeoutInterval = options.timeout / 1000;
			}

			let session;
			if (types.isBoolean(options.dontFollowRedirects) && options.dontFollowRedirects) {
				ensureSessionNotFollowingRedirects();
				session = sessionNotFollowingRedirects;
			} else {
				ensureDefaultSession();
				session = defaultSession;
			}

			let timestamp = -1;
			const dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest, function (data: NSData, response: NSHTTPURLResponse, error: NSError) {
				if (error) {
					reject(new Error(error.localizedDescription));
				} else {
					const headers: Headers = {};
					if (response && response.allHeaderFields) {
						const headerFields = response.allHeaderFields;

						headerFields.enumerateKeysAndObjectsUsingBlock((key, value, stop) => {
							addHeader(headers, key, value);
						});
					}

					if (debugRequest) {
						debugRequest.mimeType = response.MIMEType;
						debugRequest.data = data;
						const debugResponse = {
							url: options.url,
							status: response.statusCode,
							statusText: NSHTTPURLResponse.localizedStringForStatusCode(response.statusCode),
							headers: headers,
							mimeType: response.MIMEType,
							fromDiskCache: false,
							timing: {
								requestTime: timestamp,
								proxyStart: -1,
								proxyEnd: -1,
								dnsStart: -1,
								dnsEnd: -1,
								connectStart: -1,
								connectEnd: -1,
								sslStart: -1,
								sslEnd: -1,
								serviceWorkerFetchStart: -1,
								serviceWorkerFetchReady: -1,
								serviceWorkerFetchEnd: -1,
								sendStart: -1,
								sendEnd: -1,
								receiveHeadersEnd: -1,
							},
							headersSize: headers?.length ?? -1,
						};
						debugRequest.responseReceived(debugResponse);
						debugRequest.loadingFinished();
					}

					const content = {
						raw: data,
						requestURL: options.url,
						toNativeImage: () => {
							return new Promise((resolveImage, rejectImage) => {
								UIImage.tns_decodeImageWithDataCompletion(data, (image) => {
									if (image) {
										resolveImage(image);
									} else {
										rejectImage(new Error('Response content may not be converted to an Image'));
									}
								});
							});
						},
						toNativeString: (encoding?: HttpResponseEncoding) => NSDataToString(data, encoding),
					};

					if (contentHandler != null && types.isObject(contentHandler) && !Array.isArray(contentHandler)) {
						Object.assign(content, contentHandler);
					}

					resolve({
						content: content as BaseHttpContent & T,
						statusCode: response.statusCode,
						headers: headers,
					});
				}
			});

			if (options.url && debugRequest) {
				timestamp = Date.now() / 1000;
				const request = {
					url: options.url,
					method: 'GET',
					headers: options.headers,
					timestamp,
					headersSize: options?.headers?.length ?? -1,
				};
				debugRequest.requestWillBeSent(request);
			}

			dataTask.resume();
		} catch (ex) {
			reject(ex);
		}
	});
}

function NSDataToString(data: any, encoding?: HttpResponseEncoding): string {
	let code = NSUTF8StringEncoding; // long:4

	if (encoding === HttpResponseEncoding.GBK) {
		code = CFStringEncodings.kCFStringEncodingGB_18030_2000; // long:1586
	}

	let encodedString = NSString.alloc().initWithDataEncoding(data, code);

	// If UTF8 string encoding fails try with ISO-8859-1
	if (!encodedString) {
		code = NSISOLatin1StringEncoding; // long:5
		encodedString = NSString.alloc().initWithDataEncoding(data, code);
	}

	return encodedString.toString();
}
