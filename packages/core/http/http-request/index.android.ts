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
interface Call {
	url: string;
	resolveCallback: (value: httpModule.HttpResponse | PromiseLike<httpModule.HttpResponse>) => void;
	rejectCallback: (reason?: any) => void;
	call: okhttp3.Call;
}
const pendingRequests: Record<number, Call> = {};

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

function onRequestComplete(requestId: number, call: okhttp3.Call, result: okhttp3.Response) {
	const callbacks = pendingRequests[requestId];
	delete pendingRequests[requestId];

	// if (result.error) {
	// 	callbacks.rejectCallback(new Error(result.error.toString()));

	// 	return;
	// }

	// read the headers
	const headers: httpModule.Headers = {};
	if (result.headers) {
		const jHeaders = result.headers();
		const names = jHeaders.names();
		Array.from(names.toArray()).forEach((name: string) => {
			addHeader(headers, name, jHeaders.get(name));
		});
	}

	// send response data (for requestId) to network debugger
	if (global.__inspector && global.__inspector.isConnected) {
		// TODO: adapt network agent to support okHttp results
		// NetworkAgent.responseReceived(requestId, result, headers);
	}
	// TODO: process the full result.body in java and in a background thread
	const bytes = result.body().bytes();
	const raw = new java.io.ByteArrayOutputStream(bytes.length);
	raw.write(bytes, 0, bytes.length);
	result.body().close();

	callbacks.resolveCallback({
		content: {
			raw: raw,
			toArrayBuffer: () => Uint8Array.from(raw.toByteArray()).buffer,
			toString: (encoding?: HttpResponseEncoding) => {
				let str: string;
				if (encoding) {
					str = decodeResponse(raw, encoding);
				} else {
					str = raw.toString();
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
					str = decodeResponse(raw, encoding);
				} else {
					str = raw.toString();
				}

				return parseJSON(str);
			},
			toImage: () => {
				ensureImageSource();

				return new Promise<any>((resolveImage, rejectImage) => {
					// TODO: this should be done in a background thread
					// currently it's done for every request, even if `toImage` is not called
					// so ideally we should do it lazily
					try {
						const bitmapOptions = new android.graphics.BitmapFactory.Options();
						bitmapOptions.inJustDecodeBounds = true;
						let nativeImage: android.graphics.Bitmap = null;
						android.graphics.BitmapFactory.decodeByteArray(raw.buf, null, raw.size(), bitmapOptions);
						if (bitmapOptions.outWidth > 0 && bitmapOptions.outHeight > 0) {
							let scale = 1;
							const height = bitmapOptions.outHeight;
							const width = bitmapOptions.outWidth;

							// if ((options.screenWidth > 0 && bitmapOptions.outWidth > options.screenWidth) ||
							// 	(options.screenHeight > 0 && bitmapOptions.outHeight > options.screenHeight)) {
							// 	final int halfHeight = height / 2;
							// 	final int halfWidth = width / 2;

							// 	// scale down the image since it is larger than the
							// 	// screen resolution
							// 	while ((halfWidth / scale) > options.screenWidth && (halfHeight / scale) > options.screenHeight) {
							// 		scale *= 2;
							// 	}
							// }

							bitmapOptions.inJustDecodeBounds = false;
							bitmapOptions.inSampleSize = scale;
							nativeImage = android.graphics.BitmapFactory.decodeByteArray(raw.buf, null, raw.size(), bitmapOptions);
						}

						resolveImage(new imageSource.ImageSource(nativeImage));
					} catch (e) {
						console.log(e.stack);
						rejectImage(new Error('Response content may not be converted to an Image'));
					}
					// if (result.responseAsImage != null) {
					// 	resolveImage(new imageSource.ImageSource(result.responseAsImage));
					// } else {
					// 	rejectImage(new Error('Response content may not be converted to an Image'));
					// }
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
					stream.write(raw.toByteArray());

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
		statusCode: result.code(),
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
	const builder = new okhttp3.Request.Builder().url(options.url);

	let contentType: string | null = null;
	if (options.headers) {
		for (const key in options.headers) {
			if (key.toLowerCase() === 'content-type') {
				contentType = options.headers[key];
			}
			builder.addHeader(key, `${options.headers[key]}`);
		}
	}
	const mediaType = contentType ? okhttp3.MediaType.parse(contentType) : null;

	let body: okhttp3.RequestBody | null = null;
	if (typeof options.content === 'string' || options.content instanceof FormData) {
		const nativeString = new java.lang.String(options.content.toString());
		const nativeBytes = nativeString.getBytes('UTF-8');
		const nativeBuffer = java.nio.ByteBuffer.wrap(nativeBytes);
		body = okhttp3.RequestBody.create(nativeBuffer, mediaType);
	} else if (options.content instanceof ArrayBuffer) {
		const typedArray = new Uint8Array(options.content as ArrayBuffer);
		const nativeBuffer = java.nio.ByteBuffer.wrap(Array.from(typedArray));
		body = okhttp3.RequestBody.create(nativeBuffer, mediaType);
	}

	if (typeof options.method === 'string') {
		builder.method(options.method, body);
		javaOptions.method = options.method;
	}
	if (typeof options.timeout === 'number') {
		javaOptions.timeout = options.timeout;
	}
	if (typeof options.dontFollowRedirects === 'boolean') {
		javaOptions.dontFollowRedirects = options.dontFollowRedirects;
	}

	// pass the maximum available image size to the request options in case we need a bitmap conversion
	javaOptions.screenWidth = Screen.mainScreen.widthPixels;
	javaOptions.screenHeight = Screen.mainScreen.heightPixels;

	// return javaOptions;
	return builder.build();
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
			const clientBuilder = new okhttp3.OkHttpClient.Builder();
			clientBuilder.followRedirects(!options.dontFollowRedirects);
			if (options.timeout) {
				// TODO: which one should we use?
				// clientBuilder.callTimeout(options.timeout, java.util.concurrent.TimeUnit.MILLISECONDS);
				// clientBuilder.readTimeout(options.timeout, java.util.concurrent.TimeUnit.MILLISECONDS);
				clientBuilder.connectTimeout(options.timeout, java.util.concurrent.TimeUnit.MILLISECONDS);
			}
			const client = clientBuilder.build();

			const call = client.newCall(javaOptions);
			const requestId = requestIdCounter;
			call.enqueue(
				new okhttp3.Callback({
					onFailure(param0, param1) {
						onRequestError(param1.getLocalizedMessage(), requestId);
					},
					onResponse(param0, param1) {
						onRequestComplete(requestId, param0, param1);
					},
				})
			);

			// remember the callbacks so that we can use them when the CompleteCallback is called
			const callbacks = {
				url: options.url,
				resolveCallback: resolve,
				rejectCallback: reject,
				call,
			};
			if (options.signal) {
				(options.signal as any).on('abort', () => {
					call.cancel();
				});
				// ).onabort = () => {
				// 	call.cancel();
				// }
			}
			pendingRequests[requestIdCounter] = callbacks;

			// ensureCompleteCallback();
			//make the actual async call
			// org.nativescript.widgets.Async.Http.MakeRequest(javaOptions, completeCallback, new java.lang.Integer(requestIdCounter));

			// increment the id counter
			requestIdCounter++;
		} catch (ex) {
			reject(ex);
		}
	});
}

function decodeResponse(raw: java.io.ByteArrayOutputStream, encoding?: HttpResponseEncoding) {
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
