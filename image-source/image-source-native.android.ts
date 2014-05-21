import appModule = require("application");

export var fromResource = function (name: string) {
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

export var fromFile = function (path: string) {
    return android.graphics.BitmapFactory.decodeFile(path, null);
}

export var fromData = function (data: any) {
    return android.graphics.BitmapFactory.decodeStream(data);
}

export var saveToFile = function (instance: android.graphics.Bitmap, path: string, format: number, quality = 100): boolean {
    if (!instance) {
        return false;
    }

    var targetFormat = android.graphics.Bitmap.CompressFormat.PNG;
    switch (format) {
        case 1: // JPEG
            targetFormat = android.graphics.Bitmap.CompressFormat.JPEG;
            break;
    }

    // TODO add exception handling
    var outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(path));

    var res = instance.compress(targetFormat, quality, outputStream);
    outputStream.close();
    return res;
}