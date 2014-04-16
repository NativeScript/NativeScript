export enum ImageType {
    PNG = 0,
    JPEG = 1,
}

export class Image {
    public ios: any;

    constructor() {
        this.ios = null;
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
        this.ios = UIKit.UIImage.imageNamed(name);
        return (this.ios != null);
    }

    public loadFromFile(path: string): boolean {
        this.ios = UIKit.UIImage.imageWithContentsOfFile(path);
        return (this.ios != null);
    }

    public loadFromData(data: any): boolean {
        this.ios = UIKit.UIImage.imageWithData(data);
        return (this.ios != null);
    }

    public loadFromNativeBitmap(source: any): boolean {
        this.ios = source;
        return (this.ios != null);
    }

    public saveToFile(path: string, format: ImageType, quality?: number): boolean {
        if (null == this.ios) {
            return false;
        }
        var res = false;
        var data = null;
        switch (format) {
            case ImageType.JPEG:
                data = UIKit.UIImageJPEGRepresentation(this.ios, ('undefined' == typeof quality) ? 1.0 : quality);
                break;
            case ImageType.PNG:
                data = UIKit.UIImagePNGRepresentation(this.ios);
                break;
        }
        if (null != data) {
            res = data.writeToFileAtomically(path, true);
        }
        return res;
    }

    public getHeight(): number {
        return (this.ios) ? this.ios.size.height : NaN;
    }

    public getWidth(): number {
        return (this.ios) ? this.ios.size.width : NaN;
    }
}