export enum ImageFormat {
    PNG,
    JPEG,
}

export class Image {
    public ios: UIKit.UIImage;

    constructor() {
        this.ios = null;
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

    public setNativeBitmap(source: any): boolean {
        this.ios = source;
        return (this.ios != null);
    }

    public saveToFile(path: string, format: ImageFormat, quality?: number): boolean {
        if (null == this.ios) {
            return false;
        }
        var res = false;
        var data = null;
        switch (format) {
            case ImageFormat.JPEG:
                data = UIKit.UIImageJPEGRepresentation(this.ios, ('undefined' == typeof quality) ? 1.0 : quality);
                break;
            case ImageFormat.PNG:
                data = UIKit.UIImagePNGRepresentation(this.ios);
                break;
        }
        if (null != data) {
            res = data.writeToFileAtomically(path, true);
        }
        return res;
    }

    get height(): number {
        return (this.ios) ? this.ios.size.height : NaN;
    }

    get width(): number {
        return (this.ios) ? this.ios.size.width : NaN;
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