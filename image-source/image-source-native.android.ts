import appModule = require("application");

export function fromResource(name: string) {
    var androidApp = appModule.android;
    var res = androidApp.context.getResources();
    if (res) {
        var identifier: number = res.getIdentifier(name, 'drawable', androidApp.packageName);
        if (0 < identifier) {
            return android.graphics.BitmapFactory.decodeResource(res, identifier);
        }
    }

    return null;
}

export function fromFile(path: string) {
    return android.graphics.BitmapFactory.decodeFile(path, null);
}

export function fromData(data: any) {
    return android.graphics.BitmapFactory.decodeStream(data);
}

export function saveToFile(instance: android.graphics.Bitmap, path: string, format: number, quality = 100): boolean {
    if (!instance) {
        return false;
    }

    var targetFormat = getTargetFromat(format);

    // TODO add exception handling
    var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

    var res = instance.compress(targetFormat, quality, outputStream);
    outputStream.close();
    return res;
}

export function toBase64String(instance: android.graphics.Bitmap, format: number, quality = 100): string {
    if (!instance) {
        return null;;
    }

    var targetFormat = getTargetFromat(format);

    var outputStream = new java.io.ByteArrayOutputStream();
    var base64Stream = new android.util.Base64OutputStream(outputStream, android.util.Base64.NO_WRAP);

    instance.compress(targetFormat, quality, base64Stream);

    base64Stream.close();
    outputStream.close();

    return outputStream.toString();
}

function getTargetFromat(format: number): android.graphics.Bitmap.CompressFormat {
    switch (format) {
        case 1: // JPEG
            return android.graphics.Bitmap.CompressFormat.JPEG;
        default:
            return android.graphics.Bitmap.CompressFormat.PNG;
    }
}