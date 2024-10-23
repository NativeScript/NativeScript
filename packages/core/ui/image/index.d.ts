import { View } from '../core/view';
import { Style } from '../styling/style';
import { ImageSource, iosSymbolScaleType } from '../../image-source';
import { ImageAsset } from '../../image-asset';
import { Color } from '../../color';
import { Property, InheritedCssProperty } from '../core/properties';
import { CoreTypes } from '../../core-types';
import { ImageSymbolEffect, ImageSymbolEffects } from './symbol-effects';
import { PropertyChangeData } from '../../data/observable';

export { ImageSymbolEffect, ImageSymbolEffects } from './image-common';

/**
 * Represents a class that provides functionality for loading and streching image(s).
 *
 * @nsView Image
 */
export class Image extends View {
	/**
	 * String value used when hooking to the isLoadingChange event.
	 *
	 * @nsEvent {PropertyChangeData} isLoading
	 */
	public static isLoadingChangeEvent: string;
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
	 *
	 * @nsProperty
	 */
	imageSource: ImageSource;

	/**
	 * Gets or sets the source of the Image. This can be either an URL string or a native image instance.
	 *
	 * @nsProperty
	 */
	src: string | ImageSource | ImageAsset;

	/**
	 * Gets a value indicating if the image is currently loading.
	 */
	readonly isLoading: boolean;

	/**
	 * Gets or sets the image stretch mode.
	 *
	 * @nsProperty
	 */
	stretch: CoreTypes.ImageStretchType;

	/**
	 * Gets or sets the loading strategy for images on the local file system:
	 * - **sync** - blocks the UI if necessary to display immediately, good for small icons.
	 * - **async** *(default)* - will load in the background, may appear with short delay, good for large images.
	 * When loading images from web they are always loaded **async** no matter of loadMode value.
	 *
	 * @nsProperty
	 */
	loadMode: 'sync' | 'async';

	/**
	 * A color used to tint template images.
	 *
	 * @nsProperty
	 */
	tintColor: Color;

	/**
	 * Gets or sets the desired decode height of the image.
	 * This property is Android specific.
	 *
	 *
	 * @nsProperty
	 */
	decodeHeight: CoreTypes.LengthType;

	/**
	 * Gets or sets the desired decode width of the image.
	 * This property is Android specific.
	 *
	 * @nsProperty
	 */
	decodeWidth: CoreTypes.LengthType;
	/**
	 * Get or set the symbol effect used to animate the SF symbol image
	 * Symbol effects: https://developer.apple.com/documentation/symbols?language=objc
	 *
	 * @nsProperty
	 */
	iosSymbolEffect: ImageSymbolEffect | ImageSymbolEffects;

	/**
	 * Get or set the SF Symbol scale to use.
	 *
	 * @nsProperty
	 */
	iosSymbolScale: iosSymbolScaleType;
}

export const imageSourceProperty: Property<Image, ImageSource>;
export const srcProperty: Property<Image, string | ImageSource | ImageAsset>;
export const isLoadingProperty: Property<Image, string>;
export const loadMode: Property<Image, 'sync' | 'async'>;
export const stretchProperty: Property<Image, CoreTypes.ImageStretchType>;
export const tintColorProperty: InheritedCssProperty<Style, Color>;
export const decodeHeightProperty: Property<Image, CoreTypes.LengthType>;
export const decodeWidthProperty: Property<Image, CoreTypes.LengthType>;
export const iosSymbolScaleProperty: Property<Image, iosSymbolScaleType>;
export const iosSymbolEffectProperty: Property<Image, ImageSymbolEffect | ImageSymbolEffects>;
