import type { HttpRequestOptions, HttpResponse, Headers } from '../http-interfaces';
import { HttpResponseEncoding } from '../http-interfaces';
import { BaseHttpContent } from '.';
import { addHeader } from './http-request-internal-common';
import { isMainThread, dispatchToMainThread } from '../../utils/mainthread-helper';
export { addHeader } from './http-request-internal-common';

export function requestInternal<T extends object>(options: HttpRequestOptions, contentHandler?: T): Promise<HttpResponse<BaseHttpContent & T>> {
	return new Promise<HttpResponse<BaseHttpContent & T>>((resolve, reject) => {
		if (!options.url) {
			reject(new Error('Request url was empty.'));
			return;
		}

		try {
			const httpClient = new Windows.Web.Http.HttpClient();
			const uri = new Windows.Foundation.Uri(options.url.trim());
			const method = new Windows.Web.Http.HttpMethod(options.method || 'GET');
			const requestMessage = new Windows.Web.Http.HttpRequestMessage(method, uri);

			if (options.headers) {
				for (const key in options.headers) {
					try {
						requestMessage.Headers.TryAppendWithoutValidation(key, options.headers[key] + '');
					} catch { }
				}
			}

			if (options.content) {
				if (typeof options.content === 'string') {
					requestMessage.Content = new Windows.Web.Http.HttpStringContent(options.content);
				} else if (options.content instanceof FormData) {
					requestMessage.Content = new Windows.Web.Http.HttpStringContent(options.content.toString());
				} else if (options.content instanceof ArrayBuffer) {
					const writer = new Windows.Storage.Streams.DataWriter();
					writer.WriteBytes(new Uint8Array(options.content as ArrayBuffer) as never);
					requestMessage.Content = new Windows.Web.Http.HttpBufferContent(writer.DetachBuffer());
				}
			}


			NSWinRT.toPromise(httpClient.SendRequestAsync(requestMessage)).then(
				(response: Windows.Web.Http.HttpResponseMessage) => {
					const statusCode: number = response.StatusCode as unknown as number;
					const headers: Headers = {};

					try {
						const Headers = response.Headers;
						const first = Headers.First();
						while (first && first.HasCurrent) {
							const header = first.Current;
							addHeader(headers, header.Key, header.Value);
							first.MoveNext();
						}
					} catch { }
					try {
						const Headers = response.Content.Headers;
						const first = Headers.First();
						while (first && first.HasCurrent) {
							const header = first.Current;
							addHeader(headers, header.Key, header.Value);
							first.MoveNext();
						}
					} catch { }

					NSWinRT.toPromise(response.Content.ReadAsBufferAsync()).then(
						(buffer: Windows.Storage.Streams.IBuffer) => {
							let bytes: Uint8Array;
							try {
								const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
								bytes = new Uint8Array(buffer.Length);
								reader.ReadBytes(bytes as never);
							} catch {
								bytes = new Uint8Array(0);
							}

							const rawBuffer = bytes.buffer as ArrayBuffer;

							const content = {
								raw: rawBuffer,
								requestURL: options.url,
								toNativeImage: (): Promise<any> => {
									return new Promise((resolve, reject) => {
										try {
											const writer = new Windows.Storage.Streams.DataWriter();
											writer.WriteBytes(bytes as never);
											const freshBuffer = writer.DetachBuffer();
											const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
											NSWinRT.toPromise((stream as any).WriteAsync(freshBuffer)).then(() => {
												const createBitmap = () => {
													try {
														(stream as any).Seek(0);
														const bmp = new Windows.UI.Xaml.Media.Imaging.BitmapImage();
														NSWinRT.toPromise(bmp.SetSourceAsync(stream)).then(
															() => { stream.Close(); resolve(bmp); },
															reject
														);
													} catch (e) { reject(e); }
												};
												if (isMainThread()) {
													createBitmap();
												} else {
													dispatchToMainThread(createBitmap);
												}
											}, reject);
										} catch (e) { reject(e); }
									});
								},
								toNativeString: (encoding?: HttpResponseEncoding) => {
									return BufferToString(buffer, encoding);
								},
							};

							if (contentHandler != null && typeof contentHandler === 'object' && !Array.isArray(contentHandler)) {
								Object.assign(content, contentHandler);
							}

							resolve({
								content: content as BaseHttpContent & T,
								statusCode,
								headers,
							});
						},
						(err: any) => reject(new Error(err?.message ?? String(err)))
					);
				},
			).catch((err: any) => {
				reject(new Error(err?.message ?? String(err)));
			});
		} catch (ex) {
			reject(ex);
		}
	});
}


function BufferToString(buffer: Windows.Storage.Streams.IBuffer, encoding?: HttpResponseEncoding): string {
	let encodingType = Windows.Security.Cryptography.BinaryStringEncoding.Utf8;
	if (encoding === HttpResponseEncoding.GBK) {
		encodingType = Windows.Security.Cryptography.BinaryStringEncoding.Utf8; // Windows does not support GBK, fallback to UTF-8
	}
	return Windows.Security.Cryptography.CryptographicBuffer.ConvertBinaryToString(
		encodingType,
		buffer);
}