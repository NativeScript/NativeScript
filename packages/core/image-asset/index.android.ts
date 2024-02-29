import { ImageAssetBase, getRequestedImageSize } from './image-asset-common';
import { path as fsPath, knownFolders } from '../file-system';
import { android, wrapNativeException } from '../utils';
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
			android.getApplicationContext(),
			this.android,
			JSON.stringify(this.options || {}),
			new org.nativescript.widgets.Utils.AsyncImageCallback({
				onSuccess(bitmap) {
					callback(bitmap, null);
				},
				onError(ex) {
					callback(null, wrapNativeException(ex));
				},
			})
		);
	}
	public getImage() {
		return new Promise((resolve, reject) => {
			org.nativescript.widgets.Utils.loadImageAsync(
				android.getApplicationContext(),
				this.android,
				JSON.stringify(this.options || {}),
				new org.nativescript.widgets.Utils.AsyncImageCallback({
					onSuccess: resolve,
					onError: reject,
				})
			);
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}
}
