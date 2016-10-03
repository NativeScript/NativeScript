import utils = require("utils/utils");
import * as httpModule from "http";
import * as imageAssetModule from "image-asset";

var http: typeof httpModule;
function ensureHttp() {
    if (!http) {
        http = require("http");
    }
}

// This is used for definition purposes only, it does not generate JavaScript for it.
import definition = require("image-source");

export function fromAsset(asset: imageAssetModule.ImageAsset): Promise<definition.ImageSource> {
    let image = new definition.ImageSource();
    return image.fromAsset(asset);
}

export function fromResource(name: string): definition.ImageSource {
    var image = new definition.ImageSource();
    return image.loadFromResource(name) ? image : null;
}

export function fromFile(path: string): definition.ImageSource {
    var image = new definition.ImageSource();
    return image.loadFromFile(path) ? image : null;
}

export function fromData(data: any): definition.ImageSource {
    var image = new definition.ImageSource();
    return image.loadFromData(data) ? image : null;
}

export function fromBase64(source: string): definition.ImageSource {
    var image = new definition.ImageSource();
    return image.loadFromBase64(source) ? image : null;
}

export function fromNativeSource(source: any): definition.ImageSource {
    var image = new definition.ImageSource();
    return image.setNativeSource(source) ? image : null;
}

export function fromUrl(url: string): Promise<definition.ImageSource> {
    ensureHttp();
    return http.getImage(url);
}

export function fromFileOrResource(path: string): definition.ImageSource {
    if (!isFileOrResourcePath(path)) {
        throw new Error("Path \"" + "\" is not a valid file or resource.");
    }

    if (path.indexOf(utils.RESOURCE_PREFIX) === 0) {
        return fromResource(path.substr(utils.RESOURCE_PREFIX.length));
    }
    return fromFile(path);
}

export function isFileOrResourcePath(path: string): boolean {
    return utils.isFileOrResourcePath(path);
}