// Definitions.
import { ImageSource as ImageSourceDefinition } from ".";
import { ImageAsset } from "../image-asset";
import * as httpModule from "../http";
import { Font } from "../ui/styling/font";
import { Color } from "../color";

// Types.
import { path as fsPath, knownFolders } from "../file-system";
import { isFileOrResourcePath, RESOURCE_PREFIX, layout } from "../utils/utils";

export { isFileOrResourcePath };

let http: typeof httpModule;
function ensureHttp() {
    if (!http) {
        http = require("../http");
    }
}

export class ImageSource implements ImageSourceDefinition {
    public android: android.graphics.Bitmap;
    public ios: UIImage;

    public fromAsset(asset: ImageAsset) {
        return new Promise<ImageSource>((resolve, reject) => {
            asset.getImageAsync((image, err) => {
                if (image) {
                    resolve(fromNativeSource(image));
                }
                else {
                    reject(err);
                }
            });
        });
    }

    public loadFromResource(name: string): boolean {
        this.ios = (<any>UIImage).tns_safeImageNamed(name) || (<any>UIImage).tns_safeImageNamed(`${name}.jpg`);

        return this.ios != null;
    }

    public fromResource(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                (<any>UIImage).tns_safeDecodeImageNamedCompletion(name, image => {
                    if (image) {
                        this.ios = image;
                        resolve(true);
                    } else {
                        (<any>UIImage).tns_safeDecodeImageNamedCompletion(`${name}.jpg`, image => {
                            this.ios = image;
                            resolve(true);
                        });
                    }
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    public loadFromFile(path: string): boolean {
        this.ios = UIImage.imageWithContentsOfFile(getFileName(path));

        return this.ios != null;
    }

    public fromFile(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                (<any>UIImage).tns_decodeImageWidthContentsOfFileCompletion(getFileName(path), image => {
                    this.ios = image;
                    resolve(true);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    public loadFromData(data: any): boolean {
        this.ios = UIImage.imageWithData(data);

        return this.ios != null;
    }

    public fromData(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                (<any>UIImage).tns_decodeImageWithDataCompletion(data, image => {
                    this.ios = image;
                    resolve(true);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    public loadFromBase64(source: string): boolean {
        if (typeof source === "string") {
            const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);
            this.ios = UIImage.imageWithData(data);
        }

        return this.ios != null;
    }

    public fromBase64(source: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.IgnoreUnknownCharacters);
                UIImage.imageWithData["async"](UIImage, [data]).then(image => {
                    this.ios = image;
                    resolve(true);
                });

            } catch (ex) {
                reject(ex);
            }
        });
    }

    public loadFromFontIconCode(source: string, font: Font, color: Color): boolean {
        let fontSize = layout.toDevicePixels(font.fontSize);
        if (!fontSize) {
            // TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
            fontSize = UIFont.labelFontSize;
        }

        const density = layout.getDisplayDensity();
        const scaledFontSize = fontSize * density;

        const attributes = {
            [NSFontAttributeName]: font.getUIFont(UIFont.systemFontOfSize(scaledFontSize))
        };

        if (color) {
            attributes[NSForegroundColorAttributeName] = color.ios;
        }

        const attributedString = NSAttributedString.alloc().initWithStringAttributes(source, <NSDictionary<string, any>>attributes);

        UIGraphicsBeginImageContextWithOptions(attributedString.size(), false, 0.0);
        attributedString.drawAtPoint(CGPointMake(0, 0));

        const iconImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        this.ios = iconImage;
    
        return this.ios != null;
    }

    public setNativeSource(source: any): void {
        if (source && !(source instanceof UIImage)) {
            throw new Error("The method setNativeSource() expects UIImage instance.");
        }
        this.ios = source;
    }

    public saveToFile(path: string, format: "png" | "jpeg" | "jpg", quality?: number): boolean {
        if (!this.ios) {
            return false;
        }

        if (quality) {
            quality = (quality - 0) / (100 - 0);  // Normalize quality on a scale of 0 to 1
        }

        const data = getImageData(this.ios, format, quality);
        if (data) {
            return NSFileManager.defaultManager.createFileAtPathContentsAttributes(path, data, null);
        }

        return false;
    }

    public toBase64String(format: "png" | "jpeg" | "jpg", quality?: number): string {
        let res = null;
        if (!this.ios) {
            return res;
        }

        if (quality) {
            quality = (quality - 0) / (100 - 0);  // Normalize quality on a scale of 0 to 1
        }

        const data = getImageData(this.ios, format, quality);
        if (data) {
            res = data.base64Encoding();
        }

        return res;

    }

    get height(): number {
        if (this.ios) {
            return this.ios.size.height;
        }

        return NaN;
    }

    get width(): number {
        if (this.ios) {
            return this.ios.size.width;
        }

        return NaN;
    }

    get rotationAngle(): number {
        return NaN;
    }

    set rotationAngle(_value: number) {
        // compatibility with Android
    }
}

function getFileName(path: string): string {
    let fileName = typeof path === "string" ? path.trim() : "";
    if (fileName.indexOf("~/") === 0) {
        fileName = fsPath.join(knownFolders.currentApp().path, fileName.replace("~/", ""));
    }

    return fileName;
}

function getImageData(instance: UIImage, format: "png" | "jpeg" | "jpg", quality = 0.9): NSData {
    let data = null;
    switch (format) {
        case "png":
            data = UIImagePNGRepresentation(instance);
            break;
        case "jpeg":
        case "jpg":
            data = UIImageJPEGRepresentation(instance, quality);
            break;
    }

    return data;
}

export function fromAsset(asset: ImageAsset): Promise<ImageSource> {
    const image = new ImageSource();

    return image.fromAsset(asset);
}

export function fromResource(name: string): ImageSource {
    const image = new ImageSource();

    return image.loadFromResource(name) ? image : null;
}

export function fromFile(path: string): ImageSource {
    const image = new ImageSource();

    return image.loadFromFile(path) ? image : null;
}

export function fromFontIconCode(source: string, font: Font, color: Color): ImageSource {
    const image = new ImageSource();

    return image.loadFromFontIconCode(source, font, color) ? image : null;
}

export function fromData(data: any): ImageSource {
    const image = new ImageSource();

    return image.loadFromData(data) ? image : null;
}

export function fromBase64(source: string): ImageSource {
    const image = new ImageSource();

    return image.loadFromBase64(source) ? image : null;
}

export function fromNativeSource(source: any): ImageSource {
    const imageSource = new ImageSource();
    imageSource.setNativeSource(source);

    return imageSource;
}

export function fromUrl(url: string): Promise<ImageSource> {
    ensureHttp();

    return http.getImage(url);
}

export function fromFileOrResource(path: string): ImageSource {
    if (!isFileOrResourcePath(path)) {
        throw new Error("Path \"" + "\" is not a valid file or resource.");
    }

    if (path.indexOf(RESOURCE_PREFIX) === 0) {
        return fromResource(path.substr(RESOURCE_PREFIX.length));
    }

    return fromFile(path);
}
