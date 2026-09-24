export * from './image-cache-common';

import * as common from './image-cache-common';
import { request as httpRequest } from '../../http/http-request';
import { Trace } from '../../trace';

export class Cache extends common.Cache {
	private _cache = new Map<string, any>();

	constructor() {
		super();
	}

	public _downloadCore(request: common.DownloadRequest) {
		httpRequest({ url: request.url, method: 'GET' }).then(
			(response) => {
				try {
					const raw = response.content?.raw;
					const bytes = raw instanceof Uint8Array ? raw : raw instanceof ArrayBuffer ? new Uint8Array(raw) : null;
					if (!bytes) {
						this._onDownloadError(request.key, new Error('No data'));
						return;
					}

					NSWinRT.toPromise(NativeScript.Widgets.ImageHelper.LoadFromBufferAsync(bytes as never)).then(
						(bmp) => this._onDownloadCompleted(request.key, bmp),
						(err) => this._onDownloadError(request.key, err)
					);
				} catch (err) {
					this._onDownloadError(request.key, err);
				}
			},
			(err) => {
				this._onDownloadError(request.key, err);
			}
		);
	}

	public get(key: string): any {
		return this._cache.get(key);
	}

	public set(key: string, image: any): void {
		try {
			if (key && image) {
				this._cache.set(key, image);
			}
		} catch (err) {
			Trace.write('Cache set error: ' + err, Trace.categories.Error, Trace.messageType.error);
		}
	}

	public remove(key: string): void {
		this._cache.delete(key);
	}

	public clear() {
		this._cache.clear();
	}
}
