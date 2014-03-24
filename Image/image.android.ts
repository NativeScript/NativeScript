import app_module = require("Application/application");
import types_module = require("Image/image_types");

export class Image {
    public android: any;

    constructor() {
        this.android = null;
    }

    public loadFromResource(name: string): boolean {
        var androidApp = app_module.tk.ui.Application.current.android;
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

    public loadFromBitmap(source: any): boolean {
        this.android = source;
        return (this.android != null);
    }

    public saveToFile(path: string, format: types_module.ImageType, quality?: number): boolean {
        if (this.android) {
            var targetFormat = android.graphics.Bitmap.CompressFormat.PNG;
            switch (format) {
                case types_module.ImageType.JPEG:
                    targetFormat = android.graphics.Bitmap.CompressFormat.JPEG;
                    break;
            }

            // TODO add exception handling
            var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));
            // FIXME compress is not found
            var res = this.android.compress(targetFormat, outputStream);
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