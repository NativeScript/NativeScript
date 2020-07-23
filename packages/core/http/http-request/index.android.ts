// imported for definition purposes only
import * as httpModule from '../../http';
import * as imageSourceModule from '../../image-source';
import { Screen } from '../../platform';
import * as fsModule from '../../file-system';

import { getFilenameFromUrl } from './http-request-common';
import { NetworkAgent } from '../../debugger';

export enum HttpResponseEncoding {
	UTF8,
	GBK,
}

function parseJSON(source: string): any {
	const src = source.trim();
	if (src.lastIndexOf(')') === src.length - 1) {
		return JSON.parse(src.substring(src.indexOf('(') + 1, src.lastIndexOf(')')));
	}

	return JSON.parse(src);
}

let requestIdCounter = 0;
const pendingRequests = {};

let imageSource: typeof imageSourceModule;
function ensureImageSource() {
	if (!imageSource) {
		imageSource = require('../../image-source');
	}
}

let fs: typeof fsModule;
function ensureFileSystem() {
	if (!fs) {
		fs = require('../../file-system');
	}
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
	const callbacks = pendingRequests[requestId];
	delete pendingRequests[requestId];

	if (result.error) {
		callbacks.rejectCallback(new Error(result.error.toString()));

		return;
	}

	// read the headers
	const headers: httpModule.Headers = {};
	if (result.headers) {
		const jHeaders = result.headers;
		const length = jHeaders.size();
		let pair: org.nativescript.widgets.Async.Http.KeyValuePair;
		for (let i = 0; i < length; i++) {
			pair = jHeaders.get(i);
			addHeader(headers, pair.key, pair.value);
		}
	}

	// send response data (for requestId) to network debugger
	if (global.__inspector && global.__inspector.isConnected) {
		NetworkAgent.responseReceived(requestId, result, headers);
	}

	callbacks.resolveCallback({
		content: {
			raw: result.raw,
			toArrayBuffer: () => Uint8Array.from(result.raw.toByteArray()).buffer,
			toString: (encoding?: HttpResponseEncoding) => {
				let str: string;
				if (encoding) {
					str = decodeResponse(result.raw, encoding);
				} else {
					str = result.responseAsString;
				}
				if (typeof str === 'string') {
					return str;
				} else {
					throw new Error('Response content may not be converted to string');
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
						resolveImage(new imageSource.ImageSource(result.responseAsImage));
					} else {
						rejectImage(new Error('Response content may not be converted to an Image'));
					}
				});
			},
			toFile: (destinationFilePath: string) => {
				ensureFileSystem();

				if (!destinationFilePath) {
					destinationFilePath = getFilenameFromUrl(callbacks.url);
				}
				let stream: java.io.FileOutputStream;
				try {
					// ensure destination path exists by creating any missing parent directories
					const file = fs.File.fromPath(destinationFilePath);

					const javaFile = new java.io.File(destinationFilePath);
					stream = new java.io.FileOutputStream(javaFile);
					stream.write(result.raw.toByteArray());

					return file;
				} catch (exception) {
					throw new Error(`Cannot save file with path: ${destinationFilePath}.`);
				} finally {
					if (stream) {
						stream.close();
					}
				}
			},
		},
		statusCode: result.statusCode,
		headers: headers,
	});
}

function onRequestError(error: string, requestId: number) {
	const callbacks = pendingRequests[requestId];
	delete pendingRequests[requestId];
	if (callbacks) {
		callbacks.rejectCallback(new Error(error));
	}
}

function buildJavaOptions(options: httpModule.HttpRequestOptions) {
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

		for (let key in options.headers) {
			arrayList.add(new pair(key, options.headers[key] + ''));
		}

		javaOptions.headers = arrayList;
	}

	// pass the maximum available image size to the request options in case we need a bitmap conversion
	javaOptions.screenWidth = Screen.mainScreen.widthPixels;
	javaOptions.screenHeight = Screen.mainScreen.heightPixels;

	return javaOptions;
}

export function request(options: httpModule.HttpRequestOptions): Promise<httpModule.HttpResponse> {
	if (options === undefined || options === null) {
		// TODO: Shouldn't we throw an error here - defensive programming
		return;
	}

	return new Promise<httpModule.HttpResponse>((resolve, reject) => {
		try {
			// initialize the options
			const javaOptions = buildJavaOptions(options);

			// send request data to network debugger
			if (global.__inspector && global.__inspector.isConnected) {
				NetworkAgent.requestWillBeSent(requestIdCounter, options);
			}

			// remember the callbacks so that we can use them when the CompleteCallback is called
			const callbacks = {
				url: options.url,
				resolveCallback: resolve,
				rejectCallback: reject,
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
	let charsetName = 'UTF-8';
	if (encoding === HttpResponseEncoding.GBK) {
		charsetName = 'GBK';
	}

	return raw.toString(charsetName);
}

export function addHeader(headers: httpModule.Headers, key: string, value: string): void {
	if (!headers[key]) {
		headers[key] = value;
	} else if (Array.isArray(headers[key])) {
		(<string[]>headers[key]).push(value);
	} else {
		const values: string[] = [<string>headers[key]];
		values.push(value);
		headers[key] = values;
	}
}
