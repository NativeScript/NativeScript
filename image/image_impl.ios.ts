export var fromResource = function (name: string) {
    return UIKit.UIImage.imageNamed(name);
}

export var fromFile = function (path: string) {
    return UIKit.UIImage.imageWithContentsOfFile(path);
}

export var fromData = function (data: any) {
    return UIKit.UIImage.imageWithData(data);
}

export var saveToFile = function (instance: UIKit.UIImage, path: string, format: number, quality?: number): boolean {
    if (!instance) {
        return false;
    }

    var res = false;
    var data = null;
    switch (format) {
        case 0: // PNG
            data = UIKit.UIImagePNGRepresentation(instance);
            break;
        case 1: // JPEG
            data = UIKit.UIImageJPEGRepresentation(instance, ('undefined' == typeof quality) ? 1.0 : quality);
            break;
        
    }
    if (null != data) {
        res = data.writeToFileAtomically(path, true);
    }
    return res;
}