import { ImageAssetBase, getRequestedImageSize } from './image-asset-common';
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
			if (typeof this._windows === 'string') {
				const path = this._windows;
				(Windows.Storage.StorageFile.GetFileFromPathAsync(path) as any).then(
					(file: any) => {
						callback(file, null);
					},
					(err: any) => callback(null, err),
				);
			} else {
				callback(this._windows, null);
			}
		} catch (ex) {
			callback(null, ex);
		}
	}
}
