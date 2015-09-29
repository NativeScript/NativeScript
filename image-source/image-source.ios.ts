import definition = require("image-source");
import types = require("utils/types");
import fs = require("file-system");
import common = require("./image-source-common");
import enums = require("ui/enums");

global.moduleMerge(common, exports);

export class ImageSource implements definition.ImageSource {
    public android: android.graphics.Bitmap;
    public ios: UIImage;

    public loadFromResource(name: string): boolean {
        this.ios = UIImage.imageNamed(name);
        return this.ios != null;
    }

    public loadFromFile(path: string): boolean {
        var fileName = types.isString(path) ? path.trim() : "";

        if (fileName.indexOf("~/") === 0) {
            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
        }

        this.ios = UIImage.imageWithContentsOfFile(fileName);
        return this.ios != null;
    }

    public loadFromData(data: any): boolean {
        this.ios = UIImage.imageWithData(data);
        return this.ios != null;
    }

    public loadFromBase64(source: string): boolean {
        if (types.isString(source)) {
            var data = NSData.alloc().initWithBase64EncodedStringOptions(source, NSDataBase64DecodingOptions.NSDataBase64DecodingIgnoreUnknownCharacters);
            this.ios = UIImage.imageWithData(data);
        }
        return this.ios != null;
    }

    public setNativeSource(source: any): boolean {
        this.ios = source;
        return source != null;
    }

    public saveToFile(path: string, format: string, quality?: number): boolean {
        if (!this.ios) {
            return false;
        }

        var data = getImageData(this.ios, format, quality);

        if (data) {
            return data.writeToFileAtomically(path, true);
        }

        return false;
    }

    public toBase64String(format: string, quality?: number): string {
        var res = null;
        if (!this.ios) {
            return res;
        }

        var data = getImageData(this.ios, format, quality);

        if (data) {
            res = data.base64Encoding();
        }

        return res;

    }

    get height(): number {
        if (this.ios) {
            return this.ios.size.height;
        }

        return NaN;
    }

    get width(): number {
        if (this.ios) {
            return this.ios.size.width;
        }

        return NaN;
    }
}

function getImageData(instance: UIImage, format: string, quality = 1.0): NSData {
    var data = null;
    switch (format) {
        case enums.ImageFormat.png: // PNG
            data = UIImagePNGRepresentation(instance);
            break;
        case enums.ImageFormat.jpeg: // JPEG
            data = UIImageJPEGRepresentation(instance, quality);
            break;

    }
    return data;
}
