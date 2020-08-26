import { Image as ImageDefinition, Stretch } from '.';
import { View, CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { ImageAsset } from '../../image-asset';
import { ImageSource } from '../../image-source';
import { isDataURI, isFontIconURI, isFileOrResourcePath, RESOURCE_PREFIX } from '../../utils';
import { Color } from '../../color';
import { Style } from '../styling/style';
import { Length } from '../styling/style-properties';
import { Property, InheritedCssProperty } from '../core/properties';
import { Trace } from '../../trace';

@CSSType('Image')
export abstract class ImageBase extends View implements ImageDefinition {
	public imageSource: ImageSource;
	public src: string | ImageSource;
	public isLoading: boolean;
	public stretch: Stretch;
	public loadMode: 'sync' | 'async';
	public decodeWidth: Length;
	public decodeHeight: Length;

	get tintColor(): Color {
		return this.style.tintColor;
	}
	set tintColor(value: Color) {
		this.style.tintColor = value;
	}

	/**
	 * @internal
	 */
	public _createImageSourceFromSrc(value: string | ImageSource | ImageAsset): void {
		const originalValue = value;
		const sync = this.loadMode === 'sync';
		if (typeof value === 'string' || value instanceof String) {
			value = value.trim();
			this.imageSource = null;
			this['_url'] = value;

			this.isLoading = true;

			const imageLoaded = (source: ImageSource) => {
				let currentValue = this.src;
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
					const resPath = value.substr(RESOURCE_PREFIX.length);
					if (sync) {
						imageLoaded(ImageSource.fromResourceSync(resPath));
					} else {
						this.imageSource = null;
						ImageSource.fromResource(resPath).then(imageLoaded);
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
					}
				);
			}
		} else if (value instanceof ImageSource) {
			// Support binding the imageSource trough the src property
			this.imageSource = value;
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

export const srcProperty = new Property<ImageBase, any>({ name: 'src' });
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

export const stretchProperty = new Property<ImageBase, Stretch>({
	name: 'stretch',
	defaultValue: 'aspectFit',
	affectsLayout: global.isIOS,
});
stretchProperty.register(ImageBase);

export const tintColorProperty = new InheritedCssProperty<Style, Color>({
	name: 'tintColor',
	cssName: 'tint-color',
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
tintColorProperty.register(Style);

export const decodeHeightProperty = new Property<ImageBase, Length>({
	name: 'decodeHeight',
	defaultValue: { value: 0, unit: 'dip' },
	valueConverter: Length.parse,
});
decodeHeightProperty.register(ImageBase);

export const decodeWidthProperty = new Property<ImageBase, Length>({
	name: 'decodeWidth',
	defaultValue: { value: 0, unit: 'dip' },
	valueConverter: Length.parse,
});
decodeWidthProperty.register(ImageBase);
