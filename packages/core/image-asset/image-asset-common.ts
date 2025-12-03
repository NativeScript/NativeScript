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
	getImage(): Promise<any> {
		throw new Error('Method not implemented.');
	}
}

function toPositiveInt(value: any): number {
	if (typeof value === 'number') {
		return value > 0 ? Math.floor(value) : 0;
	}
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
	}
	return null;
}

function normalizeImageAssetOptions(options: ImageAssetOptions): ImageAssetOptions {
	const normalized = options ? { ...options } : ({} as ImageAssetOptions);
	// Coerce potential string values to positive integers; fallback to 0
	// to trigger default sizing downstream
	(normalized as any).width = toPositiveInt((options as any)?.width);
	(normalized as any).height = toPositiveInt((options as any)?.height);
	(normalized as any).maxWidth = toPositiveInt((options as any)?.maxWidth);
	(normalized as any).maxHeight = toPositiveInt((options as any)?.maxHeight);
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
	options = normalizeImageAssetOptions(options);
	if (options.width || options.height || options.maxWidth || options.maxHeight) {
		let reqWidth = options.width || (options.maxWidth ? Math.min(options.maxWidth, src.width) : src.width);
		let reqHeight = options.height || (options.maxHeight ? Math.min(options.maxHeight, src.height) : src.height);

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

	return src;
}
