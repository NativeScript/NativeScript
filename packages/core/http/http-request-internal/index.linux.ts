import type { HttpRequestOptions, HttpResponse, Headers } from '../http-interfaces';
import { HttpResponseEncoding } from '../http-interfaces';
import { BaseHttpContent } from '.';
import { addHeader } from './http-request-internal-common';
export { addHeader } from './http-request-internal-common';

// The runtime's fetch (native HTTP client off the JS thread).
export function requestInternal<T extends object>(options: HttpRequestOptions, contentHandler?: T): Promise<HttpResponse<BaseHttpContent & T>> {
	if (!options.url) {
		return Promise.reject(new Error('Request url was empty.'));
	}
	const controller = new AbortController();
	const timer = options.timeout > 0 ? setTimeout(() => controller.abort(), options.timeout) : null;
	return fetch(options.url.trim(), {
		method: options.method || 'GET',
		headers: options.headers as any,
		body: options.content as any,
		signal: controller.signal,
		redirect: options.dontFollowRedirects ? 'manual' : 'follow',
	})
		.then(async (response) => {
			const headers: Headers = {};
			response.headers.forEach((value, key) => addHeader(headers, key, value));
			const raw = await response.arrayBuffer();
			const content = {
				raw,
				requestURL: options.url,
				toNativeImage: (): Promise<any> => {
					const { ImageSource } = require('../../image-source');
					return Promise.resolve(ImageSource.fromDataSync?.(raw)?.linux ?? null);
				},
				toNativeString: (encoding?: HttpResponseEncoding) => new TextDecoder(encoding === HttpResponseEncoding.GBK ? 'gbk' : 'utf-8').decode(raw),
			};
			if (contentHandler != null && typeof contentHandler === 'object' && !Array.isArray(contentHandler)) {
				Object.assign(content, contentHandler);
			}
			return { content: content as BaseHttpContent & T, statusCode: response.status, headers };
		})
		.finally(() => timer && clearTimeout(timer));
}
