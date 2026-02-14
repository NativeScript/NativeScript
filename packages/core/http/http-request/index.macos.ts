import * as types from '../../utils/types';
import * as domainDebugger from '../../debugger';
import { getFilenameFromUrl } from './http-request-common';
import { File } from '../../file-system';
import type { HttpRequestOptions, HttpResponse, Headers } from '../http-interfaces';
import { HttpResponseEncoding } from '../http-interfaces';

const GET = 'GET';
const USER_AGENT_HEADER = 'User-Agent';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)';

const sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration;
const queue = NSOperationQueue.mainQueue;

function parseJSON(source: string): any {
	const src = source.trim();
	if (src.lastIndexOf(')') === src.length - 1) {
		return JSON.parse(src.substring(src.indexOf('(') + 1, src.lastIndexOf(')')));
	}
	return JSON.parse(src);
}

let defaultSession: NSURLSession;
function ensureDefaultSession() {
	if (!defaultSession) {
		defaultSession = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);
	}
}

export function request(options: HttpRequestOptions): Promise<HttpResponse> {
	return new Promise<HttpResponse>((resolve, reject) => {
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
				urlRequest.HTTPBody = NSString.stringWithString(options.content.toString()).dataUsingEncoding(NSUTF8StringEncoding);
			} else if (options.content instanceof ArrayBuffer) {
				urlRequest.HTTPBody = NSData.dataWithData(options.content as any);
			}

			if (types.isNumber(options.timeout)) {
				urlRequest.timeoutInterval = options.timeout / 1000;
			}

			ensureDefaultSession();

			let timestamp = -1;
			const dataTask = defaultSession.dataTaskWithRequestCompletionHandler(urlRequest, (data: NSData, response: NSHTTPURLResponse, error: NSError) => {
				if (error) {
					reject(new Error(error.localizedDescription));
					return;
				}

				const headers: Headers = {};
				if (response && response.allHeaderFields) {
					const headerFields = response.allHeaderFields;
					headerFields.enumerateKeysAndObjectsUsingBlock((key, value) => {
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

				resolve({
					content: {
						raw: data,
						toArrayBuffer: () => interop.bufferFromData(data),
						toString: (encoding?: any) => {
							const str = NSDataToString(data, encoding);
							if (typeof str === 'string') {
								return str;
							}
							throw new Error('Response content may not be converted to string');
						},
						toJSON: (encoding?: any) => parseJSON(NSDataToString(data, encoding)),
						toImage: () => Promise.reject(new Error('Response content may not be converted to an Image on macOS')),
						toFile: (destinationFilePath?: string) => {
							if (!destinationFilePath) {
								destinationFilePath = getFilenameFromUrl(options.url);
							}
							if (data instanceof NSData) {
								const file = File.fromPath(destinationFilePath);
								data.writeToFileAtomically(destinationFilePath, true);
								return file;
							}
							throw new Error(`Cannot save file with path: ${destinationFilePath}.`);
						},
					},
					statusCode: response.statusCode,
					headers: headers,
				});
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
	let code = NSUTF8StringEncoding;

	if (encoding === HttpResponseEncoding.GBK) {
		code = CFStringEncodings.kCFStringEncodingGB_18030_2000;
	}

	let encodedString = NSString.alloc().initWithDataEncoding(data, code);
	if (!encodedString) {
		code = NSISOLatin1StringEncoding;
		encodedString = NSString.alloc().initWithDataEncoding(data, code);
	}

	return encodedString.toString();
}

export function addHeader(headers: Headers, key: string, value: string): void {
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
