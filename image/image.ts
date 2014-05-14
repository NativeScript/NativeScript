import app = require("application/application");
import impl = require("image/image_impl");
import promises = require("promises/promises");
import http = require("http/http");

export enum ImageFormat {
    PNG,
    JPEG,
}

export class Image {
    public android: android.graphics.Bitmap;
    public ios: UIKit.UIImage;

    constructor() {
        this.setNativeInstance(null);
    }

    public loadFromResource(name: string): boolean {
        var nativeInstance = impl.fromResource(name);
        this.setNativeInstance(nativeInstance);
        return nativeInstance != null;
    }

    public loadFromFile(path: string): boolean {
        var nativeInstance = impl.fromFile(path);
        this.setNativeInstance(nativeInstance);
        return (nativeInstance != null);
    }

    public loadFromData(data: any): boolean {
        var nativeInstance = impl.fromData(data);
        this.setNativeInstance(nativeInstance);
        return (nativeInstance != null);
    }

    public setNativeBitmap(source: any): boolean {
        this.setNativeInstance(source);
        return source != null;
    }

    public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
        return impl.saveToFile(this.getNativeInstance(), path, format, quality);
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

export function fromResource(name: string): Image {
    var image = new Image();
    return image.loadFromResource(name) ? image : null;
}

export function fromFile(path: string): Image {
    var image = new Image();
    return image.loadFromFile(path) ? image : null;
}

export function fromData(data: any): Image {
    var image = new Image();
    return image.loadFromData(data) ? image : null;
}

export function fromNativeBitmap(source: any): Image {
    var image = new Image();
    return image.setNativeBitmap(source) ? image : null;
}

export function fromUrl(url: string): promises.Promise<Image> {
    return http.getImage(url);
}