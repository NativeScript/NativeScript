import { Image as ImageDefinition } from '.';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { CoreTypes } from '../../core-types';
import { ImageAsset } from '../../image-asset';
import { ImageSource, iosSymbolScaleType } from '../../image-source';
import { isDataURI, isFontIconURI, isFileOrResourcePath, RESOURCE_PREFIX, SYSTEM_PREFIX } from '../../utils';
import { Color } from '../../color';
import { Style } from '../styling/style';
import { Length } from '../styling/style-properties';
import { Property, InheritedCssProperty } from '../core/properties';
import { Trace } from '../../trace';
import { ImageSymbolEffect, ImageSymbolEffects } from './symbol-effects';

@CSSType('Image')
export abstract class ImageBase extends View implements ImageDefinition {
	public static isLoadingChangeEvent = 'isLoadingChange';
	public imageSource: ImageSource;
	public src: string | ImageSource | ImageAsset;
	public isLoading: boolean;
	public stretch: CoreTypes.ImageStretchType;
	public loadMode: 'sync' | 'async';
	public decodeWidth: CoreTypes.LengthType;
	public decodeHeight: CoreTypes.LengthType;
	public iosSymbolScale: iosSymbolScaleType;
	public iosSymbolEffect: ImageSymbolEffect | ImageSymbolEffects;

	get tintColor(): Color {
		return this.style.tintColor;
	}
	set tintColor(value: Color) {
		this.style.tintColor = value;
	}

	public disposeImageSource() {
		// override in subclass
	}

	/**
	 * @internal
	 */
	public _createImageSourceFromSrc(value: string | ImageSource | ImageAsset): void {
		this.disposeImageSource();

		const originalValue = value;
		const sync = this.loadMode === 'sync';
		if (typeof value === 'string' || value instanceof String) {
			value = value.trim();
			this.imageSource = null;
			this['_url'] = value;

			this.isLoading = true;

			const imageLoaded = (source: ImageSource) => {
				const currentValue = this.src;
				if (currentValue !== originalValue) {
					return;
				}
				this.imageSource = source;
				this.isLoading = false;
			};

			if (isFontIconURI(value)) {
				const fontIconCode = value.split('//')[1];
				if (fontIconCode !== undefined) {
					// support sync mode only
					const font = this.style.fontInternal;
					const color = this.style.color;
					imageLoaded(ImageSource.fromFontIconCodeSync(fontIconCode, font, color));
				}
			} else if (isDataURI(value)) {
				const base64Data = value.split(',')[1];
				if (base64Data !== undefined) {
					if (sync) {
						imageLoaded(ImageSource.fromBase64Sync(base64Data));
					} else {
						ImageSource.fromBase64(base64Data).then(imageLoaded);
					}
				}
			} else if (isFileOrResourcePath(value)) {
				if (value.indexOf(RESOURCE_PREFIX) === 0) {
					const resPath = value.slice(RESOURCE_PREFIX.length);
					if (sync) {
						imageLoaded(ImageSource.fromResourceSync(resPath));
					} else {
						this.imageSource = null;
						ImageSource.fromResource(resPath).then(imageLoaded);
					}
				} else if (value.indexOf(SYSTEM_PREFIX) === 0) {
					const sysPath = value.slice(SYSTEM_PREFIX.length);
					if (sync) {
						imageLoaded(ImageSource.fromSystemImageSync(sysPath, this.iosSymbolScale));
					} else {
						this.imageSource = null;
						ImageSource.fromSystemImage(sysPath, this.iosSymbolScale).then(imageLoaded);
					}
				} else {
					if (sync) {
						imageLoaded(ImageSource.fromFileSync(value));
					} else {
						this.imageSource = null;
						ImageSource.fromFile(value).then(imageLoaded);
					}
				}
			} else {
				this.imageSource = null;
				ImageSource.fromUrl(value).then(
					(r) => {
						if (this['_url'] === value) {
							this.imageSource = r;
							this.isLoading = false;
						}
					},
					(err) => {
						// catch: Response content may not be converted to an Image
						this.isLoading = false;
						if (Trace.isEnabled()) {
							if (typeof err === 'object' && err.message) {
								err = err.message;
							}
							Trace.write(err, Trace.categories.Debug);
						}
					},
				);
			}
		} else if (value instanceof ImageSource) {
			// Support binding the imageSource trough the src property

			// This will help avoid cleanup on the actual provided image source in case view gets disposed
			this.imageSource = new ImageSource(value.getNativeSource());
			this.isLoading = false;
		} else if (value instanceof ImageAsset) {
			ImageSource.fromAsset(value).then((result) => {
				this.imageSource = result;
				this.isLoading = false;
			});
		} else {
			this.imageSource = new ImageSource(value);
			this.isLoading = false;
		}
	}
}

ImageBase.prototype.recycleNativeView = 'auto';

export const imageSourceProperty = new Property<ImageBase, ImageSource>({
	name: 'imageSource',
});
imageSourceProperty.register(ImageBase);

export const srcProperty = new Property<ImageBase, string | ImageSource | ImageAsset>({ name: 'src' });
srcProperty.register(ImageBase);

export const loadModeProperty = new Property<ImageBase, 'sync' | 'async'>({
	name: 'loadMode',
	defaultValue: 'sync',
});
loadModeProperty.register(ImageBase);

export const isLoadingProperty = new Property<ImageBase, boolean>({
	name: 'isLoading',
	defaultValue: false,
	valueConverter: booleanConverter,
});
isLoadingProperty.register(ImageBase);

export const stretchProperty = new Property<ImageBase, CoreTypes.ImageStretchType>({
	name: 'stretch',
	defaultValue: 'aspectFit',
	affectsLayout: __APPLE__,
});
stretchProperty.register(ImageBase);

export const tintColorProperty = new InheritedCssProperty<Style, Color>({
	name: 'tintColor',
	cssName: 'tint-color',
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
tintColorProperty.register(Style);

export const decodeHeightProperty = new Property<ImageBase, CoreTypes.LengthType>({
	name: 'decodeHeight',
	defaultValue: { value: 0, unit: 'dip' },
	equalityComparer: Length.equals,
	valueConverter: Length.parse,
});
decodeHeightProperty.register(ImageBase);

export const decodeWidthProperty = new Property<ImageBase, CoreTypes.LengthType>({
	name: 'decodeWidth',
	defaultValue: { value: 0, unit: 'dip' },
	equalityComparer: Length.equals,
	valueConverter: Length.parse,
});
decodeWidthProperty.register(ImageBase);

/**
 * iOS only
 */
export const iosSymbolEffectProperty = new Property<ImageBase, ImageSymbolEffect | ImageSymbolEffects>({
	name: 'iosSymbolEffect',
});
iosSymbolEffectProperty.register(ImageBase);

/**
 * iOS only
 */
export const iosSymbolScaleProperty = new Property<ImageBase, iosSymbolScaleType>({
	name: 'iosSymbolScale',
});
iosSymbolScaleProperty.register(ImageBase);

export { ImageSymbolEffect, ImageSymbolEffects };
