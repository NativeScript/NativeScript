import appModule = require("Application/application");

export enum ImageFormat {
    PNG,
    JPEG,
}

export class Image {
    public android: android.graphics.Bitmap;

    constructor() {
        this.android = null;
    }

    public loadFromResource(name: string): boolean {
        var androidApp = appModule.android;
        var res = androidApp.context.getResources();
        if (res) {
            var identifier: number = res.getIdentifier(name, 'drawable', androidApp.packageName);
            if (0 < identifier) {
                this.android = android.graphics.BitmapFactory.decodeResource(res, identifier);
                return (this.android != null);
            }
        }
        return false;
    }

    public loadFromFile(path: string): boolean {
        this.android = android.graphics.BitmapFactory.decodeFile(path, null);
        return (this.android != null);
    }

    public loadFromData(data: any): boolean {
        this.android = android.graphics.BitmapFactory.decodeStream(data);
        return (this.android != null);
    }

    public setNativeBitmap(source: any): boolean {
        this.android = source;
        return (this.android != null);
    }

    public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
        if (this.android) {
            var targetFormat = android.graphics.Bitmap.CompressFormat.PNG;
            switch (format) {
                case ImageFormat.JPEG:
                    targetFormat = android.graphics.Bitmap.CompressFormat.JPEG;
                    break;
            }

            // TODO add exception handling
            var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

            if (typeof quality == "undefined") {
                quality = 100;
            }

            var res = this.android.compress(targetFormat, quality, outputStream);
            outputStream.close();
            return res;
        }
        return false;
    }

    get height(): number {
        return (this.android) ? this.android.getHeight() : NaN;
    }

    get width(): number {
        return (this.android) ? this.android.getWidth() : NaN;
    }
}

// TODO: These functions are the same in each platform, think for some common code separation
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