import image_module = require("Image/image");
import promises = require("promises/promises");
import http = require("net/http_client");

/**
  * Gets string from url.
  */
export function getString(url: string): promises.Promise<string> {
    var d = promises.defer<string>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.body.toString()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets JSON from url.
  */
export function getJSON<T>(url: string): promises.Promise<T> {
    var d = promises.defer<T>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.body.toJSON()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets image from url.
  */
export function getImage(url: string): promises.Promise<image_module.Image> {
    var d = promises.defer<image_module.Image>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.body.toImage()))
        .fail(e => d.reject(e));

    return d.promise();
}
