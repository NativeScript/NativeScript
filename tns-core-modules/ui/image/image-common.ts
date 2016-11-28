import { Image as ImageDefinition } from "ui/image";
import { View } from "ui/core/view";
import { ImageSource, fromAsset, fromNativeSource, fromUrl } from "image-source";
import { ImageAsset } from "image-asset";
import { isIOS } from "platform";
import { isDataURI, isFileOrResourcePath, RESOURCE_PREFIX } from "utils/utils";
import { Color } from "color";
import { Property, CssProperty } from "../core/properties";
import { Style } from "ui/styling/style";

export * from "ui/core/view";

export abstract class ImageBase extends View implements ImageDefinition {
    public imageSource: ImageSource;
    public src: string | ImageSource;
    public isLoading: boolean;
    public stretch: "none" | "aspectFill" | "aspectFit" | "fill";
    public loadMode: "sync" | "async";

    get tintColor(): Color {
        return this.style.tintColor;
    }
    set tintColor(value: Color) {
        this.style.tintColor = value;
    }

    public _setNativeImage(nativeImage: any) {
        //
    }

    /**
     * @internal
     */
    public _createImageSourceFromSrc(): void {
        let value = this.src;
        let originalValue = value;
        let sync = this.loadMode === "sync";
        if (typeof value === "string") {
            value = value.trim();
            this.imageSource = null;
            this["_url"] = value;

            this.isLoading = true;

            let source = new ImageSource();
            let imageLoaded = () => {
                let currentValue = this.src;
                if (currentValue !== originalValue) {
                    return;
                }
                this.imageSource = source;
                this.isLoading = false;
            }
            if (isDataURI(value)) {
                let base64Data = value.split(",")[1];
                if (base64Data !== undefined) {
                    if (sync) {
                        source.loadFromBase64(base64Data);
                        imageLoaded();
                    } else {
                        source.fromBase64(base64Data).then(imageLoaded);
                    }
                }
            }
            else if (isFileOrResourcePath(value)) {
                if (value.indexOf(RESOURCE_PREFIX) === 0) {
                    let resPath = value.substr(RESOURCE_PREFIX.length);
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
                });
            }
        }
        else if (value instanceof ImageSource) {
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

export const imageSourceProperty = new Property<ImageBase, ImageSource>({ name: "imageSource" });

export const srcProperty = new Property<ImageBase, any>({ name: "src" });
srcProperty.register(ImageBase);

export const loadModeProperty = new Property<ImageBase, "sync" | "async">({ name: "loadMode", defaultValue: "async" });
loadModeProperty.register(ImageBase);

export const isLoadingProperty = new Property<ImageBase, boolean>({ name: "isLoading", defaultValue: false });
isLoadingProperty.register(ImageBase);

export const stretchProperty = new Property<ImageBase, "none" | "aspectFill" | "aspectFit" | "fill">({ name: "stretch", defaultValue: "aspectFit", affectsLayout: isIOS })
stretchProperty.register(ImageBase);

export const tintColorProperty = new InheritedCssProperty<Style, Color>({ name: "tintColor", cssName: "tint-color", equalityComparer: Color.equals, valueConverter: (value) => new Color(value) });
tintColorProperty.register(Style);