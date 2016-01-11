/* tslint:disable:no-unused-variable */
import TKUnit = require("./TKUnit");
import http = require("http");
import types = require("utils/types");
require("globals");

// <snippet module="http" title="http">
// # Http module
// Using http methods requires to load "http" module.
// ``` JavaScript
// var http = require("http");
// ```
// </snippet>

export var test_getString_isDefined = function () {
    TKUnit.assert(typeof (http.getString) !== "undefined", "Method http.getString() should be defined!");
};

export var test_getString = function (done: (err: Error, res?: string) => void) {
    var result;

    // <snippet module="http" title="http">
    // ### Get string from URL
    // ``` JavaScript
    http.getString("https://httpbin.org/get").then(function (r) {
        //// Argument (r) is string!
        // <hide>
        result = r;
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

export var test_getString_fail = function (done) {
    var result;
    var completed: boolean;
    var isReady = function () { return completed; }

    http.getString({ url: "hgfttp://httpbin.org/get", method: "GET", timeout: 2000 }).catch(function (e) {
        completed = true;
        result = e;
        done(null)
    });
};

export var test_getString_fail_when_result_is_not_string = function (done) {
    var result;

    http.getString({ url: "https://httpbin.org/image/png", method: "GET" }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getString().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_getJSON_isDefined = function () {
    TKUnit.assert(typeof (http.getJSON) !== "undefined", "Method http.getJSON() should be defined!");
};

export var test_getJSON = function (done) {
    var result;

    // <snippet module="http" title="http">
    // ### Get JSON from URL
    // ``` JavaScript
    http.getJSON("https://httpbin.org/get").then(function (r) {
        //// Argument (r) is JSON!
        // <hide>
        //completed = true;
        result = r;
        try {
            TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from getJSON() should be valid JSON object!");
            done(null);
        }
        catch (e) {
            done(e);
        }
        done(null);
        // </hide>
    }, function (e) {
        //// Argument (e) is Error!
        //console.log(e);
        // <hide>
        done(e);
        // </hide>
    });
    // ```
    // </snippet>
};

export var test_getJSON_fail = function (done) {
    var result;

    http.getJSON({ url: "hgfttp://httpbin.org/get", method: "GET", timeout: 2000 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getJSON().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_getJSON_fail_when_result_is_not_JSON = function (done) {
    var result;

    http.getJSON({ url: "https://httpbin.org/html", method: "GET" }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getJSON().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_getJSONP = function (done) {
    var result;

    http.getJSON("https://jsfiddle.net/echo/jsonp/").then(function (r) {
        result = r;
        try {
            TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from getJSON() should be valid JSON object!");
            done(null);
        }
        catch (e) {
            done(e);
        }
        done(null);
    }, function (e) {
        done(e);
    });
};

export var test_getJSON_fail_when_result_is_not_JSONP = function (done) {
    var result;

    http.getJSON({ url: "https://httpbin.org/html", method: "GET" }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getJSON().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_getImage_isDefined = function () {
    TKUnit.assert(typeof (http.getImage) !== "undefined", "Method http.getImage() should be defined!");
};

export var test_getImage = function (done) {
    var result;

    // <snippet module="http" title="http">
    // ### Get Image from URL
    // ``` JavaScript
    http.getImage("https://httpbin.org/image/png").then(function (r) {
        //// Argument (r) is Image!
        // <hide>
        result = r;
        try {
            TKUnit.assert(result instanceof require("image-source").ImageSource, "Result from getImage() should be valid ImageSource object!");
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

export var test_getImage_fail = function (done) {
    var result;

    http.getImage({ url: "hgfttp://www.google.com/images/errors/logo_sm_2.png", method: "GET", timeout: 2000 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getImage().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_getImage_fail_when_result_is_not_image = function (done) {
    var result;

    http.getImage({ url: "https://httpbin.org/html", method: "GET" }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getImage().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_request_isDefined = function () {
    TKUnit.assert(typeof (http["request"]) !== "undefined", "Method http.request() should be defined!");
};

export var test_request_shouldFailIfOptionsUrlIsNotDefined = function (done) {
    var result;

    http.request({ url: undefined, method: undefined }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from request().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_request_requestShouldTimeout = function (done) {
    var result;
    http.request({ url: "https://10.255.255.1", method: "GET", timeout: 500 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from request().catch() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_request_responseStatusCodeShouldBeDefined = function (done) {
    var result: http.HttpResponse;

    // <snippet module="http" title="http">
    // ### Get response status code
    // ``` JavaScript
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        var statusCode = response.statusCode;
        // <hide>
        result = response;
        try {
            TKUnit.assert(typeof (result.statusCode) !== "undefined", "response.statusCode should be defined!");
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

export var test_request_responseHeadersShouldBeDefined = function (done) {
    var result: http.HttpResponse;

    // <snippet module="http" title="http">
    // ### Get response headers
    // ``` JavaScript
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        //for (var header in response.headers) {
        //    console.log(header + ":" + response.headers[header]);
        //}
        // <hide>
        result = response;
        try {
            TKUnit.assert(typeof (result.headers) !== "undefined", "response.headers should be defined!");
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

export var test_request_responseContentShouldBeDefined = function (done) {
    var result: http.HttpResponse;

    // <snippet module="http" title="http">
    // ### Get response content
    // ``` JavaScript
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        //// Content property of the response is HttpContent!
        var str = response.content.toString();
        var obj = response.content.toJSON();
        var img = response.content.toImage();
        // <hide>
        result = response;
        try {
            TKUnit.assert(typeof (result.content) !== "undefined", "response.content should be defined!");
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

export var test_request_responseContentToStringShouldReturnString = function (done) {
    var result;

    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        result = response.content.toString();
        try {
            TKUnit.assert(typeof (result) === "string", "Result from toString() should be string!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_responseContentToJSONShouldReturnJSON = function (done) {
    var result;

    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        result = response.content.toJSON();
        try {
            TKUnit.assert(typeof (JSON.stringify(result)) === "string", "Result from toJSON() should be valid JSON object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_responseContentToImageShouldReturnCorrectImage = function (done) {
    var result;

    http.request({ url: "https://httpbin.org/image/png", method: "GET" }).then(function (response) {
        response.content.toImage().then((source) => {
            result = source;
            try {
                TKUnit.assert(result instanceof require("image-source").ImageSource, "Result from toImage() should be valid promise of ImageSource object!");
                done(null);
            }
            catch (err) {
                done(err);
            }
        });
    }, function (e) {
        done(e);
    });
};

export var test_request_headersSentAndReceivedProperly = function (done) {
    var result;

    http.request({
        url: "https://httpbin.org/get",
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (response) {
        result = response.headers;
        try {
            TKUnit.assert(result["Content-Type"] === "application/json", "Headers not sent/received properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_contentSentAndReceivedProperly = function (done) {
    var result;

    http.request({
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        content: "MyVariableOne=ValueOne&MyVariableTwo=ValueTwo"
    }).then(function (response) {
        result = response.content.toJSON();
        try {
            TKUnit.assert(result["form"]["MyVariableOne"] === "ValueOne" && result["form"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_FormDataContentSentAndReceivedProperly = function (done) {
    var result;

    var data = new FormData();
    data.append("MyVariableOne", "ValueOne");
    data.append("MyVariableTwo", "ValueTwo");

    http.request({
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        content: data
    }).then(function (response) {
        result = response.content.toJSON();
        try {
            TKUnit.assert(result["form"]["MyVariableOne"] === "ValueOne" && result["form"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_NonStringHeadersSentAndReceivedProperly = function (done) {
    var result;

    var postData = "MyVariableOne=ValueOne&MyVariableTwo=ValueTwo";

    http.request({
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": postData.length },
        content: postData
    }).then(function (response) {
        result = response.content.toJSON();
        try {
            TKUnit.assert(result["form"]["MyVariableOne"] === "ValueOne" && result["form"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_jsonAsContentSentAndReceivedProperly = function (done) {
    // <snippet module="http" title="http">
    // ### Post JSON
    // ``` JavaScript
    var result;

    http.request({
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" })
    }).then(function (response) {
        // result = response.content.toJSON();
        // <hide>
        result = response.content.toJSON();
        try {
            TKUnit.assert(result["json"]["MyVariableOne"] === "ValueOne" && result["json"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
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

export var test_getString_1 = function (done) {
    doRequest("https://it-ebooks-api.info/v1/book/1615005640", done);
};

export var test_getString_2 = function (done) {
    doRequest("https://www.telerik.com", done);
};

export var test_getString_3 = function (done) {
    doRequest("https://spreadsheets.google.com/tq?key=1tJ64Y8hje0ui4ap9U33h3KWwpxT_-JuVMSZzxD2Er8k", done);
};

export var test_getString_4 = function (done) {
    doRequest("https://chase.arborgoldcloud.net/mobilehandler/mobiledatahandler.ashx?ProcedureName=MEstimGetJobListSpeed&@prmSalesRep=%&@prmStartDate=11/1/2015&@prmEndDate=12/8/2015&@prmStatusFilter=2", done);
};

function doRequest(url: string, done: Function) {
    http.request({ url: url, method: "GET" }).then(function (response) {
        try {
            TKUnit.assert(response.statusCode === 200, "Requesting " + url + " should work properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};