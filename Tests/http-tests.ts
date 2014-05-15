import TKUnit = require("Tests/TKUnit");
import http = require("http/http");
import http_request = require("http/http-request");
require("globals");

export var test_getString_isDefined = function () {
    TKUnit.assert(typeof (http.getString) !== "undefined", "Method http.getString() should be defined!");
};

export var test_getString = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getString("http://httpbin.org/get").then(function (r) {
        completed = true;
        result = r;
    }).fail(function (e) { console.log(e); });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result) === "string", "Result from getString() should be string!");
};

export var test_getString_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getString("hgfttp://httpbin.org/get").fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getString().fail() should be Error!");
};

export var test_getJSON_isDefined = function () {
    TKUnit.assert(typeof (http.getJSON) !== "undefined", "Method http.getJSON() should be defined!");
};

export var test_getJSON = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getJSON("http://httpbin.org/get").then(function (r) {
        completed = true;
        result = r;
    }).fail(function (e) { console.log(e); });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from getJSON() should be valid JSON object!");
};

export var test_getJSON_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getJSON("hgfttp://httpbin.org/get").fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getJSON().fail() should be Error!");
};

export var test_getImage_isDefined = function () {
    TKUnit.assert(typeof (http.getImage) !== "undefined", "Method http.getImage() should be defined!");
};

export var test_getImage = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function (r) {
        completed = true;
        result = r;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof require("image").Image, "Result from getImage() should be valid Image object!");
};

export var test_getImage_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getImage("htadvtp://www.google.com/images/errors/logo_sm_2.pngm").fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getImage().fail() should be Error!");
};

export var test_request_isDefined = function () {
    TKUnit.assert(typeof (http["request"]) !== "undefined", "Method http.request() should be defined!");
};

export var test_request_shouldFailIfOptionsUrlIsNotDefined = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http_request.request({ url: undefined, method: undefined }).fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from request().fail() should be Error!");
};

export var test_request_responseStatusCodeShouldBeDefined = function () {
    var result : http_request.HttpResponse;
    var completed: boolean;
    var isReady = function () { return completed; }

    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        completed = true;
        result = response;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result.statusCode) !== "undefined", "response.statusCode should be defined!");
};

export var test_request_responseHeadersCodeShouldBeDefined = function () {
    var result: http_request.HttpResponse;
    var completed: boolean;
    var isReady = function () { return completed; }

    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        completed = true;
        result = response;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result.headers) !== "undefined", "response.headers should be defined!");
};

export var test_request_responseContentShouldBeDefined = function () {
    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        TKUnit.assert(typeof (response.content) !== "undefined", "response.content should be defined!");
    });
}; 