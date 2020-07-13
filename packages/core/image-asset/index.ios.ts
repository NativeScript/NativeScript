import { ImageAssetBase, getRequestedImageSize } from './image-asset-common';
import { path as fsPath, knownFolders } from '../file-system';

export * from './image-asset-common';

export class ImageAsset extends ImageAssetBase {
	private _ios: PHAsset;

	constructor(asset: string | PHAsset | UIImage) {
		super();
		if (typeof asset === 'string') {
			if (asset.indexOf('~/') === 0) {
				asset = fsPath.join(knownFolders.currentApp().path, asset.replace('~/', ''));
			}

			this.nativeImage = UIImage.imageWithContentsOfFile(asset);
		} else if (asset instanceof UIImage) {
			this.nativeImage = asset;
		} else {
			this.ios = asset;
		}
	}

	get ios(): PHAsset {
		return this._ios;
	}

	set ios(value: PHAsset) {
		this._ios = value;
	}

	public getImageAsync(callback: (image, error) => void) {
		if (!this.ios && !this.nativeImage) {
			callback(null, 'Asset cannot be found.');
		}

		let srcWidth = this.nativeImage ? this.nativeImage.size.width : this.ios.pixelWidth;
		let srcHeight = this.nativeImage ? this.nativeImage.size.height : this.ios.pixelHeight;
		let requestedSize = getRequestedImageSize({ width: srcWidth, height: srcHeight }, this.options);

		if (this.nativeImage) {
			let newSize = CGSizeMake(requestedSize.width, requestedSize.height);
			let resizedImage = this.scaleImage(this.nativeImage, newSize);
			callback(resizedImage, null);

			return;
		}

		let imageRequestOptions = PHImageRequestOptions.alloc().init();
		imageRequestOptions.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;
		imageRequestOptions.networkAccessAllowed = true;

		PHImageManager.defaultManager().requestImageForAssetTargetSizeContentModeOptionsResultHandler(this.ios, requestedSize, PHImageContentMode.AspectFit, imageRequestOptions, (image, imageResultInfo) => {
			if (image) {
				let resultImage = this.scaleImage(image, requestedSize);
				callback(resultImage, null);
			} else {
				callback(null, imageResultInfo.valueForKey(PHImageErrorKey));
			}
		});
	}

	private scaleImage(image: UIImage, requestedSize: { width: number; height: number }): UIImage {
		// scaleFactor = 0 takes the scale factor of the devices's main screen.
		const scaleFactor = this.options && this.options.autoScaleFactor === false ? 1.0 : 0.0;

		UIGraphicsBeginImageContextWithOptions(requestedSize, false, scaleFactor);
		image.drawInRect(CGRectMake(0, 0, requestedSize.width, requestedSize.height));
		let resultImage = UIGraphicsGetImageFromCurrentImageContext();
		UIGraphicsEndImageContext();

		return resultImage;
	}
}
