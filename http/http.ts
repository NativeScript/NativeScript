import image = require("image-source");
import httpRequest = require("http/http-request");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(httpRequest, exports);

export function getString(arg: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => resolve(r.content.toString()), e => reject(e));
    });
}

export function getJSON<T>(arg: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => resolve(r.content.toJSON()), e => reject(e));
    });
}

export function getImage(arg: any): Promise<image.ImageSource> {
    return new Promise<image.ImageSource>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => {
            r.content.toImage().then(source => resolve(source));
        }, e => reject(e));
    });
}