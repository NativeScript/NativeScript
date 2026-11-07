import * as common from './image-cache-common';
import { ImageSource } from '../../image-source';

export * from './image-cache-common';

export class Cache extends common.Cache {
	private _cache = new Map<string, any>();

	public _downloadCore(request: common.DownloadRequest) {
		fetch(request.url)
			.then((response) => response.arrayBuffer())
			.then((data) => this._onDownloadCompleted(request.key, (ImageSource.fromDataSync(data) as any)?.linux))
			.catch((error) => this._onDownloadError(request.key, error));
	}

	public get(key: string): any {
		return this._cache.get(key);
	}

	public set(key: string, image: any): void {
		this._cache.set(key, image);
	}

	public remove(key: string): void {
		this._cache.delete(key);
	}

	public clear() {
		this._cache.clear();
	}
}
