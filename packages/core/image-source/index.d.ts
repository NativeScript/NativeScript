import { ImageAsset } from '../image-asset';
import { Font } from '../ui/styling/font';
import { Color } from '../color';
import type { ImageBase } from '../ui/image/image-common';
import type { View } from '../ui/core/view';

/**
 * Encoded image formats supported on both platforms.
 */
export type ImageFormat = 'png' | 'jpeg' | 'jpg';

/**
 * Options for the file/data loaders.
 */
export interface ImageLoadOptions {
	/**
	 * Decode so the longest edge is at most this many pixels. The decoder sub-samples
	 * while reading, so a 12 MP photo loaded with maxSize 200 never occupies 12 MP of memory.
	 */
	maxSize?: number;
}

/**
 * Information read from an image file without decoding its pixels.
 */
export interface ImageMetadata {
	/** Pixel width after EXIF orientation is applied. */
	width: number;
	/** Pixel height after EXIF orientation is applied. */
	height: number;
	/** Raw EXIF orientation value 1-8 (1 = upright). */
	orientation: number;
	/** MIME type such as image/jpeg when known. */
	mimeType?: string;
	/** True when the format carries an alpha channel. */
	hasAlpha: boolean;
	/** Embedded colour profile name when present, e.g. "sRGB IEC61966-2.1" or "Display P3". */
	colorSpace?: string;
	/** Horizontal resolution in dots per inch when recorded. */
	dpi?: number;
	/** EXIF capture time when recorded. */
	dateTaken?: Date;
	/** GPS position when recorded. */
	gps?: { latitude: number; longitude: number };
}

/**
 * A rectangle in pixels.
 */
export interface ImageCropRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type ImageFlipAxis = 'horizontal' | 'vertical' | 'both';

/**
 * How resizeTo() maps the source onto an exact width x height.
 * fit: scale to fit inside, padding the remainder with background (letterbox).
 * fill: scale to cover and centre-crop the overflow.
 * stretch: ignore the aspect ratio.
 */
export type ImageResizeMode = 'fit' | 'fill' | 'stretch';

export interface ImageResizeToOptions {
	/** Defaults to 'fit'. */
	mode?: ImageResizeMode;
	/** Padding colour for 'fit'. Defaults to transparent. */
	background?: Color | string;
}

/**
 * Steps applied by transform(), always in this order: normalize orientation, crop, rotate, flip, resize.
 */
export interface ImageTransformOptions {
	crop?: ImageCropRect;
	/** Degrees, clockwise. */
	rotate?: number;
	flip?: ImageFlipAxis;
	resize?: { maxSize: number } | ({ width: number; height: number } & ImageResizeToOptions);
}

/**
 * Colour and blur adjustments for applyFilters().
 * grayscale: remove all colour.
 * sepia: warm brown tone; amount 0..1, default 1.
 * invert: negative.
 * brightness: amount -1..1, 0 = unchanged.
 * contrast: amount 0..2, 1 = unchanged.
 * saturation: amount 0..2, 1 = unchanged.
 * blur: gaussian blur; radius in pixels.
 */
export type ImageFilter = { type: 'grayscale' } | { type: 'sepia'; amount?: number } | { type: 'invert' } | { type: 'brightness'; amount: number } | { type: 'contrast'; amount: number } | { type: 'saturation'; amount: number } | { type: 'blur'; radius: number };

export interface ImageOverlayOptions {
	/** Left edge of the overlay in pixels. Defaults to 0. */
	x?: number;
	/** Top edge of the overlay in pixels. Defaults to 0. */
	y?: number;
	/** 0..1, defaults to 1. */
	opacity?: number;
}

export interface ImageDrawTextOptions {
	/** Left edge of the text in pixels. */
	x: number;
	/** Top edge of the text in pixels. */
	y: number;
	/** Font to draw with. Defaults to the system font. */
	font?: Font;
	/** Point size in pixels. Defaults to the font's size, or 16. */
	fontSize?: number;
	/** Defaults to black. */
	color?: Color | string;
}

/**
 * Result of compressToFit().
 */
export interface ImageCompressResult {
	/** Encoded bytes at or under the requested budget. */
	data: ArrayBuffer;
	/** The quality (1-100) that satisfied the budget. */
	quality: number;
}

