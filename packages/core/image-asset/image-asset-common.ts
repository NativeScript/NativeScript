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
		this._options = normalizeImageAssetOptions(value);
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

function toPositiveInt(value: any): number {
	if (value == null) {
		return 0;
	}
	if (typeof value === 'number') {
		return value > 0 ? Math.floor(value) : 0;
	}
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
	}
	return 0;
}

function normalizeImageAssetOptions(options: ImageAssetOptions): ImageAssetOptions {
	const normalized = options ? { ...options } : ({} as ImageAssetOptions);
	// Coerce potential string values to positive integers; fallback to 0
	// to trigger default sizing downstream
	(normalized as any).width = toPositiveInt((options as any)?.width);
	(normalized as any).height = toPositiveInt((options as any)?.height);
	if (typeof normalized.keepAspectRatio !== 'boolean') {
		normalized.keepAspectRatio = true;
	}
	if (typeof normalized.autoScaleFactor !== 'boolean') {
		normalized.autoScaleFactor = true;
	}
	return normalized;
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
	const normalized = normalizeImageAssetOptions(options);
	let reqWidth = normalized.width || Math.min(src.width, Screen.mainScreen.widthPixels);
	let reqHeight = normalized.height || Math.min(src.height, Screen.mainScreen.heightPixels);

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
