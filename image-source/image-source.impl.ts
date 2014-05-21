import app = require("application");
import native = require("image-source/image-source-native");
import promises = require("promises");
import http = require("http");

// This is used for definition purposes only, it does not generate JavaScript for it.
import definition = require("image-source");

export enum ImageFormat {
    PNG,
    JPEG,
}

export class ImageSource {
    public android: android.graphics.Bitmap;
    public ios: UIKit.UIImage;

    constructor() {
        this.setNativeInstance(null);
    }

    public loadFromResource(name: string): boolean {
        var nativeInstance = native.fromResource(name);
        this.setNativeInstance(nativeInstance);
        return nativeInstance != null;
    }

    public loadFromFile(path: string): boolean {
        var nativeInstance = native.fromFile(path);
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

    get height(): number {
        if (this.android) {
            return this.android.getHeight();
        }
        if (this.ios) {
            return this.ios.size.height;
        }

        return NaN;
    }

    get width(): number {
        if (this.android) {
            return this.android.getWidth();
        }
        if (this.ios) {
            return this.ios.size.width;
        }

        return NaN;
    }

    private setNativeInstance(instance: any) {
        if (app.android) {
            this.android = instance;
        } else if (app.ios) {
            this.ios = instance;
        }
    }

    private getNativeInstance(): any {
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

export function fromUrl(url: string): promises.Promise<definition.ImageSource> {
    return http.getImage(url);
}