/**
 * Encapsulates the common abstraction behind a platform specific object (typically a Bitmap) that is used as a source for images.
 */
export class ImageSource {
	/**
	 * Gets the height of this instance. This is a read-only property.
	 */
	height: number;

	/**
	 * Gets the width of this instance. This is a read-only property.
	 */
	width: number;

	/**
	 * Gets or sets the rotation angle that should be applied to the image. (Used in android)
	 */
	rotationAngle: number;

	/**
	 * The iOS-specific [UIImage](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImage_Class/) instance. Will be undefined when running on Android.
	 */
	ios: any; /* UIImage */

	/**
	 * The Android-specific [image](http://developer.android.com/reference/android/graphics/Bitmap.html) instance. Will be undefined when running on iOS.
	 */
	android: any; /* android.graphics.Bitmap */

	/**
	 * Loads this instance from the specified asset asynchronously.
	 * @param asset The ImageAsset instance used to create ImageSource.
	 */
	static fromAsset(asset: ImageAsset): Promise<ImageSource>;

	/**
	 * Downloads the image from the provided Url and creates a new ImageSource instance from it.
	 * @param url The link to the remote image object. This operation will download and decode the image.
	 */
	static fromUrl(url: string): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified resource name.
	 * @param name The name of the resource (without its extension).
	 */
	static fromResourceSync(name: string): ImageSource;

	/**
	 * Loads this instance from the specified resource name asynchronously.
	 * @param name The name of the resource (without its extension).
	 */
	static fromResource(name: string): Promise<ImageSource>;

	/**
	 * (iOS only) Get system symbol scale
	 * @param scale symbol scale type
	 */
	static iosSymbolScaleFor(scale: iosSymbolScaleType): number;

	/**
	 * Loads this instance from the specified system image name.
	 * @param name the name of the system image
	 */
	static fromSystemImageSync(name: string, instance?: ImageBase): ImageSource;

	/**
	 * Loads this instance from the specified system image name asynchronously.
	 * @param name the name of the system image
	 */
	static fromSystemImage(name: string, instance?: ImageBase): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified file.
	 * @param path The location of the file on the file system.
	 */
	static fromFileSync(path: string, options?: ImageLoadOptions): ImageSource;

	/**
	 * Loads this instance from the specified file asynchronously.
	 * @param path The location of the file on the file system.
	 */
	static fromFile(path: string, options?: ImageLoadOptions): Promise<ImageSource>;

	/**
	 * Creates a new ImageSource instance and loads it from the specified local file or resource (if specified with the "res://" prefix).
	 * @param path The location of the file on the file system.
	 */
	static fromFileOrResourceSync(path: string): ImageSource;

	/**
	 * Loads this instance from the specified native image data.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromDataSync(data: any | ArrayBuffer | Uint8Array, options?: ImageLoadOptions): ImageSource;

	/**
	 * Loads this instance from the specified native image data asynchronously.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromData(data: any | ArrayBuffer | Uint8Array, options?: ImageLoadOptions): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified base64 encoded string.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64Sync(source: string, options?: ImageLoadOptions): ImageSource;

	/**
	 * Loads this instance from the specified base64 encoded string asynchronously.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64(source: string, options?: ImageLoadOptions): Promise<ImageSource>;

	/**
	 * Reads size, orientation, colour profile, capture date and GPS from an image file
	 * without decoding its pixels.
	 * @param path The location of the file on the file system.
	 * @returns The metadata, or null when the file is not a readable image.
	 */
	static getMetadataSync(path: string): ImageMetadata;

	/**
	 * Reads size, orientation, colour profile, capture date and GPS from an image file
	 * without decoding its pixels, asynchronously.
	 * @param path The location of the file on the file system.
	 */
	static getMetadata(path: string): Promise<ImageMetadata>;

	/**
	 * Renders a NativeScript view exactly as it appears on screen into a new ImageSource.
	 * @param view A view that is currently laid out.
	 * @param scale Pixel density multiplier. Defaults to the screen scale.
	 */
	static fromView(view: View, scale?: number): ImageSource;

	/**
	 * Creates a new ImageSource instance and loads it from the specified font icon code.
	 * @param source The hex font icon code string
	 * @param font The font for the corresponding font icon code
	 * @param color The color of the generated icon image
	 */
	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource;

