import { ImageAsset as ImageAssetDefinition, ImageAssetOptions } from '.';
import { Observable } from '../data/observable';
import { Screen } from '../platform';

export class ImageAssetBase extends Observable implements ImageAssetDefinition {
	private _options: ImageAssetOptions;
	private _nativeImage: any;

	ios: PHAsset;
	android: string;

	constructor() {
		super();
		this._options = { keepAspectRatio: true, autoScaleFactor: true };
	}

	get options(): ImageAssetOptions {
		return this._options;
	}

	set options(value: ImageAssetOptions) {
		this._options = value;
	}

	get nativeImage(): any {
		return this._nativeImage;
	}

	set nativeImage(value: any) {
		this._nativeImage = value;
	}

	public getImageAsync(callback: (image: any, error: Error) => void) {
		//
	}
}

export function getAspectSafeDimensions(sourceWidth, sourceHeight, reqWidth, reqHeight) {
	let widthCoef = sourceWidth / reqWidth;
	let heightCoef = sourceHeight / reqHeight;
	let aspectCoef = Math.min(widthCoef, heightCoef);

	return {
		width: Math.floor(sourceWidth / aspectCoef),
		height: Math.floor(sourceHeight / aspectCoef),
	};
}

export function getRequestedImageSize(src: { width: number; height: number }, options: ImageAssetOptions): { width: number; height: number } {
	let reqWidth = options.width || Math.min(src.width, Screen.mainScreen.widthPixels);
	let reqHeight = options.height || Math.min(src.height, Screen.mainScreen.heightPixels);

	if (options && options.keepAspectRatio) {
		let safeAspectSize = getAspectSafeDimensions(src.width, src.height, reqWidth, reqHeight);
		reqWidth = safeAspectSize.width;
		reqHeight = safeAspectSize.height;
	}

	return {
		width: reqWidth,
		height: reqHeight,
	};
}
