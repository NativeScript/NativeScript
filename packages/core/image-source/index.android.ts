import { ImageSource as ImageSourceDefinition, iosSymbolScaleType, ImageCompressResult, ImageDrawTextOptions, ImageFilter, ImageFlipAxis, ImageFormat, ImageLoadOptions, ImageMetadata, ImageOverlayOptions, ImageResizeToOptions, ImageTransformOptions } from '.';
import { ImageAsset } from '../image-asset';
import type { View } from '../ui/core/view';
import { path as fsPath, knownFolders } from '../file-system';
import { requestInternal as httpRequest } from '../http/http-request-internal';
import { isFileOrResourcePath, RESOURCE_PREFIX, layout } from '../utils';
import { getNativeApp } from '../application/helpers-common';
import { Font } from '../ui/styling/font';
import { Color } from '../color';

import { assertPositiveInteger, hammingDistance, normalizeFilters, normalizeFormat, normalizeQuality, normalizeTransformOptions, toImageMetadata } from './image-source-common';

export { isFileOrResourcePath };

function getApplication() {
	return getNativeApp() as android.app.Application;
}

export class ImageSource implements ImageSourceDefinition {
	public android: android.graphics.Bitmap;
	public ios: UIImage;

	public get height(): number {
		if (this.android) {
			return this.android.getHeight();
		}

		return NaN;
	}

	public get width(): number {
		if (this.android) {
			return this.android.getWidth();
		}

		return NaN;
	}

	private _rotationAngle: number;
	public get rotationAngle(): number {
		return this._rotationAngle;
	}

	public set rotationAngle(value: number) {
		this._rotationAngle = value;
	}

	constructor(nativeSource?: android.graphics.Bitmap | android.graphics.drawable.Drawable) {
		if (nativeSource) {
			this.setNativeSource(nativeSource);
		}
	}

