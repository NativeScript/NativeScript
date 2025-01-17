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

	/**
	 * Validates and adjusts image dimensions to prevent bitmap size exceeding Android's 32-bit limit.
	 * Android has a limitation where bitmap size (width * height) cannot exceed 2^31-1.
	 * This method ensures the dimensions are within safe bounds while maintaining aspect ratio.
	 *
	 * @param {number|string} width - The desired width of the image
	 * @param {number|string} height - The desired height of the image
	 * @returns {{ width: number; height: number }} Object containing validated dimensions
	 *
	 * @example
	 * // Returns safe dimensions that won't exceed Android's bitmap size limit
	 * const safe = validateDimensions("4000", "3000");
	 */
	private _validateDimensions(width: number | string, height: number | string): { width: number; height: number } {
		const parseSize = (size: number | string): number => {
			return typeof size === 'string' ? parseInt(size, 10) : size;
		};

		let w = parseSize(width);
		let h = parseSize(height);

		// Check for 32-bit limitation (2^31 - 1, leaving some headroom)
		const MAX_DIMENSION = Math.floor(Math.sqrt(Math.pow(2, 31) - 1));

		// Check if each dimension exceeds MAX_DIMENSION
		w = Math.min(w, MAX_DIMENSION);
		h = Math.min(h, MAX_DIMENSION);

		// Check the total pixel count
		if (w * h > Math.pow(2, 31) - 1) {
			const scale = Math.sqrt((Math.pow(2, 31) - 1) / (w * h));
			w = Math.floor(w * scale);
			h = Math.floor(h * scale);
		}

		return { width: w, height: h };
	}

	/**
	 * Asynchronously loads an image with the specified dimensions.
	 * Handles string/number dimension types and applies size validation for Android bitmap limitations.
	 *
	 * @param {Function} callback - Callback function that receives (image, error)
	 * @param {{ width?: number; height?: number }} [options] - Optional dimensions for the image
	 */
	public getImageAsync(callback: (image, error) => void, options?: { width?: number; height?: number }) {
		if (options?.width || options?.height) {
			const validDimensions = this._validateDimensions(options.width || this.options.width || 0, options.height || this.options.height || 0);
			options.width = validDimensions.width;
			options.height = validDimensions.height;
		}

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
			}),
		);
	}
}
