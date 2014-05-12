import TKUnit = require("Tests/TKUnit");
import http = require("http/http");
import http_request = require("http/http_request");

export var test_getString_isDefined = function () {
    TKUnit.assert(typeof (http.getString) !== "undefined", "Method http.getString() should be defined!");
};

export var test_getString = function () {
    http.getString("http://httpbin.org/get").then(function (result) {
        TKUnit.assert(typeof (result) === "string", "Result from getString() should be string!");
    });
};

export var test_getString_fail = function () {
    http.getString("hgfttp://httpbin.org/get").fail(function (e) { TKUnit.assert(e instanceof Error, "Result from getString().fail() should be Error!"); });
};

export var test_getJSON_isDefined = function () {
    TKUnit.assert(typeof (http.getJSON) !== "undefined", "Method http.getJSON() should be defined!");
};

export var test_getJSON = function () {
    http.getJSON("http://httpbin.org/get").then(function (result) {
        TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from getJSON() should be valid JSON object!");
    });
};

export var test_getJSON_fail = function () {
    http.getJSON("hgfttp://httpbin.org/get").fail(function (e) { TKUnit.assert(e instanceof Error, "Result from getJSON().fail() should be Error!"); });
};

export var test_getImage_isDefined = function () {
    TKUnit.assert(typeof (http.getImage) !== "undefined", "Method http.getImage() should be defined!");
};

export var test_getImage = function () {
    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function (result) {
        TKUnit.assert(result instanceof require("Image").Image, "Result from getImage() should be valid Image object!");
    });
};

export var test_getImage_fail = function () {
    http.getImage("htadvtp://www.google.com/images/errors/logo_sm_2.png").fail(function (e) {
        TKUnit.assert(e instanceof Error, "Result from getImage().fail() should be Error!");
    });
};

export var test_request_isDefined = function () {
    TKUnit.assert(typeof (http["request"]) !== "undefined", "Method http.request() should be defined!");
};

export var test_request_shouldFailIfOptionsUrlIsNotDefined = function () {
    http_request.request({ url: undefined, method: undefined }).fail(function (e) { TKUnit.assert(e instanceof Error, "Result from request().fail() should be Error!"); });
};

export var test_request_shouldFailIfOptionsMethodIsNotDefined = function () {
    http_request.request({ url: "http://httpbin.org/get", method: undefined }).fail(function (e) { TKUnit.assert(e instanceof Error, "Result from request().fail() should be Error!"); });
};

export var test_request_responseStatusCodeShouldBeDefined = function () {
    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        TKUnit.assert(typeof (response.statusCode) !== "undefined", "response.statusCode should be defined!");
    });
};

export var test_request_responseHeadersCodeShouldBeDefined = function () {
    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        TKUnit.assert(typeof (response.headers) !== "undefined", "response.headers should be defined!");
    });
};

export var test_request_responseContentShouldBeDefined = function () {
    http_request.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        TKUnit.assert(typeof (response.content) !== "undefined", "response.content should be defined!");
    });
}; 