	static fromAsset(asset: ImageAsset): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			asset.getImageAsync((image, err) => {
				if (image) {
					resolve(new ImageSource(image));
				} else {
					reject(err);
				}
			});
		});
	}

	static fromUrl(url: string): Promise<ImageSource> {
		return httpRequest({ url, method: 'GET' }).then((response) => response.content.toNativeImage().then((value) => new ImageSource(value)));
	}

	static fromResourceSync(name: string): ImageSource {
		const res = getApplication().getResources();
		if (res) {
			const identifier: number = res.getIdentifier(name, 'drawable', getApplication().getPackageName());
			if (0 < identifier) {
				// Load BitmapDrawable with getDrawable to make use of Android internal caching
				const bitmapDrawable = <android.graphics.drawable.BitmapDrawable>res.getDrawable(identifier);
				if (bitmapDrawable && bitmapDrawable.getBitmap) {
					return new ImageSource(bitmapDrawable.getBitmap());
				}
			}
		}

		return null;
	}

	static fromResource(name: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				const imageSource = ImageSource.fromResourceSync(name);
				if (imageSource) {
					resolve(imageSource);
				} else {
					reject(new Error(`Failed to load resource image with name: ${name}`));
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileSync(path: string, options?: ImageLoadOptions): ImageSource {
		const fileName = getFileName(path);
		const bitmap = org.nativescript.widgets.ImageUtils.decodeFile(fileName, options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0);
		if (!bitmap) {
			return null;
		}

		// decodeFile bakes the EXIF orientation into the pixels, so no rotation is pending.
		const result = new ImageSource(bitmap);
		result.rotationAngle = 0;

		return result;
	}

	static fromFile(path: string, options?: ImageLoadOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				org.nativescript.widgets.ImageUtils.decodeFileAsync(
					getFileName(path),
					options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0,
					asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileOrResourceSync(path: string): ImageSource {
		if (!isFileOrResourcePath(path)) {
			throw new Error(`${path} is not a valid file or resource.`);
		}

		if (path.indexOf(RESOURCE_PREFIX) === 0) {
			return ImageSource.fromResourceSync(path.substr(RESOURCE_PREFIX.length));
		}

		return ImageSource.fromFileSync(path);
	}

	static iosSymbolScaleFor(scale: iosSymbolScaleType): number {
		return 0;
	}

	static fromSystemImageSync(name: string): ImageSource {
		return ImageSource.fromResourceSync(name);
	}

	static fromSystemImage(name: string): Promise<ImageSource> {
		return ImageSource.fromResource(name);
	}

	static fromDataSync(data: any, options?: ImageLoadOptions): ImageSource {
		const maxSize = options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0;
		let bitmap: android.graphics.Bitmap;
		if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
			bitmap = org.nativescript.widgets.ImageUtils.decodeBuffer(toByteBuffer(data), maxSize);
		} else if (data) {
			// Legacy contract: a java.io.InputStream.
			bitmap = android.graphics.BitmapFactory.decodeStream(data);
			if (bitmap && maxSize > 0) {
				bitmap = org.nativescript.widgets.ImageUtils.resize(bitmap, maxSize, true);
			}
		}

		return bitmap ? new ImageSource(bitmap) : null;
	}

	static fromData(data: any, options?: ImageLoadOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
					const maxSize = options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0;
					org.nativescript.widgets.ImageUtils.decodeBufferAsync(
						toByteBuffer(data),
						maxSize,
						asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
					);
					return;
				}

				// InputStream cannot be handed to another thread safely; decode inline.
				const imageSource = ImageSource.fromDataSync(data, options);
				if (imageSource) {
					resolve(imageSource);
				} else {
					reject(new Error('Failed to decode image from data'));
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromBase64Sync(source: string, options?: ImageLoadOptions): ImageSource {
		if (typeof source !== 'string') {
			return null;
		}

		const bitmap = org.nativescript.widgets.ImageUtils.decodeBase64(source, options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0);

		return bitmap ? new ImageSource(bitmap) : null;
	}

	static fromBase64(source: string, options?: ImageLoadOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (typeof source !== 'string') {
				reject(new Error('fromBase64 expects a base64 encoded string'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.decodeBase64Async(
					source,
					options?.maxSize > 0 ? assertPositiveInteger(options.maxSize, 'maxSize') : 0,
					asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static getMetadataSync(path: string): ImageMetadata {
		const json = org.nativescript.widgets.ImageUtils.getMetadata(getFileName(path));

		return toImageMetadata(json ? JSON.parse(json) : null);
	}

	static getMetadata(path: string): Promise<ImageMetadata> {
		return new Promise<ImageMetadata>((resolve, reject) => {
			try {
				const metadata = ImageSource.getMetadataSync(path);
				if (metadata) {
					resolve(metadata);
				} else {
					reject(new Error(`Failed to read image metadata at path: ${path}`));
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromView(view: View, scale?: number): ImageSource {
		const nativeView = view?.android as android.view.View;
		if (!nativeView) {
			return null;
		}

		let bitmap = org.nativescript.widgets.ImageUtils.fromView(nativeView);
		if (bitmap && scale > 0) {
			const density = layout.getDisplayDensity();
			if (density > 0 && Math.abs(scale - density) > 0.01) {
				const width = Math.max(1, Math.round((bitmap.getWidth() / density) * scale));
				const height = Math.max(1, Math.round((bitmap.getHeight() / density) * scale));
				bitmap = org.nativescript.widgets.ImageUtils.resizeTo(bitmap, width, height, 'stretch', 0);
			}
		}

		return bitmap ? new ImageSource(bitmap) : null;
	}

	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource {
		font = font || Font.default;
		const paint = new android.graphics.Paint();
		paint.setTypeface(font.getAndroidTypeface());
		paint.setAntiAlias(true);

		if (color) {
			paint.setColor(color.android);
		}

		// TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
		const scaledFontSize = layout.toDevicePixels(font.fontSize);
		if (scaledFontSize) {
			paint.setTextSize(scaledFontSize);
		}

		const textBounds = new android.graphics.Rect();
		paint.getTextBounds(source, 0, source.length, textBounds);

		const padding = 1;
		const textWidth = textBounds.width() + padding * 2;
		const textHeight = textBounds.height() + padding * 2;
		if (textWidth > 0 && textHeight > 0) {
			const bitmap = android.graphics.Bitmap.createBitmap(textWidth, textHeight, android.graphics.Bitmap.Config.ARGB_8888);

			const canvas = new android.graphics.Canvas(bitmap);
			canvas.drawText(source, -textBounds.left + padding, -textBounds.top + padding, paint);

			return new ImageSource(bitmap);
		}

		return null;
	}

	public fromAsset(asset: ImageAsset): Promise<ImageSource> {
		console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');

		return ImageSource.fromAsset(asset).then((imgSource) => {
			this.setNativeSource(imgSource.android);

			return this;
		});
	}

	public loadFromResource(name: string): boolean {
		console.log('fromResource() and loadFromResource() are deprecated. Use ImageSource.fromResource[Sync]() instead.');

		const imgSource = ImageSource.fromResourceSync(name);
		this.android = imgSource ? imgSource.android : null;

		return !!this.android;
	}

	public fromResource(name: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			resolve(this.loadFromResource(name));
		});
	}

	public loadFromFile(path: string): boolean {
		console.log('fromFile() and loadFromFile() are deprecated. Use ImageSource.fromFile[Sync]() instead.');

		const imgSource = ImageSource.fromFileSync(path);
		this.android = imgSource ? imgSource.android : null;
		this.rotationAngle = imgSource ? imgSource.rotationAngle : 0;

		return !!this.android;
	}

	public fromFile(path: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			resolve(this.loadFromFile(path));
		});
	}

	public loadFromData(data: any): boolean {
		console.log('fromData() and loadFromData() are deprecated. Use ImageSource.fromData[Sync]() instead.');

		const imgSource = ImageSource.fromDataSync(data);
		this.android = imgSource ? imgSource.android : null;

		return !!this.android;
	}

	public fromData(data: any): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			resolve(this.loadFromData(data));
		});
	}

	public loadFromBase64(source: string): boolean {
		console.log('fromBase64() and loadFromBase64() are deprecated. Use ImageSource.fromBase64[Sync]() instead.');

		const imgSource = ImageSource.fromBase64Sync(source);
		this.android = imgSource ? imgSource.android : null;

		return !!this.android;
	}

	public fromBase64(data: any): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			resolve(this.loadFromBase64(data));
		});
	}

	public loadFromFontIconCode(source: string, font: Font, color: Color): boolean {
		console.log('loadFromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');

		const imgSource = ImageSource.fromFontIconCodeSync(source, font, color);
		this.android = imgSource ? imgSource.android : null;

		return !!this.android;
	}

	public getNativeSource(): android.graphics.Bitmap | android.graphics.drawable.Drawable {
		return this.android;
	}

	public setNativeSource(source: android.graphics.Bitmap | android.graphics.drawable.Drawable): void {
		if (!source) {
			this.android = null;
		} else if (source instanceof android.graphics.Bitmap) {
			this.android = source;
		} else if (source instanceof android.graphics.drawable.Drawable) {
			this.android = org.nativescript.widgets.Utils.getBitmapFromDrawable(source);
		} else {
			throw new Error('The method setNativeSource() expects an android.graphics.Bitmap or android.graphics.drawable.Drawable instance.');
		}

		this._rotationAngle = 0;
	}

	public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
		if (!this.android) {
			return false;
		}

		return org.nativescript.widgets.ImageUtils.saveToFile(this.uprightBitmap(), path, normalizeFormat(format), normalizeQuality(quality));
	}

	public saveToFileAsync(path: string, format: ImageFormat, quality?: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to save'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.saveToFileAsync(
					this.uprightBitmap(),
					path,
					normalizeFormat(format),
					normalizeQuality(quality),
					asyncCallback(resolve, reject, (saved) => !!saved),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public toBase64String(format: ImageFormat, quality?: number): string {
		if (!this.android) {
			return null;
		}

		const bytes = org.nativescript.widgets.ImageUtils.encodeToBytes(this.uprightBitmap(), normalizeFormat(format), normalizeQuality(quality));

		return bytes ? android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP) : null;
	}

	public toBase64StringAsync(format: ImageFormat, quality?: number): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				org.nativescript.widgets.Utils.toBase64StringAsync(
					this.uprightBitmap(),
					normalizeFormat(format),
					normalizeQuality(quality),
					asyncCallback(resolve, reject, (value) => String(value)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public toData(format: ImageFormat, quality?: number): ArrayBuffer {
		if (!this.android) {
			return null;
		}

		const buffer = org.nativescript.widgets.ImageUtils.encode(this.uprightBitmap(), normalizeFormat(format), normalizeQuality(quality));

		return buffer ? toArrayBuffer(buffer) : null;
	}

	public toDataAsync(format: ImageFormat, quality?: number): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.encodeAsync(
					this.uprightBitmap(),
					normalizeFormat(format),
					normalizeQuality(quality),
					asyncCallback(resolve, reject, (buffer) => toArrayBuffer(buffer)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public compressToFit(maxBytes: number, format: ImageFormat = 'jpeg'): ImageCompressResult {
		if (!this.android) {
			return null;
		}

		const result = org.nativescript.widgets.ImageUtils.compressToFit(this.uprightBitmap(), assertPositiveInteger(maxBytes, 'maxBytes'), normalizeFormat(format));

		return toCompressResult(result);
	}

	public compressToFitAsync(maxBytes: number, format: ImageFormat = 'jpeg'): Promise<ImageCompressResult> {
		return new Promise<ImageCompressResult>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.compressToFitAsync(
					this.uprightBitmap(),
					assertPositiveInteger(maxBytes, 'maxBytes'),
					normalizeFormat(format),
					asyncCallback(resolve, reject, (result) => toCompressResult(result)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public resize(maxSize: number, options?: any): ImageSource {
		if (!this.android) {
			return null;
		}

		const filter = options && typeof options.filter === 'boolean' ? options.filter : true;
		const bitmap = org.nativescript.widgets.ImageUtils.resize(this.uprightBitmap(), assertPositiveInteger(maxSize, 'maxSize'), filter);

		return wrap(bitmap);
	}

	public resizeAsync(maxSize: number, options?: any): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to resize'));
				return;
			}

			try {
				const filter = options && typeof options.filter === 'boolean' ? options.filter : true;
				org.nativescript.widgets.Utils.resizeAsync(
					this.uprightBitmap(),
					assertPositiveInteger(maxSize, 'maxSize'),
					JSON.stringify({ filter }),
					asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public getPixelSize(): { width: number; height: number } {
		if (!this.android) {
			return { width: NaN, height: NaN };
		}

		const swapped = this.rotationAngle === 90 || this.rotationAngle === 270;

		return {
			width: swapped ? this.android.getHeight() : this.android.getWidth(),
			height: swapped ? this.android.getWidth() : this.android.getHeight(),
		};
	}

	public normalizeOrientation(): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.rotate(this.android, this.rotationAngle || 0));
	}

	public crop(x: number, y: number, width: number, height: number): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.crop(this.uprightBitmap(), Math.round(x), Math.round(y), assertPositiveInteger(width, 'width'), assertPositiveInteger(height, 'height')));
	}

	public rotate(degrees: number): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.rotate(this.uprightBitmap(), degrees));
	}

	public flip(axis: ImageFlipAxis): ImageSource {
		if (!this.android) {
			return null;
		}

		const horizontal = axis === 'horizontal' || axis === 'both';
		const vertical = axis === 'vertical' || axis === 'both';

		return wrap(org.nativescript.widgets.ImageUtils.flip(this.uprightBitmap(), horizontal, vertical));
	}

	public resizeTo(width: number, height: number, options?: ImageResizeToOptions): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.resizeTo(this.uprightBitmap(), assertPositiveInteger(width, 'width'), assertPositiveInteger(height, 'height'), options?.mode || 'fit', toAndroidColor(options?.background)));
	}

	public transform(options: ImageTransformOptions): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.transform(this.android, this.rotationAngle || 0, toTransformJson(options)));
	}

	public transformAsync(options: ImageTransformOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to transform'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.transformAsync(
					this.android,
					this.rotationAngle || 0,
					toTransformJson(options),
					asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public roundCorners(radius: number): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.roundCorners(this.uprightBitmap(), Math.max(0, radius)));
	}

	public circleCrop(): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.roundCorners(this.uprightBitmap(), -1));
	}

	public overlay(other: ImageSource, options?: ImageOverlayOptions): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.overlay(this.uprightBitmap(), other ? other.uprightBitmap() : null, Math.round(options?.x ?? 0), Math.round(options?.y ?? 0), options?.opacity ?? 1));
	}

	public drawText(text: string, options: ImageDrawTextOptions): ImageSource {
		if (!this.android) {
			return null;
		}

		const fontSize = options?.fontSize ?? options?.font?.fontSize ?? 16;
		const typeface = options?.font ? options.font.getAndroidTypeface() : null;
		const color = options?.color ? toAndroidColor(options.color) : android.graphics.Color.BLACK;

		return wrap(org.nativescript.widgets.ImageUtils.drawText(this.uprightBitmap(), text ?? '', options?.x ?? 0, options?.y ?? 0, typeface, fontSize, color));
	}

	public tint(color: Color | string): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.tint(this.uprightBitmap(), toAndroidColor(color)));
	}

	public applyFilters(filters: ImageFilter[]): ImageSource {
		if (!this.android) {
			return null;
		}

		return wrap(org.nativescript.widgets.ImageUtils.applyFilters(this.uprightBitmap(), JSON.stringify(normalizeFilters(filters))));
	}

	public applyFiltersAsync(filters: ImageFilter[]): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.android) {
				reject(new Error('ImageSource has no native image to filter'));
				return;
			}

			try {
				org.nativescript.widgets.ImageUtils.applyFiltersAsync(
					this.uprightBitmap(),
					JSON.stringify(normalizeFilters(filters)),
					asyncCallback(resolve, reject, (bitmap) => new ImageSource(bitmap)),
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public averageColor(): Color {
		if (!this.android) {
			return null;
		}

		const argb = org.nativescript.widgets.ImageUtils.averageColor(this.android);

		return argb ? new Color(argb) : null;
	}

	public dominantColors(count: number = 5): Color[] {
		if (!this.android) {
			return [];
		}

		const values = org.nativescript.widgets.ImageUtils.dominantColors(this.android, assertPositiveInteger(count, 'count'));
		const result: Color[] = [];
		for (let i = 0; i < values.length; i++) {
			result.push(new Color(values[i]));
		}

		return result;
	}

	public perceptualHash(): string {
		return this.android ? org.nativescript.widgets.ImageUtils.perceptualHash(this.uprightBitmap()) : null;
	}

	public isSimilarTo(other: ImageSource, threshold: number = 10): boolean {
		const distance = hammingDistance(this.perceptualHash(), other?.perceptualHash());

		return distance >= 0 && distance <= threshold;
	}

	/**
	 * The bitmap with any pending rotationAngle baked into its pixels, so every
	 * pixel operation and encoder sees the image the way it is displayed.
	 */
	private uprightBitmap(): android.graphics.Bitmap {
		return org.nativescript.widgets.ImageUtils.applyRotation(this.android, this.rotationAngle || 0);
	}
}

function wrap(bitmap: android.graphics.Bitmap): ImageSource {
	return bitmap ? new ImageSource(bitmap) : null;
}

function getFileName(path: string): string {
	let fileName = typeof path === 'string' ? path.trim() : '';
	if (fileName.indexOf('~/') === 0) {
		fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace('~/', ''));
	}

	return fileName;
}

