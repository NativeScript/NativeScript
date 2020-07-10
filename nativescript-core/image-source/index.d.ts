import { ImageAsset } from '../image-asset';
import { Font } from '../ui/styling/font';
import { Color } from '../color';
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
	ios: any /* UIImage */;

	/**
	 * The Android-specific [image](http://developer.android.com/reference/android/graphics/Bitmap.html) instance. Will be undefined when running on iOS.
	 */
	android: any /* android.graphics.Bitmap */;

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
	 * Loads this instance from the specified file.
	 * @param path The location of the file on the file system.
	 */
	static fromFileSync(path: string): ImageSource;

	/**
	 * Loads this instance from the specified file asynchronously.
	 * @param path The location of the file on the file system.
	 */
	static fromFile(path: string): Promise<ImageSource>;

	/**
	 * Creates a new ImageSource instance and loads it from the specified local file or resource (if specified with the "res://" prefix).
	 * @param path The location of the file on the file system.
	 */
	static fromFileOrResourceSync(path: string): ImageSource;

	/**
	 * Loads this instance from the specified native image data.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromDataSync(data: any): ImageSource;

	/**
	 * Loads this instance from the specified native image data asynchronously.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromData(data: any): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified base64 encoded string.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64Sync(source: string): ImageSource;

	/**
	 * Loads this instance from the specified base64 encoded string asynchronously.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64(source: string): Promise<ImageSource>;

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
	 * Sets the provided native source object (typically a Bitmap or a UIImage).
	 * This will update either the android or ios properties, depending on the target os.
	 * @param nativeSource The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
	 */
	setNativeSource(nativeSource: any): void;

	/**
	 * Saves this instance to the specified file, using the provided image format and quality.
	 * @param path The path of the file on the file system to save to.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): boolean;

	/**
	 * Converts the image to base64 encoded string, using the provided image format and quality.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	toBase64String(format: 'png' | 'jpeg' | 'jpg', quality?: number): string;

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
}

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
