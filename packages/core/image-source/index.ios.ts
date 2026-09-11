import { ImageSource as ImageSourceDefinition, iosSymbolScaleType, ImageCompressResult, ImageDrawTextOptions, ImageFilter, ImageFlipAxis, ImageFormat, ImageLoadOptions, ImageMetadata, ImageOverlayOptions, ImageResizeToOptions, ImageTransformOptions } from '.';
import { ImageAsset } from '../image-asset';
import type { ImageBase } from '../ui/image/image-common';
import type { View } from '../ui/core/view';
import { Font } from '../ui/styling/font';
import { Color } from '../color';
import { Trace } from '../trace';
import { path as fsPath, knownFolders } from '../file-system';
import { requestInternal as httpRequest } from '../http/http-request-internal';
import { isFileOrResourcePath, RESOURCE_PREFIX, SYSTEM_PREFIX } from '../utils';
import { dataDeserialize } from '../utils/native-helper';
import { assertPositiveInteger, hammingDistance, normalizeFilters, normalizeFormat, normalizeQuality, normalizeTransformOptions, toImageMetadata } from './image-source-common';

export { isFileOrResourcePath };

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

	constructor(nativeSource?: UIImage) {
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

	static iosSystemScaleFor(scale: iosSymbolScaleType) {
		switch (scale) {
			case 'small':
				return UIImageSymbolScale.Small;
			case 'medium':
				return UIImageSymbolScale.Medium;
			case 'large':
				return UIImageSymbolScale.Large;
			default:
				return UIImageSymbolScale.Default;
		}
	}

	static fromSystemImageSync(name: string, instance?: ImageBase): ImageSource {
		if (instance?.iosSymbolScale) {
			const image = ImageSource.systemImageWithConfig(name, instance);
			return image ? new ImageSource(image) : null;
		} else {
			const image = UIImage.systemImageNamed(name);

			return image ? new ImageSource(image) : null;
		}
	}

	static fromSystemImage(name: string, instance?: ImageBase): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				let image: UIImage;
				if (instance?.iosSymbolScale) {
					image = ImageSource.systemImageWithConfig(name, instance);
				} else {
					image = UIImage.systemImageNamed(name);
				}

				if (image) {
					resolve(new ImageSource(image));
				} else {
					reject(new Error(`Failed to load system icon with name: ${name}`));
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static systemImageWithConfig(name: string, instance?: ImageBase) {
		const fontSize = instance.style.fontSize;
		const fontWeight = instance.style.fontWeight;
		return UIImage.systemImageNamedWithConfiguration(name, fontSize ? UIImageSymbolConfiguration.configurationWithPointSizeWeightScale(fontSize, fontWeight === 'bold' ? UIImageSymbolWeight.Bold : UIImageSymbolWeight.Regular, ImageSource.iosSystemScaleFor(instance.iosSymbolScale)) : UIImageSymbolConfiguration.configurationWithScale(ImageSource.iosSystemScaleFor(instance.iosSymbolScale)));
	}

	static fromResourceSync(name: string): ImageSource {
		const nativeSource = UIImage.tns_safeImageNamed(name) || UIImage.tns_safeImageNamed(`${name}.jpg`);

		return nativeSource ? new ImageSource(nativeSource) : null;
	}

	static fromResource(name: string): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				UIImage.tns_safeDecodeImageNamedCompletion(name, (image) => {
					if (image) {
						resolve(new ImageSource(image));
						return;
					}

					UIImage.tns_safeDecodeImageNamedCompletion(`${name}.jpg`, (img) => {
						if (img) {
							resolve(new ImageSource(img));
						} else {
							reject(new Error(`Failed to load resource image with name: ${name}`));
						}
					});
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileSync(path: string, options?: ImageLoadOptions): ImageSource {
		const fileName = getFileName(path);
		let uiImage: UIImage;
		if (options?.maxSize > 0) {
			uiImage = NativeScriptUtils.decodeImageAtPathMaxSize(fileName, assertPositiveInteger(options.maxSize, 'maxSize'));
		} else {
			uiImage = UIImage.imageWithContentsOfFile(fileName);
		}

		return uiImage ? new ImageSource(uiImage) : null;
	}

	static fromFile(path: string, options?: ImageLoadOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				const fileName = getFileName(path);
				const done = (uiImage: UIImage) => {
					if (uiImage) {
						resolve(new ImageSource(uiImage));
					} else {
						reject(new Error(`Failed to decode image at path: ${fileName}`));
					}
				};

				if (options?.maxSize > 0) {
					NativeScriptUtils.decodeImageAtPathMaxSizeCompletion(fileName, assertPositiveInteger(options.maxSize, 'maxSize'), done);
				} else {
					UIImage.tns_decodeImageWidthContentsOfFileCompletion(fileName, done);
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}

	static fromFileOrResourceSync(path: string): ImageSource {
		if (!isFileOrResourcePath(path)) {
			if (Trace.isEnabled()) {
				Trace.write('Path "' + path + '" is not a valid file or resource.', Trace.categories.Binding, Trace.messageType.error);
			}

			return null;
		}

		if (path.indexOf(RESOURCE_PREFIX) === 0) {
			return ImageSource.fromResourceSync(path.slice(RESOURCE_PREFIX.length));
		}

		if (path.indexOf(SYSTEM_PREFIX) === 0) {
			return ImageSource.fromSystemImageSync(path.slice(SYSTEM_PREFIX.length));
		}

		return ImageSource.fromFileSync(path);
	}

	static fromDataSync(data: any, options?: ImageLoadOptions): ImageSource {
		const nsData = toNSData(data);
		if (!nsData) {
			return null;
		}

		let uiImage: UIImage;
		if (options?.maxSize > 0) {
			uiImage = NativeScriptUtils.decodeImageWithDataMaxSize(nsData, assertPositiveInteger(options.maxSize, 'maxSize'));
		} else {
			uiImage = UIImage.imageWithData(nsData);
		}

		return uiImage ? new ImageSource(uiImage) : null;
	}

	static fromData(data: any, options?: ImageLoadOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			try {
				const nsData = toNSData(data);
				if (!nsData) {
					reject(new Error('fromData expects NSData, an ArrayBuffer or a typed array'));
					return;
				}

				const done = (uiImage: UIImage) => {
					if (uiImage) {
						resolve(new ImageSource(uiImage));
					} else {
						reject(new Error('Failed to decode image from data'));
					}
				};

				if (options?.maxSize > 0) {
					NativeScriptUtils.decodeImageWithDataMaxSizeCompletion(nsData, assertPositiveInteger(options.maxSize, 'maxSize'), done);
				} else {
					UIImage.tns_decodeImageWithDataCompletion(nsData, done);
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

		const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);

		return ImageSource.fromDataSync(data, options);
	}

	static fromBase64(source: string, options?: ImageLoadOptions): Promise<ImageSource> {
		if (typeof source !== 'string') {
			return Promise.reject(new Error('fromBase64 expects a base64 encoded string'));
		}

		const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);

		return ImageSource.fromData(data, options);
	}

	static getMetadataSync(path: string): ImageMetadata {
		const dictionary = NativeScriptUtils.imageMetadataAtPath(getFileName(path));

		return toImageMetadata(dictionary ? dataDeserialize(dictionary) : null);
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
		const nativeView = view?.ios as UIView;
		if (!nativeView) {
			return null;
		}

		const image = NativeScriptUtils.snapshotViewScale(nativeView, scale > 0 ? scale : 0);

		return image ? new ImageSource(image) : null;
	}

	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource {
		font = font || Font.default;

		// TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
		const attributes = {
			[NSFontAttributeName]: font.getUIFont(UIFont.systemFontOfSize(UIFont.labelFontSize)),
		};

		if (color) {
			attributes[NSForegroundColorAttributeName] = color.ios;
		}

		const attributedString = NSAttributedString.alloc().initWithStringAttributes(source, <NSDictionary<string, any>>attributes);
		const size = attributedString.size();
		if (size.width < 1 || size.height < 1) {
			return null;
		}

		const renderer = UIGraphicsImageRenderer.alloc().initWithSizeFormat(size, NativeScriptUtils.rendererFormatWithScaleOpaque(0, false));
		const iconImage = renderer.imageWithActions(() => {
			attributedString.drawAtPoint(CGPointMake(0, 0));
		});

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

	public getNativeSource(): UIImage {
		return this.ios;
	}

	public setNativeSource(source: UIImage): void {
		if (!source) {
			this.ios = null;
		} else if (source instanceof UIImage) {
			this.ios = source;
		} else {
			this.ios = null;
			if (Trace.isEnabled()) {
				Trace.write('The method setNativeSource() expects UIImage instance.', Trace.categories.Binding, Trace.messageType.error);
			}
		}
	}

	public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
		if (!this.ios) {
			return false;
		}

		return NativeScriptUtils.saveImageToPathFormatQuality(this.ios, path, normalizeFormat(format), normalizeQuality(quality) / 100);
	}

	public saveToFileAsync(path: string, format: ImageFormat, quality?: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to save'));
				return;
			}

			try {
				NativeScriptUtils.saveImageToPathFormatQualityCompletion(this.ios, path, normalizeFormat(format), normalizeQuality(quality) / 100, (success) => {
					resolve(success);
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public toBase64String(format: ImageFormat, quality?: number): string {
		if (!this.ios) {
			return null;
		}

		const data = getImageData(this.ios, format, quality);

		return data ? data.base64EncodedStringWithOptions(0 as NSDataBase64EncodingOptions) : null;
	}

	public toBase64StringAsync(format: ImageFormat, quality?: number): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				NativeScriptUtils.getImageDataFormatQualityCompletion(this.ios, normalizeFormat(format), normalizeQuality(quality) / 100, (data) => {
					if (data) {
						resolve(data.base64EncodedStringWithOptions(0 as NSDataBase64EncodingOptions));
					} else {
						reject(new Error(`Failed to encode image as ${format}`));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public toData(format: ImageFormat, quality?: number): ArrayBuffer {
		if (!this.ios) {
			return null;
		}

		const data = getImageData(this.ios, format, quality);

		return data ? interop.bufferFromData(data) : null;
	}

	public toDataAsync(format: ImageFormat, quality?: number): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				NativeScriptUtils.getImageDataFormatQualityCompletion(this.ios, normalizeFormat(format), normalizeQuality(quality) / 100, (data) => {
					if (data) {
						resolve(interop.bufferFromData(data));
					} else {
						reject(new Error(`Failed to encode image as ${format}`));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public compressToFit(maxBytes: number, format: ImageFormat = 'jpeg'): ImageCompressResult {
		if (!this.ios) {
			return null;
		}

		const result = NativeScriptUtils.compressImageToFitFormat(this.ios, assertPositiveInteger(maxBytes, 'maxBytes'), normalizeFormat(format));

		return toCompressResult(result);
	}

	public compressToFitAsync(maxBytes: number, format: ImageFormat = 'jpeg'): Promise<ImageCompressResult> {
		return new Promise<ImageCompressResult>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to encode'));
				return;
			}

			try {
				NativeScriptUtils.compressImageToFitFormatCompletion(this.ios, assertPositiveInteger(maxBytes, 'maxBytes'), normalizeFormat(format), (result) => {
					const converted = toCompressResult(result);
					if (converted) {
						resolve(converted);
					} else {
						reject(new Error(`Unable to fit image under ${maxBytes} bytes as ${format}; resize it first`));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public resize(maxSize: number, options?: any): ImageSource {
		if (!this.ios) {
			return null;
		}

		const resizedImage = NativeScriptUtils.resizeImageMaxSizeOpaque(this.ios, assertPositiveInteger(maxSize, 'maxSize'), options?.opaque ?? false);

		return resizedImage ? new ImageSource(resizedImage) : null;
	}

	public resizeAsync(maxSize: number, options?: any): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to resize'));
				return;
			}

			try {
				NativeScriptUtils.resizeImageMaxSizeOpaqueCompletion(this.ios, assertPositiveInteger(maxSize, 'maxSize'), options?.opaque ?? false, (resizedImage) => {
					if (resizedImage) {
						resolve(new ImageSource(resizedImage));
					} else {
						reject(new Error('Failed to resize image'));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public getPixelSize(): { width: number; height: number } {
		if (!this.ios) {
			return { width: NaN, height: NaN };
		}

		const size = NativeScriptUtils.pixelSize(this.ios);

		return { width: size.width, height: size.height };
	}

	public normalizeOrientation(): ImageSource {
		return wrap(this.ios ? NativeScriptUtils.normalizeOrientation(this.ios) : null);
	}

	public crop(x: number, y: number, width: number, height: number): ImageSource {
		if (!this.ios) {
			return null;
		}

		const image = NativeScriptUtils.cropImageXYWidthHeight(this.ios, Math.round(x), Math.round(y), assertPositiveInteger(width, 'width'), assertPositiveInteger(height, 'height'));
		if (!image) {
			const size = this.getPixelSize();
			throw new Error(`Crop rect ${x},${y} ${width}x${height} is outside the ${size.width}x${size.height} image`);
		}

		return new ImageSource(image);
	}

	public rotate(degrees: number): ImageSource {
		return wrap(this.ios ? NativeScriptUtils.rotateImageDegrees(this.ios, degrees) : null);
	}

	public flip(axis: ImageFlipAxis): ImageSource {
		if (!this.ios) {
			return null;
		}

		const horizontal = axis === 'horizontal' || axis === 'both';
		const vertical = axis === 'vertical' || axis === 'both';

		return wrap(NativeScriptUtils.flipImageHorizontalVertical(this.ios, horizontal, vertical));
	}

	public resizeTo(width: number, height: number, options?: ImageResizeToOptions): ImageSource {
		if (!this.ios) {
			return null;
		}

		return wrap(NativeScriptUtils.resizeImageWidthHeightModeBackground(this.ios, assertPositiveInteger(width, 'width'), assertPositiveInteger(height, 'height'), options?.mode || 'fit', toUIColor(options?.background)));
	}

	public transform(options: ImageTransformOptions): ImageSource {
		if (!this.ios) {
			return null;
		}

		return wrap(NativeScriptUtils.transformImageOptions(this.ios, toTransformDictionary(options)));
	}

	public transformAsync(options: ImageTransformOptions): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to transform'));
				return;
			}

			try {
				NativeScriptUtils.transformImageOptionsCompletion(this.ios, toTransformDictionary(options), (image) => {
					if (image) {
						resolve(new ImageSource(image));
					} else {
						reject(new Error('Failed to transform image; check that the crop rect is inside the image'));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public roundCorners(radius: number): ImageSource {
		return wrap(this.ios ? NativeScriptUtils.roundCornersRadius(this.ios, Math.max(0, radius)) : null);
	}

	public circleCrop(): ImageSource {
		return wrap(this.ios ? NativeScriptUtils.roundCornersRadius(this.ios, -1) : null);
	}

	public overlay(other: ImageSource, options?: ImageOverlayOptions): ImageSource {
		if (!this.ios) {
			return null;
		}

		return wrap(NativeScriptUtils.overlayImageWithXYOpacity(this.ios, other?.ios ?? null, options?.x ?? 0, options?.y ?? 0, options?.opacity ?? 1));
	}

	public drawText(text: string, options: ImageDrawTextOptions): ImageSource {
		if (!this.ios) {
			return null;
		}

		const fontSize = options?.fontSize ?? options?.font?.fontSize ?? 16;
		const uiFont = options?.font ? options.font.getUIFont(UIFont.systemFontOfSize(fontSize)) : UIFont.systemFontOfSize(fontSize);
		const sizedFont = options?.fontSize ? uiFont.fontWithSize(options.fontSize) : uiFont;

		return wrap(NativeScriptUtils.drawTextOnImageXYFontColor(text ?? '', this.ios, options?.x ?? 0, options?.y ?? 0, sizedFont, toUIColor(options?.color) ?? UIColor.blackColor));
	}

	public tint(color: Color | string): ImageSource {
		if (!this.ios) {
			return null;
		}

		return wrap(NativeScriptUtils.tintImageColor(this.ios, toUIColor(color)));
	}

	public applyFilters(filters: ImageFilter[]): ImageSource {
		if (!this.ios) {
			return null;
		}

		return wrap(NativeScriptUtils.applyFiltersFilters(this.ios, normalizeFilters(filters) as any));
	}

	public applyFiltersAsync(filters: ImageFilter[]): Promise<ImageSource> {
		return new Promise<ImageSource>((resolve, reject) => {
			if (!this.ios) {
				reject(new Error('ImageSource has no native image to filter'));
				return;
			}

			try {
				NativeScriptUtils.applyFiltersFiltersCompletion(this.ios, normalizeFilters(filters) as any, (image) => {
					if (image) {
						resolve(new ImageSource(image));
					} else {
						reject(new Error('Failed to apply image filters'));
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public averageColor(): Color {
		if (!this.ios) {
			return null;
		}

		const uiColor = NativeScriptUtils.averageColor(this.ios);

		return uiColor ? Color.fromIosColor(uiColor) : null;
	}

	public dominantColors(count: number = 5): Color[] {
		if (!this.ios) {
			return [];
		}

		const colors = NativeScriptUtils.dominantColorsCount(this.ios, assertPositiveInteger(count, 'count'));
		const result: Color[] = [];
		for (let i = 0; i < colors.count; i++) {
			result.push(Color.fromIosColor(colors.objectAtIndex(i)));
		}

		return result;
	}

	public perceptualHash(): string {
		return this.ios ? NativeScriptUtils.perceptualHash(this.ios) : null;
	}

	public isSimilarTo(other: ImageSource, threshold: number = 10): boolean {
		const distance = hammingDistance(this.perceptualHash(), other?.perceptualHash());

		return distance >= 0 && distance <= threshold;
	}
}

function wrap(image: UIImage): ImageSource {
	return image ? new ImageSource(image) : null;
}

function getFileName(path: string): string {
	let fileName = typeof path === 'string' ? path.trim() : '';
	if (fileName.indexOf('~/') === 0) {
		fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace('~/', ''));
	}

	return fileName;
}

function getImageData(instance: UIImage, format: ImageFormat, quality: number | undefined): NSData {
	return NativeScriptUtils.getImageDataFormatQuality(instance, normalizeFormat(format), normalizeQuality(quality) / 100);
}

function toNSData(data: any): NSData {
	if (!data) {
		return null;
	}

	if (data instanceof NSData) {
		return data;
	}

	if (data instanceof ArrayBuffer) {
		return NSData.dataWithData(data as any);
	}

	if (ArrayBuffer.isView(data)) {
		// The view marshals to its backing store + byteOffset; copying keeps the bytes V8-owned.
		return NSData.dataWithBytesLength(data as any, data.byteLength);
	}

	return null;
}

function toUIColor(color: Color | string | undefined): UIColor {
	if (!color) {
		return null;
	}

	return (color instanceof Color ? color : new Color(color)).ios;
}

function toTransformDictionary(options: ImageTransformOptions): NSDictionary<any, any> {
	const normalized = normalizeTransformOptions(options);
	const dictionary: any = { ...normalized };
	if (normalized.resize && 'width' in normalized.resize) {
		dictionary.resize = { ...normalized.resize, background: toUIColor(normalized.resize.background) };
	}

	return dictionary as NSDictionary<any, any>;
}

function toCompressResult(result: NSDictionary<any, any>): ImageCompressResult {
	if (!result) {
		return null;
	}

	const data = result.objectForKey('data') as NSData;
	const quality = result.objectForKey('quality') as number;
	if (!data) {
		return null;
	}

	return { data: interop.bufferFromData(data), quality: Number(quality) };
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
