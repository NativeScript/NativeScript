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
                this._nativeImage = UIKit.UIImage.imageNamed(name);
                return (this._nativeImage != null);
            }

            public loadFromFile(path: string): boolean {
                this._nativeImage = UIKit.UIImage.imageWithContentsOfFile(path);
                return (this._nativeImage != null);
            }

            public loadFromData(data: any): boolean {
                this._nativeImage = UIKit.UIImage.imageWithData(data);
                return (this._nativeImage != null);
            }

            public loadFromBitmap(source: any): boolean {
                this._nativeImage = source;
                return (this._nativeImage != null);
            }

            public saveToFile(path: string, format: ImageType, quality?: number): boolean {
                if (null == this._nativeImage) {
                    return false;
                }
                var res = false;
                var data = null;
                switch (format) {
                    case ImageType.JPEG:
                        data = UIKit.UIImageJPEGRepresentation(this._nativeImage, ('undefined' == typeof quality) ? 1.0 : quality);
                        break;
                    case ImageType.PNG:
                        data = UIKit.UIImagePNGRepresentation(this._nativeImage);
                        break;
                }
                if (null != data) {
                    res = data.writeToFileAtomically(path, true);
                }
                return res;
            }

            public getHeight(): number {
                return (this._nativeImage) ? this._nativeImage.size().height : NaN;
            }

            public getWidth(): number {
                return (this._nativeImage) ? this._nativeImage.size().width : NaN;
            }
        }
    }
}  