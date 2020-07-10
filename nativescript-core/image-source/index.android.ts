// Definitions.
import { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import * as httpModule from '../http';

// Types.
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath, RESOURCE_PREFIX, layout } from '../utils';
import { getNativeApplication } from '../application';
import { Font } from '../ui/styling/font';
import { Color } from '../color';

import { getScaledDimensions } from './image-source-common';

export { isFileOrResourcePath };

let http: typeof httpModule;
function ensureHttp() {
	if (!http) {
		http = require('../http');
	}
}

let application: android.app.Application;
let resources: android.content.res.Resources;

function getApplication() {
	if (!application) {
		application = <android.app.Application>getNativeApplication();
	}

	return application;
}

function getResources() {
	if (!resources) {
		resources = getApplication().getResources();
	}

	return resources;
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

	constructor(nativeSource?: any) {
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

	static fromUrl(url: string): Promise<ImageSourceDefinition> {
		ensureHttp();

		return http.getImage(url);
	}

	static fromResourceSync(name: string): ImageSource {
		const res = getResources();
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
			resolve(ImageSource.fromResourceSync(name));
		});
	}

	static fromFileSync(path: string): ImageSource {
		let fileName = typeof path === 'string' ? path.trim() : '';
		if (fileName.indexOf('~/') === 0) {
			fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace('~/', ''));
		}

		const bitmap = android.graphics.BitmapFactory.decodeFile(fileName, null);
		if (bitmap) {
			const result = new ImageSource(bitmap);
			result.rotationAngle = getRotationAngleFromFile(fileName);

			return result;
		} else {
			return null;
		}
	}

	static fromFile(path: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			resolve(ImageSource.fromFileSync(path));
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

	static fromDataSync(data: any): ImageSource {
		const bitmap = android.graphics.BitmapFactory.decodeStream(data);

		return bitmap ? new ImageSource(bitmap) : null;
	}

	static fromData(data: any): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			resolve(ImageSource.fromDataSync(data));
		});
	}

	static fromBase64Sync(source: string): ImageSource {
		let bitmap: android.graphics.Bitmap;

		if (typeof source === 'string') {
			const bytes = android.util.Base64.decode(source, android.util.Base64.DEFAULT);
			bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
		}

		return bitmap ? new ImageSource(bitmap) : null;
	}
	static fromBase64(source: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			resolve(ImageSource.fromBase64Sync(source));
		});
	}

	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource {
		font = font || Font.default;
		const paint = new android.graphics.Paint();
		paint.setTypeface(font.getAndroidTypeface());
		paint.setAntiAlias(true);

		if (color) {
			paint.setColor(color.android);
		}

		let fontSize = layout.toDevicePixels(font.fontSize);
		if (!fontSize) {
			// TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
			fontSize = paint.getTextSize();
		}

		const density = layout.getDisplayDensity();
		const scaledFontSize = fontSize * density;
		paint.setTextSize(scaledFontSize);

		const textBounds = new android.graphics.Rect();
		paint.getTextBounds(source, 0, source.length, textBounds);

		const textWidth = textBounds.width();
		const textHeight = textBounds.height();
		if (textWidth > 0 && textHeight > 0) {
			const bitmap = android.graphics.Bitmap.createBitmap(textWidth, textHeight, android.graphics.Bitmap.Config.ARGB_8888);

			const canvas = new android.graphics.Canvas(bitmap);
			canvas.drawText(source, -textBounds.left, -textBounds.top, paint);

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

	public setNativeSource(source: any): void {
		if (source && !(source instanceof android.graphics.Bitmap)) {
			throw new Error('The method setNativeSource() expects android.graphics.Bitmap instance.');
		}
		this.android = source;
	}

	public saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', quality = 100): boolean {
		if (!this.android) {
			return false;
		}

		const targetFormat = getTargetFormat(format);

		// TODO add exception handling
		const outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

		const res = this.android.compress(targetFormat, quality, outputStream);
		outputStream.close();

		return res;
	}

	public toBase64String(format: 'png' | 'jpeg' | 'jpg', quality = 100): string {
		if (!this.android) {
			return null;
		}

		const targetFormat = getTargetFormat(format);

		const outputStream = new java.io.ByteArrayOutputStream();
		const base64Stream = new android.util.Base64OutputStream(outputStream, android.util.Base64.NO_WRAP);

		this.android.compress(targetFormat, quality, base64Stream);

		base64Stream.close();
		outputStream.close();

		return outputStream.toString();
	}

	public resize(maxSize: number, options?: any): ImageSource {
		const dim = getScaledDimensions(this.android.getWidth(), this.android.getHeight(), maxSize);
		const bm: android.graphics.Bitmap = android.graphics.Bitmap.createScaledBitmap(this.android, dim.width, dim.height, options && options.filter);

		return new ImageSource(bm);
	}
}

function getTargetFormat(format: 'png' | 'jpeg' | 'jpg'): android.graphics.Bitmap.CompressFormat {
	switch (format) {
		case 'jpeg':
		case 'jpg':
			return android.graphics.Bitmap.CompressFormat.JPEG;
		default:
			return android.graphics.Bitmap.CompressFormat.PNG;
	}
}

function getRotationAngleFromFile(filename: string): number {
	let result = 0;
	const ei = new android.media.ExifInterface(filename);
	const orientation = ei.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_NORMAL);

	switch (orientation) {
		case android.media.ExifInterface.ORIENTATION_ROTATE_90:
			result = 90;
			break;
		case android.media.ExifInterface.ORIENTATION_ROTATE_180:
			result = 180;
			break;
		case android.media.ExifInterface.ORIENTATION_ROTATE_270:
			result = 270;
			break;
	}

	return result;
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