function asyncCallback<T>(resolve: (value: T) => void, reject: (reason: any) => void, map: (value: any) => T) {
	return new org.nativescript.widgets.Utils.AsyncImageCallback({
		onSuccess(value: any) {
			try {
				resolve(map(value));
			} catch (ex) {
				reject(ex);
			}
		},
		onError(error: java.lang.Exception) {
			reject(new Error(error ? error.getMessage() : 'Image operation failed'));
		},
	});
}

function toByteBuffer(data: ArrayBuffer | ArrayBufferView): java.nio.ByteBuffer {
	const buffer = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

	// The runtime exposes the backing store of an ArrayBuffer as a direct java.nio.ByteBuffer.
	return ((buffer as any).nativeObject || buffer) as java.nio.ByteBuffer;
}

function toArrayBuffer(buffer: java.nio.ByteBuffer): ArrayBuffer {
	return (ArrayBuffer as any).from(buffer) as ArrayBuffer;
}

function toAndroidColor(color: Color | string | undefined): number {
	if (!color) {
		return 0;
	}

	return (color instanceof Color ? color : new Color(color)).android;
}

function toTransformJson(options: ImageTransformOptions): string {
	const normalized = normalizeTransformOptions(options);
	const json: any = { ...normalized };
	if (normalized.resize && 'width' in normalized.resize) {
		json.resize = { ...normalized.resize, background: toAndroidColor(normalized.resize.background) };
	}

	return JSON.stringify(json);
}

