import { ImageAssetBase } from './image-asset-common';
import { path as fsPath, knownFolders } from '../file-system';

export * from './image-asset-common';

export class ImageAsset extends ImageAssetBase {
	private _windows: any;

	constructor(asset: string | any) {
		super();
		if (typeof asset === 'string') {
			if (asset.indexOf('~/') === 0) {
				asset = fsPath.join(knownFolders.currentApp().path, asset.replace('~/', ''));
			}
			this._windows = asset;
		} else {
			this._windows = asset;
		}
	}

	get windows(): any {
		return this._windows;
	}

	set windows(value: any) {
		this._windows = value;
	}

	public getImageAsync(callback: (image: any, error: any) => void) {
		try {
			// Use _windows first, fall back to base-class nativeImage (set via asset.nativeImage = x).
			// fromAsset dispatches on type: string paths go through fromFile, StorageFile objects
			// go through OpenAsync — no conversion needed here.
			const image = this._windows ?? this.nativeImage;
			if (image == null) {
				callback(null, new Error('ImageAsset: no image data'));
				return;
			}
			callback(image, null);
		} catch (ex) {
			callback(null, ex);
		}
	}
}