	/**
	 * Creates a new ImageSource instance and sets the provided native source object (typically a Bitmap).
	 * The native source object will update either the android or ios properties, depending on the target os.
	 * @param nativeSource The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
	 */
	constructor(nativeSource?: any);

	/**
	 * @deprecated Use ImageSource.fromAsset() instead.
	 * Loads this instance from the specified asset asynchronously.
	 * @param asset The ImageAsset instance used to create ImageSource.
	 */
	fromAsset(asset: ImageAsset): Promise<ImageSource>;

	/**
	 * @deprecated Use ImageSource.fromResourceSync() instead.
	 * Loads this instance from the specified resource name.
	 * @param name The name of the resource (without its extension).
	 */
	loadFromResource(name: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromResource() instead.
	 * Loads this instance from the specified resource name asynchronously.
	 * @param name The name of the resource (without its extension).
	 */
	fromResource(name: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromFileSync() instead.
	 * Loads this instance from the specified file.
	 * @param path The location of the file on the file system.
	 */
	loadFromFile(path: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromFile() instead.
	 * Loads this instance from the specified file asynchronously.
	 * @param path The location of the file on the file system.
	 */
	fromFile(path: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromDataSync() instead.
	 * Loads this instance from the specified native image data.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	loadFromData(data: any): boolean;

	/**
	 * @deprecated Use ImageSource.fromData() instead.
	 * Loads this instance from the specified native image data asynchronously.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	fromData(data: any): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromBase64Sync() instead.
	 * Loads this instance from the specified base64 encoded string.
	 * @param source The Base64 string to load the image from.
	 */
	loadFromBase64(source: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromBase64() instead.
	 * Loads this instance from the specified base64 encoded string asynchronously.
	 * @param source The Base64 string to load the image from.
	 */
	fromBase64(source: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromFontIconCode() instead.
	 * Loads this instance from the specified font icon code.
	 * @param source The hex font icon code string
	 * @param font The font for the corresponding font icon code
	 * @param color The color of the generated icon image
	 */
	loadFromFontIconCode(source: string, font: Font, color: Color): boolean;

	/**
	 * Gets the native source object (typically a Bitmap or a UIImage).
	 */
	getNativeSource(): any;

	/**
	 * Sets the provided native source object (typically a Bitmap or a UIImage).
	 * This will update either the android or ios properties, depending on the target os.
	 * @param nativeSource The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
	 */
	setNativeSource(nativeSource: any): void;

	/**
	 * Saves this instance to the specified file, using the provided image format and quality.
	 * The write is atomic: the file is either fully written or absent, never partial.
	 * Encoding from pixels never carries EXIF, so the saved file contains no camera or GPS metadata.
	 * @param path The path of the file on the file system to save to.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): boolean;

	/**
	 * Saves this instance to the specified file, using the provided image format and quality asynchronously.
	 * @param path The path of the file on the file system to save to.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	saveToFileAsync(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): Promise<boolean>;

	/**
	 * Converts the image to base64 encoded string, using the provided image format and quality.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	toBase64String(format: 'png' | 'jpeg' | 'jpg', quality?: number): string;

	/**
	 * Converts the image to base64 encoded string, using the provided image format and quality asynchronously.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	toBase64StringAsync(format: 'png' | 'jpeg' | 'jpg', quality?: number): Promise<string>;

	/**
	 * Returns a new ImageSource that is a resized version of this image with the same aspect ratio, but the max dimension set to the provided maxSize.
	 * @param maxSize The maximum pixel dimension of the resulting image.
	 * @param options Optional parameter, Only used for android, options.filter is a boolean which
	 *     determines whether or not bilinear filtering should be used when scaling the bitmap.
	 *     If this is true then bilinear filtering will be used when scaling which has
	 *     better image quality at the cost of worse performance. If this is false then
	 *     nearest-neighbor scaling is used instead which will have worse image quality
	 *     but is faster. Recommended default is to set filter to 'true' as the cost of
	 *     bilinear filtering is typically minimal and the improved image quality is significant.
	 */
	resize(maxSize: number, options?: any): ImageSource;

	/**
	 * Returns a new ImageSource that is a resized version of this image with the same aspect ratio, but the max dimension set to the provided maxSize asynchronously.
	 * @param maxSize The maximum pixel dimension of the resulting image.
	 * @param options Optional parameter, Only used for android, options.filter is a boolean which
	 *     determines whether or not bilinear filtering should be used when scaling the bitmap.
	 *     If this is true then bilinear filtering will be used when scaling which has
	 *     better image quality at the cost of worse performance. If this is false then
	 *     nearest-neighbor scaling is used instead which will have worse image quality
	 *     but is faster. Recommended default is to set filter to 'true' as the cost of
	 *     bilinear filtering is typically minimal and the improved image quality is significant.
	 */
	resizeAsync(maxSize: number, options?: any): Promise<ImageSource>;

	/**
	 * The true size of the image in pixels on both platforms. (width/height report points on iOS.)
	 */
	getPixelSize(): { width: number; height: number };

	/**
	 * Encodes the image and returns the bytes in memory.
	 * @param format The format (encoding) of the image.
	 * @param quality 0-100 for jpeg. Defaults to 100.
	 * @returns The encoded bytes, or null when this instance has no native image.
	 */
	toData(format: ImageFormat, quality?: number): ArrayBuffer;

	/**
	 * Encodes the image on a background thread and returns the bytes in memory.
	 * @param format The format (encoding) of the image.
	 * @param quality 0-100 for jpeg. Defaults to 100.
	 */
	toDataAsync(format: ImageFormat, quality?: number): Promise<ArrayBuffer>;

	/**
	 * Re-encodes at decreasing JPEG quality until the result is at or under maxBytes.
	 * @param maxBytes The byte budget.
	 * @param format Defaults to 'jpeg'. For 'png' the quality search is skipped.
	 * @returns The bytes and the quality that fit, or null when this instance has no native image
	 *          or even the lowest quality exceeds the budget (resize first in that case).
	 */
	compressToFit(maxBytes: number, format?: ImageFormat): ImageCompressResult;

	/**
	 * Re-encodes on a background thread at decreasing JPEG quality until the result is at or under maxBytes.
	 * Rejects when even the lowest quality exceeds the budget.
	 * @param maxBytes The byte budget.
	 * @param format Defaults to 'jpeg'. For 'png' the quality search is skipped.
	 */
	compressToFitAsync(maxBytes: number, format?: ImageFormat): Promise<ImageCompressResult>;

	/**
	 * Returns a copy whose pixels are upright and whose orientation flag is cleared, so
	 * every later operation and save sees the image the way a viewer displays it.
	 */
	normalizeOrientation(): ImageSource;

	/**
	 * Returns a new ImageSource containing only the given rectangle.
	 * @throws When the rectangle falls outside the image.
	 */
	crop(x: number, y: number, width: number, height: number): ImageSource;

	/**
	 * Returns a new ImageSource rotated clockwise by the given degrees.
	 */
	rotate(degrees: number): ImageSource;

	/**
	 * Returns a new ImageSource mirrored on the given axis.
	 */
	flip(axis: ImageFlipAxis): ImageSource;

	/**
	 * Returns a new ImageSource of exactly width x height pixels.
	 * @param width Output width in pixels.
	 * @param height Output height in pixels.
	 * @param options mode ('fit' | 'fill' | 'stretch', default 'fit') and background colour for 'fit'.
	 */
	resizeTo(width: number, height: number, options?: ImageResizeToOptions): ImageSource;

	/**
	 * Applies normalize orientation, crop, rotate, flip and resize in a single native call,
	 * in that fixed order, without round-tripping intermediate results through JavaScript.
	 */
	transform(options: ImageTransformOptions): ImageSource;

	/**
	 * Applies normalize orientation, crop, rotate, flip and resize in a single native call on a background thread.
	 */
	transformAsync(options: ImageTransformOptions): Promise<ImageSource>;

	/**
	 * Returns a new ImageSource with transparent rounded corners.
	 * @param radius Corner radius in pixels.
	 */
	roundCorners(radius: number): ImageSource;

	/**
	 * Returns a new ImageSource masked to the largest centred circle.
	 */
	circleCrop(): ImageSource;

	/**
	 * Returns a new ImageSource with another image drawn on top.
	 * @param other The image to draw.
	 * @param options Position in pixels and opacity.
	 */
	overlay(other: ImageSource, options?: ImageOverlayOptions): ImageSource;

	/**
	 * Returns a new ImageSource with text drawn onto it.
	 */
	drawText(text: string, options: ImageDrawTextOptions): ImageSource;

	/**
	 * Returns a new ImageSource with every visible pixel set to the given colour, keeping transparency.
	 */
	tint(color: Color | string): ImageSource;

	/**
	 * Returns a new ImageSource with the filters applied in order.
	 */
	applyFilters(filters: ImageFilter[]): ImageSource;

	/**
	 * Returns a new ImageSource with the filters applied in order, computed on a background thread.
	 */
	applyFiltersAsync(filters: ImageFilter[]): Promise<ImageSource>;

	/**
	 * The mean colour of the image. Fully transparent pixels are ignored.
	 * @returns The colour, or null when the image is empty or fully transparent.
	 */
	averageColor(): Color;

	/**
	 * The most frequent colours in the image, most common first.
	 * @param count Maximum number of colours to return. Defaults to 5.
	 */
	dominantColors(count?: number): Color[];

	/**
	 * A 64-bit difference hash of the image as 16 hex characters. Visually similar
	 * images (including resized copies) produce hashes that differ in only a few bits.
	 */
	perceptualHash(): string;

	/**
	 * True when the perceptual hashes of the two images differ in at most threshold bits.
	 * @param other The image to compare with.
	 * @param threshold Maximum differing bits, 0-64. Defaults to 10.
	 */
	isSimilarTo(other: ImageSource, threshold?: number): boolean;
}

/**
 * iOS only
 * SF Symbol scale
 */
export type iosSymbolScaleType = 'default' | 'small' | 'medium' | 'large';

/**
 * @deprecated Use ImageSource.fromAsset() instead.
 * Creates a new ImageSource instance and loads it from the specified image asset asynchronously.
 * @param asset The image asset.
 */
export function fromAsset(asset: ImageAsset): Promise<ImageSource>;

/**
 * @deprecated Use ImageSource.fromResourceSync() instead.
 * Creates a new ImageSource instance and loads it from the specified resource name.
 * @param name The name of the resource (without its extension).
 */
export function fromResource(name: string): ImageSource;

/**
 * @deprecated Use ImageSource.fromFileSync() instead.
 * Creates a new ImageSource instance and loads it from the specified file.
 * @param path The location of the file on the file system.
 */
export function fromFile(path: string): ImageSource;

/**
 * @deprecated Use ImageSource.fromDataSync() instead.
 * Creates a new ImageSource instance and loads it from the specified native image data.
 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
 */
export function fromData(data: any): ImageSource;

/**
 * @deprecated Use ImageSource.fromBase64Sync() instead.
 * Creates a new ImageSource instance and loads it from the specified base64 encoded string.
 * @param source The base64 encoded string to load the image from.
 */
export function fromBase64(source: string): ImageSource;

/**
 * @deprecated Use ImageSource constructor instead.
 * Creates a new ImageSource instance and sets the provided native source object (typically a Bitmap).
 * The native source object will update either the android or ios properties, depending on the target os.
 * @param source The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
 */
export function fromNativeSource(source: any): ImageSource;

/**
 * @deprecated Use ImageSource.fromFontIconCodeSync() instead.
 * Creates a new ImageSource instance and loads it from the specified font icon code.
 * @param source The hex font icon code string
 * @param font The font for the corresponding font icon code
 * @param color The color of the generated icon image
 */
export function fromFontIconCode(source: string, font: Font, color: Color): ImageSource;

/**
 * @deprecated Use ImageSource.fromUrl() instead.
 * Downloads the image from the provided Url and creates a new ImageSource instance from it.
 * @param url The link to the remote image object. This operation will download and decode the image.
 */
export function fromUrl(url: string): Promise<ImageSource>;

/**
 * @deprecated Use ImageSource.fromFileOrResourceSync() instead.
 * Creates a new ImageSource instance and loads it from the specified local file or resource (if specified with the "res://" prefix).
 * @param path The location of the file on the file system.
 */
export function fromFileOrResource(path: string): ImageSource;

/**
 * @deprecated Please use utils.isFileOrResourcePath instead.
 * Returns true if the specified path points to a resource or local file.
 * @param path The path.
 */
export function isFileOrResourcePath(path: string): boolean;
