import types = require("utils/types");
import fs = require("file-system");
import definition = require("image-source");
import common = require("image-source/image-source-common");
import enums = require("ui/enums");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class ImageSource implements definition.ImageSource {
    public android: android.graphics.Bitmap;
    public ios: UIImage;

    public loadFromResource(name: string): boolean {
        this.android = null;

        var res = utils.ad.getApplicationContext().getResources();
        if (res) {
            var identifier: number = res.getIdentifier(name, 'drawable', utils.ad.getApplication().getPackageName());
            if (0 < identifier) {
                // Load BitmapDrawable with getDrawable to make use of Android internal caching
                var bitmapDrawable = <android.graphics.drawable.BitmapDrawable>res.getDrawable(identifier);
                if (bitmapDrawable && bitmapDrawable.getBitmap) {
                    this.android  = bitmapDrawable.getBitmap();
                }
            }
        }

        return this.android != null;
    }

    public loadFromFile(path: string): boolean {
        var fileName = types.isString(path) ? path.trim() : "";
        if (fileName.indexOf("~/") === 0) {
            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
        }

        this.android = android.graphics.BitmapFactory.decodeFile(fileName, null);
        return this.android != null;
    }

    public loadFromData(data: any): boolean {
        this.android = android.graphics.BitmapFactory.decodeStream(data);
        return this.android != null;
    }

    public loadFromBase64(source: string): boolean {
        if (types.isString(source)) {
            var bytes = android.util.Base64.decode(source, android.util.Base64.DEFAULT);
            this.android = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length)
        }
        return this.android != null;
    }

    public setNativeSource(source: any): boolean {
        this.android = source;
        return source != null;
    }

    public saveToFile(path: string, format: string, quality = 100): boolean {
        if (!this.android) {
            return false;
        }

        var targetFormat = getTargetFromat(format);

        // TODO add exception handling
        var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

        var res = this.android.compress(targetFormat, quality, outputStream);
        outputStream.close();
        return res;
    }

    public toBase64String(format: string, quality = 100): string {
        if (!this.android) {
            return null;;
        }

        var targetFormat = getTargetFromat(format);

        var outputStream = new java.io.ByteArrayOutputStream();
        var base64Stream = new android.util.Base64OutputStream(outputStream, android.util.Base64.NO_WRAP);

        this.android.compress(targetFormat, quality, base64Stream);

        base64Stream.close();
        outputStream.close();

        return outputStream.toString();
    }

    get height(): number {
        if (this.android) {
            return this.android.getHeight();
        }

        return NaN;
    }

    get width(): number {
        if (this.android) {
            return this.android.getWidth();
        }

        return NaN;
    }
}

function getTargetFromat(format: string): android.graphics.Bitmap.CompressFormat {
    switch (format) {
        case enums.ImageFormat.jpeg:
            return android.graphics.Bitmap.CompressFormat.JPEG;
        default:
            return android.graphics.Bitmap.CompressFormat.PNG;
    }
}