function toCompressResult(result: org.nativescript.widgets.ImageUtils.CompressResult): ImageCompressResult {
	if (!result || !result.data) {
		return null;
	}

	return { data: toArrayBuffer(result.data), quality: result.quality };
}

export function fromAsset(asset: ImageAsset): Promise<ImageSource> {
	console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');

	return ImageSource.fromAsset(asset);
}

export function fromResource(name: string): ImageSource {
	console.log('fromResource() is deprecated. Use ImageSource.fromResourceSync() instead.');

	return ImageSource.fromResourceSync(name);
}

export function fromFile(path: string): ImageSource {
	console.log('fromFile() is deprecated. Use ImageSource.fromFileSync() instead.');

	return ImageSource.fromFileSync(path);
}

export function fromData(data: any): ImageSource {
	console.log('fromData() is deprecated. Use ImageSource.fromDataSync() instead.');

	return ImageSource.fromDataSync(data);
}

export function fromFontIconCode(source: string, font: Font, color: Color): ImageSource {
	console.log('fromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');

	return ImageSource.fromFontIconCodeSync(source, font, color);
}

export function fromBase64(source: string): ImageSource {
	console.log('fromBase64() is deprecated. Use ImageSource.fromBase64Sync() instead.');

	return ImageSource.fromBase64Sync(source);
}

export function fromNativeSource(nativeSource: any): ImageSource {
	console.log('fromNativeSource() is deprecated. Use ImageSource constructor instead.');

	return new ImageSource(nativeSource);
}

export function fromUrl(url: string): Promise<ImageSourceDefinition> {
	console.log('fromUrl() is deprecated. Use ImageSource.fromUrl() instead.');

	return ImageSource.fromUrl(url);
}

export function fromFileOrResource(path: string): ImageSource {
	console.log('fromFileOrResource() is deprecated. Use ImageSource.fromFileOrResourceSync() instead.');

	return ImageSource.fromFileOrResourceSync(path);
}
