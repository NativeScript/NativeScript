
declare module "image-source" {
    import promises = require("promises/promises");

    /**
    * Defines the recognized image formats.
    */
    enum ImageFormat {
        PNG,
        JPEG,
    }

    /**
    * Encapsulates the common abstraction behind a platform specific object (typically a Bitmap) that is used as a source for images.
    */
    class ImageSource {
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
        * Sets the provided native source object (typically a Bitmap).
        * This will update either the android or ios properties, depending on the target os.
        */
        setNativeSource(source: any): boolean;

        /**
        * Saves this instance to the specified file, using the provided image format and quality.
        */
        saveToFile(path: string, format: ImageFormat, quality?: number): boolean;
    }

    /**
    * Creates a new Image instance and loads it from the specified resource name.
    */
    function fromResource(name: string): ImageSource;

    /**
    * Creates a new Image instance and loads it from the specified file.
    */
    function fromFile(path: string): ImageSource;

    /**
    * Creates a new Image instance and loads it from the specified resource name.
    */
    function fromData(data: any): ImageSource;

    /**
    * Creates a new Image instance and sets the provided native source object (typically a Bitmap).
    * The native source object will update either the android or ios properties, depending on the target os.
    */
    function fromNativeSource(source: any): ImageSource;

    /**
    * Downloads the image from the provided Url and creates a new Image instance from it.
    */
    function fromUrl(url: string): promises.Promise<ImageSource>;
}