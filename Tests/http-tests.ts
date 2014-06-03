import TKUnit = require("Tests/TKUnit");
import http = require("http");
require("globals");

// <snippet name="http/HOW-TO">
// # Http module
// ``` JavaScript
// var http = require("http");
// ```
// </snippet>

export var test_getString_isDefined = function () {
    TKUnit.assert(typeof (http.getString) !== "undefined", "Method http.getString() should be defined!");
};

export var test_getString = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get string from URL
    // ``` JavaScript
    http.getString("http://httpbin.org/get").then(function (r) {
        //// Argument (r) is string!
        // <hide>
        completed = true;
        result = r;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result) === "string", "Result from getString() should be string!");
};

export var test_getString_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getString({ url: "hgfttp://httpbin.org/get", method: "GET", timeout: 2000 }).fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getString().fail() should be Error! Current type is " + typeof result);
};

export var test_getJSON_isDefined = function () {
    TKUnit.assert(typeof (http.getJSON) !== "undefined", "Method http.getJSON() should be defined!");
};

export var test_getJSON = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get JSON from URL
    // ``` JavaScript
    http.getJSON("http://httpbin.org/get").then(function (r) {
        //// Argument (r) is JSON!
        // <hide>
        completed = true;
        result = r;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from getJSON() should be valid JSON object!");
};

export var test_getJSON_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getJSON({ url: "hgfttp://httpbin.org/get", method: "GET", timeout: 2000 }).fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getJSON().fail() should be Error! Current type is " + typeof result);
};

export var test_getImage_isDefined = function () {
    TKUnit.assert(typeof (http.getImage) !== "undefined", "Method http.getImage() should be defined!");
};

export var test_getImage = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get Image from URL
    // ``` JavaScript
    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function (r) {
        //// Argument (r) is Image!
        // <hide>
        completed = true;
        result = r;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof require("image-source").ImageSource, "Result from getImage() should be valid ImageSource object!");
};

export var test_getImage_fail = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getImage({ url: "hgfttp://www.google.com/images/errors/logo_sm_2.png", method: "GET", timeout: 2000 }).fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from getImage().fail() should be Error! Current type is " + typeof result);
};

export var test_request_isDefined = function () {
    TKUnit.assert(typeof (http["request"]) !== "undefined", "Method http.request() should be defined!");
};

export var test_request_shouldFailIfOptionsUrlIsNotDefined = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({ url: undefined, method: undefined }).fail(function (e) {
        completed = true;
        result = e;
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof Error, "Result from request().fail() should be Error! Current type is " + typeof result);
};

export var test_request_responseStatusCodeShouldBeDefined = function () {
    var result: http.HttpResponse;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get response status code
    // ``` JavaScript
    http.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        var statusCode = response.statusCode;
        // <hide>
        completed = true;
        result = response;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result.statusCode) !== "undefined", "response.statusCode should be defined!");
};

export var test_request_responseHeadersShouldBeDefined = function () {
    var result: http.HttpResponse;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get response headers
    // ``` JavaScript
    http.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        for (var header in response.headers) {
            console.log(header + ":" + response.headers[header]);
        }
        // <hide>
        completed = true;
        result = response;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result.headers) !== "undefined", "response.headers should be defined!");
};

export var test_request_responseContentShouldBeDefined = function () {
    var result: http.HttpResponse;
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="http/HOW-TO">
    // ### Get response content
    // ``` JavaScript
    http.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        //// Content property of the response is HttpContent!
        var str = response.content.toString();
        var obj = response.content.toJSON();
        var img = response.content.toImage();
        // <hide>
        completed = true;
        result = response;
        // </hide>
    }).fail(function (e) {
            //// Argument (e) is Error!
            console.log(e);
        });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result.content) !== "undefined", "response.content should be defined!");
};

export var test_request_responseContentToStringShouldReturnString = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        completed = true;
        result = response.content.toString();
    }).fail(function (e) {
            console.log(e);
    });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (result) === "string", "Result from toString() should be string!");
}; 

export var test_request_responseContentToJSONShouldReturnJSON = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({ url: "http://httpbin.org/get", method: "GET" }).then(function (response) {
        completed = true;
        result = response.content.toJSON();
    }).fail(function (e) {
            console.log(e);
        });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from toJSON() should be valid JSON object!");
}; 

export var test_request_responseContentToImageShouldReturnImage = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({ url: "http://www.google.com/images/errors/logo_sm_2.png", method: "GET" }).then(function (response) {
        completed = true;
        result = response.content.toImage();
    }).fail(function (e) {
            console.log(e);
        });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result instanceof require("image-source").ImageSource, "Result from toImage() should be valid ImageSource object!");
}; 

export var test_request_headersSentAndReceivedProperly = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({
        url: "http://httpbin.org/get", method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (response) {
        completed = true; 
        result = response.headers;
    }).fail(function (e) {
            console.log(e);
        });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result["Content-Type"] === "application/json", "Headers not sent/received properly!");
}; 

export var test_request_contentSentAndReceivedProperly = function () {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.request({
        url: "http://httpbin.org/post", method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        content: "MyVariableOne=ValueOne&MyVariableTwo=ValueTwo"
    }).then(function (response) {
            completed = true;
            result = response.content.toJSON();
        }).fail(function (e) {
            console.log(e);
        });

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(result["form"]["MyVariableOne"] === "ValueOne" && result["form"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
}; 