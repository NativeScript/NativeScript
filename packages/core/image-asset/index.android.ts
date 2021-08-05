import { ImageAssetBase, getRequestedImageSize } from './image-asset-common';
import { path as fsPath, knownFolders } from '../file-system';
import { ad } from '../utils';
import { Screen } from '../platform';
export * from './image-asset-common';

export class ImageAsset extends ImageAssetBase {
	private _android: string; //file name of the image

	constructor(asset: string) {
		super();
		let fileName = typeof asset === 'string' ? asset.trim() : '';
		if (fileName.indexOf('~/') === 0) {
			fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace('~/', ''));
		}
		this.android = fileName;
	}

	// @ts-ignore
	get android(): string {
		return this._android;
	}

	set android(value: string) {
		this._android = value;
	}

	public getImageAsync(callback: (image, error) => void) {
		org.nativescript.widgets.Utils.loadImageAsync(
			ad.getApplicationContext(),
			this.android,
			JSON.stringify(this.options || {}),
			Screen.mainScreen.widthPixels,
			Screen.mainScreen.heightPixels,
			new org.nativescript.widgets.Utils.AsyncImageCallback({
				onSuccess(bitmap) {
					callback(bitmap, null);
				},
				onError(ex) {
					callback(null, ex);
				},
			})
		);
	}
}
