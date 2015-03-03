import native = require("image-source/image-source-native");
import platform = require("platform");
import types = require("utils/types");
import fs = require("file-system");
import http = require("http");

// This is used for definition purposes only, it does not generate JavaScript for it.
import definition = require("image-source");

export enum ImageFormat {
    PNG,
    JPEG,
}

// TODO: Refactor into two files (.android.ts & .ios.ts);
export class ImageSource {
    public android: android.graphics.Bitmap;
    public ios: UIImage;

    constructor() {
        this.setNativeInstance(null);
    }

    public loadFromResource(name: string): boolean {
        var nativeInstance = native.fromResource(name);
        this.setNativeInstance(nativeInstance);
        return nativeInstance != null;
    }

    public loadFromFile(path: string): boolean {
        var fileName = types.isString(path) ? path.trim() : "";

        if (fileName.indexOf("~/") === 0) {
            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
        }

        var nativeInstance = native.fromFile(fileName);
        this.setNativeInstance(nativeInstance);
        return (nativeInstance != null);
    }

    public loadFromData(data: any): boolean {
        var nativeInstance = native.fromData(data);
        this.setNativeInstance(nativeInstance);
        return (nativeInstance != null);
    }

    public setNativeSource(source: any): boolean {
        this.setNativeInstance(source);
        return source != null;
    }

    public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
        return native.saveToFile(this.getNativeInstance(), path, format, quality);
    }

    public toBase64String(format: ImageFormat, quality?: number): string {
        return native.toBase64String(this.getNativeInstance(), format, quality);
    }

    get height(): number {
        // TODO: Refactor this, use class inheritance to overcome these switches
        if (this.android) {
            return this.android.getHeight();
        }
        if (this.ios) {
            return this.ios.size.height;
        }

        return NaN;
    }

    get width(): number {
        // TODO: Refactor this, use class inheritance to overcome these switches
        if (this.android) {
            return this.android.getWidth();
        }
        if (this.ios) {
            return this.ios.size.width;
        }

        return NaN;
    }

    private setNativeInstance(instance: any) {
        // TODO: Refactor this, use class inheritance to overcome these switches
        if (platform.device.os === platform.platformNames.android) {
            this.android = instance;
        } else if (platform.device.os === platform.platformNames.ios) {
            this.ios = instance;
        }
    }

    private getNativeInstance(): any {
        // TODO: Refactor this, use class inheritance to overcome these switches
        if (this.android) {
            return this.android;
        }
        if (this.ios) {
            return this.ios;
        }

        return undefined;
    }
}

export function fromResource(name: string): ImageSource {
    var image = new ImageSource();
    return image.loadFromResource(name) ? image : null;
}

export function fromFile(path: string): ImageSource {
    var image = new ImageSource();
    return image.loadFromFile(path) ? image : null;
}

export function fromData(data: any): ImageSource {
    var image = new ImageSource();
    return image.loadFromData(data) ? image : null;
}

export function fromNativeSource(source: any): ImageSource {
    var image = new ImageSource();
    return image.setNativeSource(source) ? image : null;
}

export function fromUrl(url: string): Promise<definition.ImageSource> {
    return http.getImage(url);
}