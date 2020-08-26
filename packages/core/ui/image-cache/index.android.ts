import * as common from './image-cache-common';
import { Trace } from '../../trace';

let LruBitmapCacheClass;
function ensureLruBitmapCacheClass() {
	if (LruBitmapCacheClass) {
		return;
	}

	@NativeClass
	class LruBitmapCache extends android.util.LruCache<string, android.graphics.Bitmap> {
		constructor(cacheSize: number) {
			super(cacheSize);

			return global.__native(this);
		}

		public sizeOf(key: string, bitmap: android.graphics.Bitmap): number {
			// The cache size will be measured in kilobytes rather than
			// number of items.
			const result = Math.round(bitmap.getByteCount() / 1024);

			return result;
		}
	}

	LruBitmapCacheClass = LruBitmapCache;
}

export class Cache extends common.Cache {
	private _callback: any;
	private _cache: android.util.LruCache<string, android.graphics.Bitmap>;

	constructor() {
		super();

		ensureLruBitmapCacheClass();
		const maxMemory = java.lang.Runtime.getRuntime().maxMemory() / 1024;
		const cacheSize = maxMemory / 8;
		this._cache = new LruBitmapCacheClass(cacheSize);

		const that = new WeakRef(this);
		this._callback = new org.nativescript.widgets.Async.CompleteCallback({
			onComplete: function (result: any, context: any) {
				const instance = that.get();
				if (instance) {
					if (result) {
						instance._onDownloadCompleted(context, result);
					} else {
						instance._onDownloadError(context, new Error('No result in CompletionCallback'));
					}
				}
			},
			onError: function (err: string, context: any) {
				const instance = that.get();
				if (instance) {
					instance._onDownloadError(context, new Error(err));
				}
			},
		});
	}

	public _downloadCore(request: common.DownloadRequest) {
		org.nativescript.widgets.Async.Image.download(request.url, this._callback, request.key);
	}

	public get(key: string): any {
		const result = this._cache.get(key);

		return result;
	}

	public set(key: string, image: any): void {
		try {
			if (key && image) {
				this._cache.put(key, image);
			}
		} catch (err) {
			Trace.write('Cache set error: ' + err, Trace.categories.Error, Trace.messageType.error);
		}
	}

	public remove(key: string): void {
		this._cache.remove(key);
	}

	public clear() {
		this._cache.evictAll();
	}
}
