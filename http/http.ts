import image = require("image-source");
import httpRequest = require("http/http-request");

global.moduleMerge(httpRequest, exports);

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