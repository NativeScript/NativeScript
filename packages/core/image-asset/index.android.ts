import { ImageAssetBase, getRequestedImageSize } from './image-asset-common';
import { path as fsPath, knownFolders } from '../file-system';
import { Screen } from '../platform/screen';
import { getNativeApp } from '../application/helpers-common';
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
		// Fix for issue #6289: ensure numeric width/height
		if (this.options) {
			if (typeof this.options.width === "string") {
				this.options.width = parseInt(this.options.width, 10);
			}
			if (typeof this.options.height === "string") {
				this.options.height = parseInt(this.options.height, 10);
			}
		}
	
		org.nativescript.widgets.Utils.loadImageAsync(
			getNativeApp<android.app.Application>().getApplicationContext(),
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
			}),
		);
	}
	
}
