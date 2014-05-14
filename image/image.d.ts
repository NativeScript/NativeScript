import promises = require("promises/promises");

/**
* Defines the recognized image formats.
*/
export declare enum ImageFormat {
    PNG,
    JPEG,
}

/**
* Encapsulates the common abstraction behind a platform specific image object.
*/
export declare class Image {
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
    */
    loadFromResource(name: string): boolean;

    /**
    * Loads this instance from the specified file.
    */
    loadFromFile(path: string): boolean;

    /**
    * Loads this instance from the specified native image data.
    */
    loadFromData(data: any): boolean;

    /**
    * Sets the provided native bitmap object.
    * This will update either the android or ios properties, depending on the target os.
    */
    setNativeBitmap(source: any): boolean;

    /**
    * Saves this instance to the specified file, using the provided image format and quality.
    */
    saveToFile(path: string, format: ImageFormat, quality?: number): boolean;
}

/**
* Creates a new Image instance and loads it from the specified resource name.
*/
export declare function fromResource(name: string): Image;

/**
* Creates a new Image instance and loads it from the specified file.
*/
export declare function fromFile(path: string): Image;

/**
* Creates a new Image instance and loads it from the specified resource name.
*/
export declare function fromData(data: any): Image;

/**
* Creates a new Image instance and sets the provided native bitmap object.
* The native bitmap object will update either the android or ios properties, depending on the target os.
*/
export declare function fromNativeBitmap(source: any): Image;

/**
* Downloads the image from the provided Url and creates a new Image instance from it.
*/
export declare function fromUrl(url: string): promises.Promise<Image>;