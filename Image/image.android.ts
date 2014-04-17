import app_module = require("Application/application");

export enum ImageType {
    PNG = 0,
    JPEG = 1,
}

export class Image {
    public android: any;

    constructor() {
        this.android = null;
    }

    public static imageFromResource(name: string): Image {
        var image = new Image();
        return image.loadFromResource(name) ? image : null;
    }

    public static imageFromFile(path: string): Image {
        var image = new Image();
        return image.loadFromFile(path) ? image : null;
    }

    public static imageFromData(data: any): Image {
        var image = new Image();
        return image.loadFromData(data) ? image : null;
    }

    public static imageFromNativeBitmap(source: any): Image {
        var image = new Image();
        return image.loadFromNativeBitmap(source) ? image : null;
    }

    public loadFromResource(name: string): boolean {
        var androidApp = app_module.Application.current.android;
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

    public loadFromNativeBitmap(source: any): boolean {
        this.android = source;
        return (this.android != null);
    }

    public saveToFile(path: string, format: ImageType, quality?: number): boolean {
        if (this.android) {
            var targetFormat = android.graphics.Bitmap.CompressFormat.PNG;
            switch (format) {
                case ImageType.JPEG:
                    targetFormat = android.graphics.Bitmap.CompressFormat.JPEG;
                    break;
            }

            // TODO add exception handling
            var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

            if (!quality) {
                quality = 100;
            }

            var res = this.android.compress(targetFormat, quality, outputStream);
            outputStream.close();
            return res;
        }
        return false;
    }

    public getHeight(): number {
        return (this.android) ? this.android.getHeight() : NaN;
    }

    public getWidth(): number {
        return (this.android) ? this.android.getWidth() : NaN;
    }
}