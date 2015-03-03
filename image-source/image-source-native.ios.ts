export var fromResource = function (name: string) {
    return UIImage.imageNamed(name);
}

export var fromFile = function (path: string) {
    return UIImage.imageWithContentsOfFile(path);
}

export var fromData = function (data: any) {
    return UIImage.imageWithData(data);
}

export var saveToFile = function (instance: UIImage, path: string, format: number, quality?: number): boolean {
    var res = false;
    if (!instance) {
        return res;
    }

    var data = getImageData(instance, format, quality);

    if (data) {
        res = data.writeToFileAtomically(path, true);
    }

    return res;
}

export function toBase64String(instance: UIImage, format: number, quality?: number): string {
    var res = null;
    if (!instance) {
        return res;
    }

    var data = getImageData(instance, format, quality);

    if (data) {
        res = data.base64Encoding();
    }

    return res;
}

function getImageData(instance: UIImage, format: number, quality: number): NSData {
    var data = null;
    switch (format) {
        case 0: // PNG
            data = UIImagePNGRepresentation(instance);
            break;
        case 1: // JPEG
            data = UIImageJPEGRepresentation(instance, ('undefined' === typeof quality) ? 1.0 : quality);
            break;

    }
    return data;
}
