/**
 * Contains the Image class, which represents an image widget.
 */
declare module "ui/image" {
    import { View } from "ui/core/view";
    import { Property, CssProperty } from "ui/core/properties";
    import { Color } from "color";
    import { ImageSource } from "image-source";
    import { Style } from "ui/styling/style";

    /**
     * Represents a class that provides functionality for loading and streching image(s).
     */
    export class Image extends View {
        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/ImageView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.ImageView */;

        /**
         * Gets the native iOS [UIImageView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImageView_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UIImageView */;

        /**
         * Gets or sets the image source of the image.
         */
        imageSource: ImageSource;

        /**
         * Gets or sets the source of the Image. This can be either an URL string or a native image instance.
         */
        src: any;

        /**
         * Gets a value indicating if the image is currently loading
         */
        readonly isLoading: boolean;

        /**
         * Gets or sets the image stretch mode.
         */
        stretch: "none" | "aspectFill" | "aspectFit" | "fill";

        /**
         * Gets or sets the loading strategy for images on the local file system:
         * - **sync** - blocks the UI if necessary to display immediately, good for small icons.
         * - **async** *(default)* - will load in the background, may appear with short delay, good for large images.
         * When loading images from web they are always loaded **async** no matter of loadMode value.
         */
        loadMode: "sync" | "async";

        /**
         * A color used to tint template images.
         */
        tintColor: Color;
    }

    export const imageSourceProperty: Property<Image, ImageSource>;
    export const srcProperty: Property<Image, any>;
    export const isLoadingProperty: Property<Image, string>;
    export const loadMode: Property<Image, "sync" | "async">;
    export const stretchProperty: Property<Image, "none" | "aspectFill" | "aspectFit" | "fill">;
    export const tintColorProperty: CssProperty<Style, Color>;
}