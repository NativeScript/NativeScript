import image_module = require("Image/image");
import promises = require("promises/promises");
import http = require("http/http_request");

// merge request
declare var exports;
require("Utils/module_merge").merge(http, exports);

/**
  * Gets string from url.
  */
export function getString(url: string): promises.Promise<string> {
    var d = promises.defer<string>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.content.toString()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets JSON from url.
  */
export function getJSON<T>(url: string): promises.Promise<T> {
    var d = promises.defer<T>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.content.toJSON()))
        .fail(e => d.reject(e));

    return d.promise();
}

/**
  * Gets image from url.
  */
export function getImage(url: string): promises.Promise<image_module.Image> {
    var d = promises.defer<image_module.Image>();

    http.request({ url: url, method: "GET" })
        .then(r => d.resolve(r.content.toImage()))
        .fail(e => d.reject(e));

    return d.promise();
}
