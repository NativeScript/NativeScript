// imported for definition purposes only
import type { Headers, HttpResponse, HttpRequestOptions } from '../../http';
import { Screen } from '../../platform/screen';
import * as domainDebugger from '../../debugger';
import { isObject } from '../../utils';
import { BaseHttpContent } from '.';
import { addHeader } from './http-request-internal-common';
export { addHeader } from './http-request-internal-common';

interface PendingRequest {
	url: string;
	contentHandler?: object;
	resolveCallback: (value: HttpResponse<BaseHttpContent> | PromiseLike<HttpResponse<BaseHttpContent>>) => void;
	rejectCallback: (reason?: any) => void;
}

let requestIdCounter = 0;
const pendingRequests = new Map<number, PendingRequest>();

let debugRequests: Map<number, { debugRequest: domainDebugger.domains.network.NetworkRequest; timestamp: number }>;
if (__DEV__) {
	debugRequests = new Map();
}
let completeCallback: org.nativescript.widgets.Async.CompleteCallback;
function ensureCompleteCallback() {
	if (completeCallback) {
		return;
	}

	completeCallback = new org.nativescript.widgets.Async.CompleteCallback({
		onComplete: function (result: any, context: any) {
			// as a context we will receive the id of the request
			onRequestComplete(context, result);
		},
		onError: function (error: string, context: any) {
			onRequestError(error, context);
		},
	});
}

function onRequestComplete(requestId: number, result: org.nativescript.widgets.Async.Http.RequestResult) {
	const callbacks = pendingRequests.get(requestId);
	pendingRequests.delete(requestId);

	if (result.error) {
		callbacks.rejectCallback(new Error(result.error.toString()));
		return;
	}

	// read the headers
	const headers: Headers = {};
	if (result.headers) {
		const jHeaders = result.headers;
		const length = jHeaders.size();
		let pair: org.nativescript.widgets.Async.Http.KeyValuePair;
		for (let i = 0; i < length; i++) {
			pair = jHeaders.get(i);
			addHeader(headers, pair.key, pair.value);
		}
	}

	if (__DEV__) {
		const debugRequestInfo = debugRequests.get(requestId);

		if (debugRequestInfo) {
			const debugRequest = debugRequestInfo.debugRequest;
			let mime = (headers['Content-Type'] ?? 'text/plain') as string;
			if (typeof mime === 'string') {
				mime = mime.split(';')[0] ?? 'text/plain';
			}

			debugRequest.mimeType = mime;
			debugRequest.data = result.raw;
			const debugResponse = {
				url: result.url,
				status: result.statusCode,
				statusText: result.statusText,
				headers: headers,
				mimeType: mime,
				fromDiskCache: false,
				timing: {
					requestTime: debugRequestInfo.timestamp,
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
			};
			debugRequest.responseReceived(debugResponse);
			debugRequest.loadingFinished();
			debugRequests.delete(requestId);
		}
	}

	const content = {
		raw: result.raw,
		requestURL: callbacks.url,
		toNativeImage: () => {
			return new Promise<any>((resolveImage, rejectImage) => {
				if (result.responseAsImage != null) {
					resolveImage(result.responseAsImage);
				} else {
					rejectImage(new Error('Response content may not be converted to an Image'));
				}
			});
		},
		toNativeString: () => result.responseAsString,
	};

	if (callbacks.contentHandler != null && isObject(callbacks.contentHandler) && !Array.isArray(callbacks.contentHandler)) {
		Object.assign(content, callbacks.contentHandler);
	}

	callbacks.resolveCallback({
		content,
		statusCode: result.statusCode,
		headers: headers,
	});
}

function onRequestError(error: string, requestId: number) {
	const callbacks = pendingRequests.get(requestId);
	pendingRequests.delete(requestId);

	if (callbacks) {
		callbacks.rejectCallback(new Error(error));
	}
}

function buildJavaOptions(options: HttpRequestOptions) {
	if (typeof options.url !== 'string') {
		throw new Error('Http request must provide a valid url.');
	}

	const javaOptions = new org.nativescript.widgets.Async.Http.RequestOptions();

	javaOptions.url = options.url;

	if (typeof options.method === 'string') {
		javaOptions.method = options.method;
	}
	if (typeof options.content === 'string' || options.content instanceof FormData) {
		const nativeString = new java.lang.String(options.content.toString());
		const nativeBytes = nativeString.getBytes('UTF-8');
		const nativeBuffer = java.nio.ByteBuffer.wrap(nativeBytes);
		javaOptions.content = nativeBuffer;
	} else if (options.content instanceof ArrayBuffer) {
		const typedArray = new Uint8Array(options.content as ArrayBuffer);
		const nativeBuffer = java.nio.ByteBuffer.wrap(Array.from(typedArray));
		javaOptions.content = nativeBuffer;
	}
	if (typeof options.timeout === 'number') {
		javaOptions.timeout = options.timeout;
	}
	if (typeof options.dontFollowRedirects === 'boolean') {
		javaOptions.dontFollowRedirects = options.dontFollowRedirects;
	}

	if (options.headers) {
		const arrayList = new java.util.ArrayList<org.nativescript.widgets.Async.Http.KeyValuePair>();
		const pair = org.nativescript.widgets.Async.Http.KeyValuePair;

		for (const key in options.headers) {
			arrayList.add(new pair(key, options.headers[key] + ''));
		}

		javaOptions.headers = arrayList;
	}

	// pass the maximum available image size to the request options in case we need a bitmap conversion
	javaOptions.screenWidth = Screen.mainScreen.widthPixels;
	javaOptions.screenHeight = Screen.mainScreen.heightPixels;

	return javaOptions;
}

export function requestInternal<T extends object>(options: HttpRequestOptions, contentHandler?: T): Promise<HttpResponse<BaseHttpContent & T>> {
	if (options === undefined || options === null) {
		// TODO: Shouldn't we throw an error here - defensive programming
		return;
	}

	return new Promise<HttpResponse<BaseHttpContent & T>>((resolve, reject) => {
		try {
			// initialize the options
			const javaOptions = buildJavaOptions(options);

			// // send request data to network debugger
			// if (global.__inspector && global.__inspector.isConnected) {
			// 	NetworkAgent.requestWillBeSent(requestIdCounter, options);
			// }

			if (__DEV__) {
				const network = domainDebugger.getNetwork();
				const debugRequest = network && network.create();

				if (options.url && debugRequest) {
					const timestamp = Date.now() / 1000;
					debugRequests.set(requestIdCounter, {
						debugRequest,
						timestamp,
					});
					const request = {
						url: options.url,
						method: 'GET',
						headers: options.headers,
						timestamp,
					};
					debugRequest.requestWillBeSent(request);
				}
			}

			// Remember the callbacks so that we can use them when the CompleteCallback is called
			pendingRequests.set(requestIdCounter, {
				url: options.url,
				contentHandler,
				resolveCallback: resolve,
				rejectCallback: reject,
			});

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
