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
	const widthCoef = sourceWidth / reqWidth;
	const heightCoef = sourceHeight / reqHeight;
	const aspectCoef = Math.min(widthCoef, heightCoef);

	return {
		width: Math.floor(sourceWidth / aspectCoef),
		height: Math.floor(sourceHeight / aspectCoef),
	};
}

export function getRequestedImageSize(src: { width: number; height: number }, options: ImageAssetOptions): { width: number; height: number } {
	const optionsCopy = { ...(this.options || {}) };

	if (typeof optionsCopy.width === 'string') {
		const parsedWidth = parseInt(optionsCopy.width, 10);
		if (!isNaN(parsedWidth)) {
			optionsCopy.width = parsedWidth;
		} else {
			console.warn('Invalid width value provided: ', optionsCopy.width);
			delete optionsCopy.width;
		}
	}

	if (typeof optionsCopy.height === 'string') {
		const parsedHeight = parseInt(optionsCopy.height, 10);
		if (!isNaN(parsedHeight)) {
			optionsCopy.height = parsedHeight;
		} else {
			console.warn('Invalid height value provided: ', options.height);
			delete optionsCopy.height;
		}
	}

	let reqWidth = optionsCopy.width || Math.min(src.width, Screen.mainScreen.widthPixels);
	let reqHeight = optionsCopy.height || Math.min(src.height, Screen.mainScreen.heightPixels);

	if (options && options.keepAspectRatio) {
		const safeAspectSize = getAspectSafeDimensions(src.width, src.height, reqWidth, reqHeight);
		reqWidth = safeAspectSize.width;
		reqHeight = safeAspectSize.height;
	}

	return {
		width: reqWidth,
		height: reqHeight,
	};
}
