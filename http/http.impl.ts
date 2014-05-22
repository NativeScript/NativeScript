import image = require("image-source");
import promises = require("promises");
import request = require("http/http-request");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(request, exports);

export function getString(arg: any): promises.Promise<string> {
    var d = promises.defer<string>();

    request.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toString()))
        .fail(e => d.reject(e));

    return d.promise();
}

export function getJSON<T>(arg: any): promises.Promise<T> {
    var d = promises.defer<T>();

    request.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toJSON()))
        .fail(e => d.reject(e));

    return d.promise();
}

export function getImage(arg: any): promises.Promise<image.ImageSource> {
    var d = promises.defer<image.ImageSource>();

    request.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toImage()))
        .fail(e => d.reject(e));

    return d.promise();
}
