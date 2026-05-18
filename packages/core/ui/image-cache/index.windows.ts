export * from './image-cache-common';

import * as common from './image-cache-common';
import { request as httpRequest } from '../../http/http-request';
import { Trace } from '../../trace';

function bitmapFromBytesAsync(bytes: Uint8Array): Promise<any> {
	return new Promise((resolve, reject) => {
		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(bytes as never);
			const buffer = writer.DetachBuffer();
			const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
			NSWinRT.toPromise((stream as any).WriteAsync(buffer)).then(
				() => {
					try {
						(stream as any).Seek(0);
						const bmp = new (Windows as any).UI.Xaml.Media.Imaging.BitmapImage();
						NSWinRT.toPromise(bmp.SetSourceAsync(stream)).then(
							() => resolve(bmp),
							(err: any) => reject(err)
						);
					} catch (e) {
						reject(e);
					}
				},
				(err: any) => reject(err)
			);
		} catch (e) {
			reject(e);
		}
	});
}

export class Cache extends common.Cache {
	private _cache = new Map<string, any>();

	constructor() {
		super();
	}

	public _downloadCore(request: common.DownloadRequest) {
		httpRequest({ url: request.url, method: 'GET', responseType: 'arraybuffer' }).then(
			(response) => {
				try {
					const raw = response.content?.raw;
					const bytes = raw instanceof Uint8Array ? raw : raw instanceof ArrayBuffer ? new Uint8Array(raw) : null;
					if (!bytes) {
						this._onDownloadError(request.key, new Error('No data'));
						return;
					}

					bitmapFromBytesAsync(bytes).then(
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
