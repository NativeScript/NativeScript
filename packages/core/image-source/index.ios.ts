// Definitions.
import { ImageSource as ImageSourceDefinition } from '.';
import { ImageAsset } from '../image-asset';
import * as httpModule from '../http';
import { Font } from '../ui/styling/font';
import { Color } from '../color';

// Types.
import { path as fsPath, knownFolders } from '../file-system';
import { isFileOrResourcePath, RESOURCE_PREFIX, layout } from '../utils';

import { getScaledDimensions } from './image-source-common';

export { isFileOrResourcePath };

let http: typeof httpModule;
function ensureHttp() {
	if (!http) {
		http = require('../http');
	}
}

export class ImageSource implements ImageSourceDefinition {
	public android: android.graphics.Bitmap;
	public ios: UIImage;

	get height(): number {
		if (this.ios) {
			return this.ios.size.height;
		}

		return NaN;
	}

	get width(): number {
		if (this.ios) {
			return this.ios.size.width;
		}

		return NaN;
	}

	get rotationAngle(): number {
		return NaN;
	}

	set rotationAngle(_value: number) {
		// compatibility with Android
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

	static fromUrl(url: string): Promise<ImageSource> {
		ensureHttp();

		return http.getImage(url);
	}

	static fromResourceSync(name: string): ImageSource {
		const nativeSource = (<any>UIImage).tns_safeImageNamed(name) || (<any>UIImage).tns_safeImageNamed(`${name}.jpg`);

		return nativeSource ? new ImageSource(nativeSource) : null;
	}
	static fromResource(name: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				(<any>UIImage).tns_safeDecodeImageNamedCompletion(name, (image) => {
					if (image) {
						resolve(new ImageSource(image));
					} else {
						(<any>UIImage).tns_safeDecodeImageNamedCompletion(`${name}.jpg`, (image) => {
							resolve(new ImageSource(image));
						});
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileSync(path: string): ImageSource {
		const uiImage = UIImage.imageWithContentsOfFile(getFileName(path));

		return uiImage ? new ImageSource(uiImage) : null;
	}
	static fromFile(path: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				(<any>UIImage).tns_decodeImageWidthContentsOfFileCompletion(getFileName(path), (uiImage) => {
					resolve(new ImageSource(uiImage));
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileOrResourceSync(path: string): ImageSource {
		if (!isFileOrResourcePath(path)) {
			throw new Error('Path "' + '" is not a valid file or resource.');
		}

		if (path.indexOf(RESOURCE_PREFIX) === 0) {
			return ImageSource.fromResourceSync(path.substr(RESOURCE_PREFIX.length));
		}

		return ImageSource.fromFileSync(path);
	}

	static fromDataSync(data: any): ImageSource {
		const uiImage = UIImage.imageWithData(data);

		return uiImage ? new ImageSource(uiImage) : null;
	}
	static fromData(data: any): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				(<any>UIImage).tns_decodeImageWithDataCompletion(data, (uiImage) => {
					resolve(new ImageSource(uiImage));
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromBase64Sync(source: string): ImageSource {
		let uiImage: UIImage;
		if (typeof source === 'string') {
			const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);
			uiImage = UIImage.imageWithData(data);
		}

		return uiImage ? new ImageSource(uiImage) : null;
	}
	static fromBase64(source: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);
				UIImage.imageWithData['async'](UIImage, [data]).then((uiImage) => {
					resolve(new ImageSource(uiImage));
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource {
		font = font || Font.default;
		let fontSize = layout.toDevicePixels(font.fontSize);
		if (!fontSize) {
			// TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
			fontSize = UIFont.labelFontSize;
		}

		const density = layout.getDisplayDensity();
		const scaledFontSize = fontSize * density;

		const attributes = {
			[NSFontAttributeName]: font.getUIFont(UIFont.systemFontOfSize(scaledFontSize)),
		};

		if (color) {
			attributes[NSForegroundColorAttributeName] = color.ios;
		}

		const attributedString = NSAttributedString.alloc().initWithStringAttributes(source, <NSDictionary<string, any>>attributes);

		UIGraphicsBeginImageContextWithOptions(attributedString.size(), false, 0.0);
		attributedString.drawAtPoint(CGPointMake(0, 0));

		const iconImage = UIGraphicsGetImageFromCurrentImageContext();
		UIGraphicsEndImageContext();

		return iconImage ? new ImageSource(iconImage) : null;
	}

	public fromAsset(asset: ImageAsset) {
		console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');

		return ImageSource.fromAsset(asset).then((imgSource) => {
			this.setNativeSource(imgSource.ios);

			return this;
		});
	}

	public loadFromResource(name: string): boolean {
		console.log('loadFromResource() is deprecated. Use ImageSource.fromResourceSync() instead.');

		const imgSource = ImageSource.fromResourceSync(name);
		this.ios = imgSource ? imgSource.ios : null;

		return !!this.ios;
	}

	public fromResource(name: string): Promise<boolean> {
		console.log('fromResource() is deprecated. Use ImageSource.fromResource() instead.');

		return ImageSource.fromResource(name).then((imgSource) => {
			this.ios = imgSource.ios;

			return !!this.ios;
		});
	}

	public loadFromFile(path: string): boolean {
		console.log('loadFromFile() is deprecated. Use ImageSource.fromFileSync() instead.');

		const imgSource = ImageSource.fromFileSync(path);
		this.ios = imgSource ? imgSource.ios : null;

		return !!this.ios;
	}

	public fromFile(path: string): Promise<boolean> {
		console.log('fromFile() is deprecated. Use ImageSource.fromFile() instead.');

		return ImageSource.fromFile(path).then((imgSource) => {
			this.ios = imgSource.ios;

			return !!this.ios;
		});
	}

	public loadFromData(data: any): boolean {
		console.log('loadFromData() is deprecated. Use ImageSource.fromDataSync() instead.');

		const imgSource = ImageSource.fromDataSync(data);
		this.ios = imgSource ? imgSource.ios : null;

		return !!this.ios;
	}

	public fromData(data: any): Promise<boolean> {
		console.log('fromData() is deprecated. Use ImageSource.fromData() instead.');

		return ImageSource.fromData(data).then((imgSource) => {
			this.ios = imgSource.ios;

			return !!this.ios;
		});
	}

	public loadFromBase64(source: string): boolean {
		console.log('loadFromBase64() is deprecated. Use ImageSource.fromBase64Sync() instead.');

		const imgSource = ImageSource.fromBase64Sync(source);
		this.ios = imgSource ? imgSource.ios : null;

		return !!this.ios;
	}

	public fromBase64(source: string): Promise<boolean> {
		console.log('fromBase64() is deprecated. Use ImageSource.fromBase64() instead.');

		return ImageSource.fromBase64(source).then((imgSource) => {
			this.ios = imgSource.ios;

			return !!this.ios;
		});
	}

	public loadFromFontIconCode(source: string, font: Font, color: Color): boolean {
		console.log('loadFromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');

		const imgSource = ImageSource.fromFontIconCodeSync(source, font, color);
		this.ios = imgSource ? imgSource.ios : null;

		return !!this.ios;
	}

	public setNativeSource(source: any): void {
		if (source && !(source instanceof UIImage)) {
			throw new Error('The method setNativeSource() expects UIImage instance.');
		}
		this.ios = source;
	}

	public saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): boolean {
		if (!this.ios) {
			return false;
		}

		if (quality) {
			quality = (quality - 0) / (100 - 0); // Normalize quality on a scale of 0 to 1
		}

		const data = getImageData(this.ios, format, quality);
		if (data) {
			return NSFileManager.defaultManager.createFileAtPathContentsAttributes(path, data, null);
		}

		return false;
	}

	public toBase64String(format: 'png' | 'jpeg' | 'jpg', quality?: number): string {
		let res = null;
		if (!this.ios) {
			return res;
		}

		if (quality) {
			quality = (quality - 0) / (100 - 0); // Normalize quality on a scale of 0 to 1
		}

		const data = getImageData(this.ios, format, quality);
		if (data) {
			res = data.base64Encoding();
		}

		return res;
	}

	public resize(maxSize: number, options?: any): ImageSource {
		const size: CGSize = this.ios.size;
		const dim = getScaledDimensions(size.width, size.height, maxSize);

		const newSize: CGSize = CGSizeMake(dim.width, dim.height);
		UIGraphicsBeginImageContextWithOptions(newSize, true, this.ios.scale);
		this.ios.drawInRect(CGRectMake(0, 0, newSize.width, newSize.height));

		const resizedImage = UIGraphicsGetImageFromCurrentImageContext();
		UIGraphicsEndImageContext();

		return new ImageSource(resizedImage);
	}
}

function getFileName(path: string): string {
	let fileName = typeof path === 'string' ? path.trim() : '';
	if (fileName.indexOf('~/') === 0) {
		fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace('~/', ''));
	}

	return fileName;
}

function getImageData(instance: UIImage, format: 'png' | 'jpeg' | 'jpg', quality = 0.9): NSData {
	let data = null;
	switch (format) {
		case 'png':
			data = UIImagePNGRepresentation(instance);
			break;
		case 'jpeg':
		case 'jpg':
			data = UIImageJPEGRepresentation(instance, quality);
			break;
	}

	return data;
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
