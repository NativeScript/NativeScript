import app_module = require("Application/application");

export module tk {
    export module ui {
        export enum ImageType {
            PNG = 0,
            JPEG = 1,
        }

        export class Image {
            private _nativeImage: any;

            constructor() {
                this._nativeImage = null;
            }

            public loadFromResource(name: string): boolean {
                var androidApp = app_module.tk.ui.Application.current.android;
                var res = androidApp.context.getResources();
                if (res) {
                    var identifier: number = res.getIdentifier(name, 'drawable', androidApp.packageName);
                    if (0 < identifier) {
                        this._nativeImage = android.graphics.BitmapFactory.decodeResource(res, identifier);
                        return (this._nativeImage != null);
                    }
                }
                return false;
            }

            public loadFromFile(path: string): boolean {
                this._nativeImage = android.graphics.BitmapFactory.decodeFile(path, null);
                return (this._nativeImage != null);
            }

            public loadFromData(data: any): boolean {
                this._nativeImage = android.graphics.BitmapFactory.decodeStream(data);
                return (this._nativeImage != null);
            }

            public loadFromBitmap(source: any): boolean {
                this._nativeImage = source;
                return (this._nativeImage != null);
            }

            public saveToFile(path: string, format: ImageType, quality?: number): boolean {
                if (this._nativeImage) {
                    var targetFormat = android.graphics.Bitmap.CompressFormat.PNG;
                    switch (format) {
                        case ImageType.JPEG:
                            targetFormat = android.graphics.Bitmap.CompressFormat.JPEG;
                            break;
                    }

                    // TODO add exception handling
                    var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));
                    // FIXME compress is not found
                    var res = this._nativeImage.compress(targetFormat, outputStream);
                    outputStream.close();
                    return res;
                }
                return false;
            }

            public getHeight(): number {
                return (this._nativeImage) ? this._nativeImage.getHeight() : NaN;
            }

            public getWidth(): number {
                return (this._nativeImage) ? this._nativeImage.getWidth() : NaN;
            }
        }
    }
}  