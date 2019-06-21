import { Image as ImageDefinition, Stretch } from ".";
import { View, Property, InheritedCssProperty, Length, Style, Color, isIOS, booleanConverter, CSSType, traceEnabled, traceWrite, traceCategories } from "../core/view";
import { ImageAsset } from "../../image-asset";
import { ImageSource, fromAsset, fromNativeSource, fromUrl } from "../../image-source";
import { isDataURI, isFileOrResourcePath, RESOURCE_PREFIX } from "../../utils/utils";
export * from "../core/view";
export { ImageSource, ImageAsset, fromAsset, fromNativeSource, fromUrl, isDataURI, isFileOrResourcePath, RESOURCE_PREFIX };

@CSSType("Image")
export abstract class ImageBase extends View implements ImageDefinition {
    public imageSource: ImageSource;
    public src: string | ImageSource;
    public isLoading: boolean;
    public stretch: Stretch;
    public loadMode: "sync" | "async";
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
        const sync = this.loadMode === "sync";
        if (typeof value === "string" || value instanceof String) {
            value = value.trim();
            this.imageSource = null;
            this["_url"] = value;

            this.isLoading = true;

            const source = new ImageSource();
            const imageLoaded = () => {
                let currentValue = this.src;
                if (currentValue !== originalValue) {
                    return;
                }
                this.imageSource = source;
                this.isLoading = false;
            };

            if (isDataURI(value)) {
                const base64Data = value.split(",")[1];
                if (base64Data !== undefined) {
                    if (sync) {
                        source.loadFromBase64(base64Data);
                        imageLoaded();
                    } else {
                        source.fromBase64(base64Data).then(imageLoaded);
                    }
                }
            } else if (isFileOrResourcePath(value)) {
                if (value.indexOf(RESOURCE_PREFIX) === 0) {
                    const resPath = value.substr(RESOURCE_PREFIX.length);
                    if (sync) {
                        source.loadFromResource(resPath);
                        imageLoaded();
                    } else {
                        this.imageSource = null;
                        source.fromResource(resPath).then(imageLoaded);
                    }
                } else {
                    if (sync) {
                        source.loadFromFile(value);
                        imageLoaded();
                    } else {
                        this.imageSource = null;
                        source.fromFile(value).then(imageLoaded);
                    }
                }
            } else {
                this.imageSource = null;
                fromUrl(value).then((r) => {
                    if (this["_url"] === value) {
                        this.imageSource = r;
                        this.isLoading = false;
                    }
                }, err => {
                    // catch: Response content may not be converted to an Image
                    this.isLoading = false;
                    if (traceEnabled()) {
                        if (typeof err === "object" && err.message) {
                            err = err.message;
                        }
                        traceWrite(err, traceCategories.Debug);
                    }
                });
            }
        } else if (value instanceof ImageSource) {
            // Support binding the imageSource trough the src property
            this.imageSource = value;
            this.isLoading = false;
        }
        else if (value instanceof ImageAsset) {
            fromAsset(value).then((result) => {
                this.imageSource = result;
                this.isLoading = false;
            });
        }
        else {
            this.imageSource = fromNativeSource(value);
            this.isLoading = false;
        }
    }
}

ImageBase.prototype.recycleNativeView = "auto";

export const imageSourceProperty = new Property<ImageBase, ImageSource>({ name: "imageSource" });
imageSourceProperty.register(ImageBase);

export const srcProperty = new Property<ImageBase, any>({ name: "src" });
srcProperty.register(ImageBase);

export const loadModeProperty = new Property<ImageBase, "sync" | "async">({ name: "loadMode", defaultValue: "sync" });
loadModeProperty.register(ImageBase);

export const isLoadingProperty = new Property<ImageBase, boolean>({ name: "isLoading", defaultValue: false, valueConverter: booleanConverter });
isLoadingProperty.register(ImageBase);

export const stretchProperty = new Property<ImageBase, Stretch>({ name: "stretch", defaultValue: "aspectFit", affectsLayout: isIOS });
stretchProperty.register(ImageBase);

export const tintColorProperty = new InheritedCssProperty<Style, Color>({ name: "tintColor", cssName: "tint-color", equalityComparer: Color.equals, valueConverter: (value) => new Color(value) });
tintColorProperty.register(Style);

export const decodeHeightProperty = new Property<ImageBase, Length>({ name: "decodeHeight", defaultValue: { value: 0, unit: "dip" }, valueConverter: Length.parse });
decodeHeightProperty.register(ImageBase);

export const decodeWidthProperty = new Property<ImageBase, Length>({ name: "decodeWidth", defaultValue: { value: 0, unit: "dip" }, valueConverter: Length.parse });
decodeWidthProperty.register(ImageBase);
