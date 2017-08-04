/* tslint:disable:no-unused-variable */
import * as TKUnit from "../TKUnit";
import * as http from "tns-core-modules/http";
import * as types from "tns-core-modules/utils/types";
import * as fs from "tns-core-modules/file-system";
import { addHeader } from "tns-core-modules/http/http-request";

require("globals");

// >> http-require
// var http = require("http");
// << http-require

export var test_getString_isDefined = function () {
    TKUnit.assert(typeof (http.getString) !== "undefined", "Method http.getString() should be defined!");
};

export var test_getString = function (done: (err: Error, res?: string) => void) {
    var result;

    // >> http-get-string
    http.getString("https://httpbin.org/get").then(function (r) {
        //// Argument (r) is string!
        // >> (hide)
        result = r;
        done(null);
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-string
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

    // >> http-get-json
    http.getJSON("https://httpbin.org/get").then(function (r) {
        //// Argument (r) is JSON!
        // >> (hide)
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
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        //console.log(e);
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-json
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

    // >> http-get-image
    http.getImage("https://httpbin.org/image/png").then(function (r) {
        //// Argument (r) is Image!
        // >> (hide)
        result = r;
        try {
            TKUnit.assert(result instanceof require("image-source").ImageSource, "Result from getImage() should be valid ImageSource object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-image
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

export var test_getFile_isDefined = function () {
    TKUnit.assert(typeof (http.getFile) !== "undefined", "Method http.getFile() should be defined!");
};

export var test_getFile = function (done) {
    var result;

    // >> http-get-urlfile
    http.getFile("https://raw.githubusercontent.com/NativeScript/NativeScript/master/tests/app/logo.png").then(function (r) {
        //// Argument (r) is File!
        // >> (hide)
        result = r;
        try {
            TKUnit.assert(result instanceof fs.File, "Result from getFile() should be valid File object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-urlfile
};

export var test_getContentAsFile = function (done) {
    var result;

    // >> http-get-urlfile-content
    var filePath = fs.path.join(fs.knownFolders.documents().path, "test.png");
    http.getFile("https://httpbin.org/image/png?testQuery=query&anotherParam=param", filePath).then(function (r) {
        //// Argument (r) is File!
        // >> (hide)
        result = r;
        try {
            TKUnit.assert(result instanceof fs.File, "Result from getFile() should be valid File object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-urlfile-content
};

export var test_getFile_fail = function (done) {
    var result;

    http.getImage({ url: "hgfttp://raw.githubusercontent.com/NativeScript/NativeScript/master/tests/app/logo.png", method: "GET", timeout: 2000 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getFile().catch() should be Error! Current type is " + typeof result);
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

    // >> http-get-response
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        var statusCode = response.statusCode;
        // >> (hide)
        result = response;
        try {
            TKUnit.assert(typeof (result.statusCode) !== "undefined", "response.statusCode should be defined!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-response
};

export var test_request_responseHeadersShouldBeDefined = function (done) {
    var result: http.HttpResponse;

    // >> http-get-response-headers
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        //for (var header in response.headers) {
        //    console.log(header + ":" + response.headers[header]);
        //}
        // >> (hide)
        result = response;
        try {
            TKUnit.assert(typeof (result.headers) !== "undefined", "response.headers should be defined!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-response-headers
};

export var test_request_responseContentShouldBeDefined = function (done) {
    var result: http.HttpResponse;

    // >> http-get-response-content
    http.request({ url: "https://httpbin.org/get", method: "GET" }).then(function (response) {
        //// Argument (response) is HttpResponse!
        //// Content property of the response is HttpContent!
        var str = response.content.toString();
        var obj = response.content.toJSON();
        var img = response.content.toImage();
        // >> (hide)
        result = response;
        try {
            TKUnit.assert(typeof (result.content) !== "undefined", "response.content should be defined!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
    }, function (e) {
        //// Argument (e) is Error!
        // >> (hide)
        done(e);
        // << (hide)
    });
    // << http-get-response-content
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

export var test_request_responseContentToFileFromUrlShouldReturnCorrectFile = function (done) {
    var result;

    http.request({ url: "https://raw.githubusercontent.com/NativeScript/NativeScript/master/tests/app/logo.png", method: "GET" }).then(function (response) {
        result = response.content.toFile();
        try {
            TKUnit.assert(result instanceof fs.File, "Result from toFile() should be valid File object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
    }, function (e) {
        done(e);
    });
};

export var test_request_responseContentToFileFromContentShouldReturnCorrectFile = function (done) {
    var result;

    http.request({ url: "https://httpbin.org/image/png?queryString=param&another=anotherParam", method: "GET" }).then(function (response) {
        result = response.content.toFile();
        try {
            TKUnit.assert(result instanceof fs.File, "Result from toFile() should be valid File object!");
            done(null);
        }
        catch (err) {
            done(err);
        }
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

export var test_request_headersWithSameKeyAddedProperly = function (done) {
    var keyName = "key";
    var value1 = "value1";
    var value2 = "value2";

    var headers: http.Headers = {};

    addHeader(headers, keyName, value1);
    addHeader(headers, keyName, value2);

    try {
        TKUnit.assertTrue(Array.isArray(headers[keyName]));
        TKUnit.assertEqual(headers[keyName][0], value1);
        TKUnit.assertEqual(headers[keyName][1], value2);
        done(null);
    }
    catch (err) {
        done(err);
    }
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
    // >> http-post-json
    var result;

    http.request({
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" })
    }).then(function (response) {
        // result = response.content.toJSON();
        // >> (hide)
        result = response.content.toJSON();
        try {
            TKUnit.assert(result["json"]["MyVariableOne"] === "ValueOne" && result["json"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
            done(null);
        }
        catch (err) {
            done(err);
        }
        // << (hide)
        // console.log(result);
    }, function (e) {
        // >> (hide)
        done(e);
        // << (hide)
        // console.log("Error occurred " + e);
    });
    // << http-post-json
};

declare var Worker: any;
export var test_getString_WorksProperlyInWorker = function () {
    var ready;

    var worker = new Worker("./http-string-worker");

    worker.onmessage = function (msg) {
        TKUnit.assert(typeof msg.data === "string", "Result from getString() should be valid string object!");
        ready = true;
    }

    worker.onerror = function (e) {
        ready = true;
        throw e;
    }

    TKUnit.waitUntilReady(() => ready);
}
