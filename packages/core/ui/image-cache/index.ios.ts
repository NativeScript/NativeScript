// imported for definition purposes only
import * as httpRequestModule from '../../http/http-request';

import * as common from './image-cache-common';
import { Trace } from '../../trace';
import * as utils from '../../utils';

let httpRequest: typeof httpRequestModule;
function ensureHttpRequest() {
	if (!httpRequest) {
		httpRequest = require('../../http/http-request');
	}
}

@NativeClass
class MemmoryWarningHandler extends NSObject {
	static new(): MemmoryWarningHandler {
		return <MemmoryWarningHandler>super.new();
	}

	private _cache: NSCache<any, any>;

	public initWithCache(cache: NSCache<any, any>): MemmoryWarningHandler {
		this._cache = cache;

		NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(this, 'clearCache', 'UIApplicationDidReceiveMemoryWarningNotification', null);
		if (Trace.isEnabled()) {
			Trace.write('[MemmoryWarningHandler] Added low memory observer.', Trace.categories.Debug);
		}

		return this;
	}

	public dealloc(): void {
		NSNotificationCenter.defaultCenter.removeObserverNameObject(this, 'UIApplicationDidReceiveMemoryWarningNotification', null);
		if (Trace.isEnabled()) {
			Trace.write('[MemmoryWarningHandler] Removed low memory observer.', Trace.categories.Debug);
		}
		super.dealloc();
	}

	public clearCache(): void {
		if (Trace.isEnabled()) {
			Trace.write('[MemmoryWarningHandler] Clearing Image Cache.', Trace.categories.Debug);
		}
		this._cache.removeAllObjects();
		utils.GC();
	}

	public static ObjCExposedMethods = {
		clearCache: { returns: interop.types.void, params: [] },
	};
}

export class Cache extends common.Cache {
	private _cache: NSCache<any, any>;

	//@ts-ignore
	private _memoryWarningHandler: MemmoryWarningHandler;

	constructor() {
		super();

		this._cache = new NSCache<any, any>();

		this._memoryWarningHandler = MemmoryWarningHandler.new().initWithCache(this._cache);
	}

	public _downloadCore(request: common.DownloadRequest) {
		ensureHttpRequest();

		httpRequest.request({ url: request.url, method: 'GET' }).then(
			(response) => {
				try {
					const image = UIImage.alloc().initWithData(response.content.raw);
					if (image) {
						this._onDownloadCompleted(request.key, image);
					} else {
						this._onDownloadError(request.key, new Error('No result for provided url'));
					}
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
		return this._cache.objectForKey(key);
	}

	public set(key: string, image: any): void {
		this._cache.setObjectForKey(image, key);
	}

	public remove(key: string): void {
		this._cache.removeObjectForKey(key);
	}

	public clear() {
		this._cache.removeAllObjects();
		utils.GC();
	}
}
