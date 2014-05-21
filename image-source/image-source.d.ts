
declare module "image-source" {
    import promises = require("promises/promises");

    /**
    * Defines the recognized image formats.
    */
    export enum ImageFormat {
        PNG,
        JPEG,
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
        * The iOS-specific image instance. Will be undefined when running on Android.
        */
        ios: UIKit.UIImage;

        /**
        * The Android-specific image instance. Will be undefined when running on iOS.
        */
        android: android.graphics.Bitmap;

        /**
        * Loads this instance from the specified resource name.
        * @param name The name of the resource (without its extension).
        */
        loadFromResource(name: string): boolean;

        /**
        * Loads this instance from the specified file.
        * @param path The location of the file on the file system.
        */
        loadFromFile(path: string): boolean;

        /**
        * Loads this instance from the specified native image data.
        * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
        */
        loadFromData(data: any): boolean;

        /**
        * Sets the provided native source object (typically a Bitmap).
        * This will update either the android or ios properties, depending on the target os.
        * @param source The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
        */
        setNativeSource(source: any): boolean;

        /**
        * Saves this instance to the specified file, using the provided image format and quality.
        * @param path The path of the file on the file system to save to.
        * @param format The format (encoding) of the image.
        * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality.
        */
        saveToFile(path: string, format: ImageFormat, quality?: number): boolean;
    }

    /**
    * Creates a new ImageSource instance and loads it from the specified resource name.
    * @param name The name of the resource (without its extension).
    */
    export function fromResource(name: string): ImageSource;

    /**
    * Creates a new ImageSource instance and loads it from the specified file.
    * @param path The location of the file on the file system.
    */
    export function fromFile(path: string): ImageSource;

    /**
    * Creates a new ImageSource instance and loads it from the specified resource name.
    * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
    */
    export function fromData(data: any): ImageSource;

    /**
    * Creates a new ImageSource instance and sets the provided native source object (typically a Bitmap).
    * The native source object will update either the android or ios properties, depending on the target os.
    * @param source The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
    */
    export function fromNativeSource(source: any): ImageSource;

    /**
    * Downloads the image from the provided Url and creates a new ImageSource instance from it.
    * @param url The link to the remote image object. This operation will download and decode the image.
    */
    export function fromUrl(url: string): promises.Promise<ImageSource>;
}