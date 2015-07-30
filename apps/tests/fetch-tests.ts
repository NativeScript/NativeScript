/* tslint:disable:no-unused-variable */
import TKUnit = require("./TKUnit");
import types = require("utils/types");

export var test_fetch_defined = function () {
    TKUnit.assert(types.isDefined((fetch)), "Method fetch() should be defined!");
};

export var test_fetch = function (done: (err: Error, res?: string) => void) {
    var result;
    // <snippet module="fetch" title="fetch">
    // ### Get Response from URL
    // ``` JavaScript
    fetch("https://httpbin.org/get").then(function (r) {
        //// Argument (r) is Response!
        // <hide>
        TKUnit.assert(r instanceof Response, "Result from fetch() should be valid Response object! Actual result is: " + result);
        done(null);
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_text = function (done: (err: Error, res?: string) => void) {
    var result;

    // <snippet module="fetch" title="fetch">
    // ### Get string from URL
    // ``` JavaScript
    fetch("https://httpbin.org/get").then(response => { return response.text(); }).then(function (r) {
        //// Argument (r) is string!
        // <hide>
        TKUnit.assert(types.isString(r), "Result from text() should be string! Actual result is: " + r);
        done(null);
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_json = function (done: (err: Error, res?: string) => void) {
    var result;

    // <snippet module="fetch" title="fetch">
    // ### Get JSON from URL
    // ``` JavaScript
    fetch("https://httpbin.org/get").then(response => { return response.json(); }).then(function (r) {
        //// Argument (r) is JSON object!
        // <hide>
        TKUnit.assert(types.isString(JSON.stringify(r)), "Result from json() should be JSON object! Actual result is: " + r);
        done(null);
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_formData = function (done: (err: Error, res?: string) => void) {
    var result;

    // <snippet module="fetch" title="fetch">
    // ### Get FormData from URL
    // ``` JavaScript
    fetch("https://httpbin.org/get").then(response => { return response.formData(); }).then(function (r) {
        //// Argument (r) is FormData object!
        // <hide>
        TKUnit.assert(r instanceof FormData, "Result from formData() should be FormData object! Actual result is: " + r);
        done(null);
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_fail_invalid_url = function (done) {
    var completed: boolean;
    var isReady = function () { return completed; }

    fetch("hgfttp://httpbin.org/get").catch(function (e) {
        completed = true;
        done(null)
    });
};

export var test_fetch_response_status = function (done) {

    // <snippet module="fetch" title="fetch">
    // ### Get Response status
    // ``` fetch
    fetch("https://httpbin.org/get").then(function (response) {
        //// Argument (response) is Response!
        var statusCode = response.status;
        // <hide>
        try {
            TKUnit.assert(types.isDefined(statusCode), "response.status should be defined! Actual result is: " + statusCode);
            done(null);
        }
        catch (err) {
            done(err);
        }
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_response_headers = function (done) {

    // <snippet module="fetch" title="fetch">
    // ### Get response headers
    // ``` JavaScript
    fetch("https://httpbin.org/get").then(function (response) {
        //// Argument (response) is Response!
        // var all = response.headers.getAll();
        // <hide>
        try {
            TKUnit.assert(types.isDefined(response.headers), "response.headers should be defined! Actual result is: " + response.headers);
            done(null);
        }
        catch (err) {
            done(err);
        }
        // </hide>
    }, function (e) {
            //// Argument (e) is Error!
            // <hide>
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
};

export var test_fetch_headers_sent = function (done) {
    var result: Headers;

    fetch("https://httpbin.org/get", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (response) {
        result = response.headers;
        try {
            TKUnit.assert(result.get("Content-Type") === "application/json", "Headers not sent/received properly! Actual result is: " + result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
            done(e);
        });
};

export var test_fetch_post_form_data = function (done) {
    var data = new FormData();
    data.append("MyVariableOne", "ValueOne");
    data.append("MyVariableTwo", "ValueTwo");

    fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
    }).then(r => {
        return r.formData();
    }).then(function (r) {
        try {
            TKUnit.assert(r instanceof FormData, "Content not sent/received properly! Actual result is: " + r);
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
            done(e);
        });
};

export var test_fetch_post_json = function (done) {
    // <snippet module="fetch" title="fetch">
    // ### Post JSON
    // ``` JavaScript
    fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" })
    }).then(r => { return r.json(); }).then(function (r) {
        // <hide>
        try {
            TKUnit.assert(r.json["MyVariableOne"] === "ValueOne" && r.json["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly! Actual result is: " + r.json);
            done(null);
        }
        catch (err) {
            done(err);
        }
        // </hide>
        // console.log(result);
    }, function (e) {
            // <hide>
            done(e);
            // </hide>
            // console.log("Error occurred " + e);
        });
    // ```
    // </snippet>
};