import { ImageAssetBase, getRequestedImageSize } from "./image-asset-common";
import { path as fsPath, knownFolders } from "../file-system";
import { queueGC } from "../utils";

export * from "./image-asset-common";

export class ImageAsset extends ImageAssetBase {
	private _ios: PHAsset;

	constructor(asset: string | PHAsset | UIImage) {
		super();
		if (typeof asset === "string") {
			if (asset.indexOf("~/") === 0) {
				asset = fsPath.join(knownFolders.currentApp().path, asset.replace("~/", ""));
			}

			this.nativeImage = UIImage.imageWithContentsOfFile(asset);
		} else if (asset instanceof UIImage) {
			this.nativeImage = asset;
		} else {
			this.ios = asset;
		}
	}

	// @ts-ignore
	get ios(): PHAsset {
		return this._ios;
	}

	set ios(value: PHAsset) {
		this._ios = value;
	}

	/**
	 * Asynchronously loads an image and optionally resizes it.
	 * Handles both string and number type dimensions by converting strings to numbers.
	 *
	 * @param {Function} callback - Callback function that receives (image, error)
	 * @param {{ width?: number|string; height?: number|string }} [options] - Optional dimensions for the image
	 */
	public getImageAsync(callback: (image, error) => void, options?: { width?: number | string; height?: number | string }) {
		if (options) {
			if (typeof options.width === "string") {
				options.width = parseInt(options.width, 10);
			}
			if (typeof options.height === "string") {
				options.height = parseInt(options.height, 10);
			}
		}

		if (!this.ios && !this.nativeImage) {
			callback(null, "Asset cannot be found.");
		}

		const srcWidth = this.nativeImage ? this.nativeImage.size.width : this.ios.pixelWidth;
		const srcHeight = this.nativeImage ? this.nativeImage.size.height : this.ios.pixelHeight;
		const requestedSize = getRequestedImageSize({ width: srcWidth, height: srcHeight }, this.options);

		if (this.nativeImage) {
			callback(this.scaleImage(this.nativeImage, CGSizeMake(requestedSize.width, requestedSize.height)), null);
			queueGC();
			return;
		}

		const imageRequestOptions = PHImageRequestOptions.alloc().init();
		imageRequestOptions.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;
		imageRequestOptions.networkAccessAllowed = true;

		PHImageManager.defaultManager().requestImageForAssetTargetSizeContentModeOptionsResultHandler(this.ios, requestedSize, PHImageContentMode.AspectFit, imageRequestOptions, (image, imageResultInfo) => {
			if (image) {
				callback(this.scaleImage(image, requestedSize), null);
			} else {
				callback(null, imageResultInfo.valueForKey(PHImageErrorKey));
			}
			queueGC();
		});
	}

	/**
	 * Scales the image to the requested size while respecting device scale factor settings.
	 *
	 * @param {UIImage} image - The source UIImage to scale
	 * @param {{ width: number; height: number }} requestedSize - Target dimensions
	 * @returns {UIImage} Scaled image
	 * @private
	 */
	private scaleImage(image: UIImage, requestedSize: { width: number; height: number }): UIImage {
		return NativeScriptUtils.scaleImageWidthHeightScaleFactor(image, requestedSize.width, requestedSize.height, this.options?.autoScaleFactor === false ? 1.0 : 0.0);
	}
}
