import image = require("image-source/image-source");
import promises = require("promises/promises");
import http = require("http/http");

/**
  * Gets string from url.
  */

export function getString(arg: any): promises.Promise<string> {
    var d = promises.defer<string>();

    http.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toString()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets JSON from url.
  */
export function getJSON<T>(arg: any): promises.Promise<T> {
    var d = promises.defer<T>();

    http.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toJSON()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets image from url.
  */

export function getImage(arg: any): promises.Promise<image.ImageSource> {
    var d = promises.defer<image.ImageSource>();

    http.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(r => d.resolve(r.content.toImage()))
        .fail(e => d.reject(e));

    return d.promise();
}
