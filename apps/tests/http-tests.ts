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
            done(e)
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
            done(e);
        });
    // ```
    // </snippet>
};

export var test_getJSON_fail = function (done) {
    var result;

    http.getJSON({ url: "hgfttp://httpbin.org/get", method: "GET", timeout: 2000 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getJSON().fail() should be Error! Current type is " + typeof result);
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
    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function (r) {
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
            done(e);
        });
    // ```
    // </snippet>
};

export var test_getImage_fail = function (done) {
    var result;

    http.getImage({ url: "hgfttp://www.google.com/images/errors/logo_sm_2.png", method: "GET", timeout: 2000 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from getImage().fail() should be Error! Current type is " + typeof result);
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
            TKUnit.assert(result instanceof Error, "Result from request().fail() should be Error! Current type is " + typeof result);
            done(null);
        }
        catch (err) {
            done(err);
        }
    });
};

export var test_request_requestShouldTimeout = function (done) {
    var result;
    http.request({ url: "http://10.255.255.1", method: "GET", timeout: 500 }).catch(function (e) {
        result = e;
        try {
            TKUnit.assert(result instanceof Error, "Result from request().fail() should be Error! Current type is " + typeof result);
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
            done(e);
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
            done(e);
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
            done(e);
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

    http.request({ url: "http://www.google.com/images/errors/logo_sm_2.png", method: "GET" }).then(function (response) {
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
        url: "https://httpbin.org/get", method: "GET",
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
        url: "https://httpbin.org/post", method: "POST",
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

export var test_request_NonStringHeadersSentAndReceivedProperly = function (done) {
    var result;

    var postData = "MyVariableOne=ValueOne&MyVariableTwo=ValueTwo";

    http.request({
        url: "https://httpbin.org/post", method: "POST",
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
        url: "https://httpbin.org/post", method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" })
    }).then(function (response) {
            // result = response.content.toJSON();
            // <hide>
            result = response.content.toJSON();
            try
            {
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

export var test_getString_FromVariousUrls_ShouldWorkProperly = function (done) {
    var urls = [
        "http://api.openweathermap.org/data/2.5/find?q=London,uk",
        "http://www.telerik.com",
        "https://spreadsheets.google.com/tq?key=1tJ64Y8hje0ui4ap9U33h3KWwpxT_-JuVMSZzxD2Er8k"
    ];

    var i: number;
    for (i = 0; i < urls.length; i++) {
        doRequest(urls[i], done);
    }
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
}

export var test_XMLHttpRequest_isDefined = function () {
    TKUnit.assert(types.isDefined(global["XMLHttpRequest"]), "XMLHttpRequest should be defined!");
};

var xhr = new XMLHttpRequest();

export var test_XMLHttpRequest_open_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.open), "XMLHttpRequest.open should be defined!");
};

export var test_XMLHttpRequest_send_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.send), "XMLHttpRequest.send should be defined!");
};

export var test_XMLHttpRequest_setRequestHeader_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.setRequestHeader), "XMLHttpRequest.setRequestHeader should be defined!");
};

export var test_XMLHttpRequest_getAllResponseHeaders_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.getAllResponseHeaders), "XMLHttpRequest.getAllResponseHeaders should be defined!");
};

export var test_XMLHttpRequest_getResponseHeader_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.getResponseHeader), "XMLHttpRequest.getResponseHeader should be defined!");
};

export var test_XMLHttpRequest_overrideMimeType_isDefined = function () {
    TKUnit.assert(types.isFunction(xhr.overrideMimeType), "XMLHttpRequest.overrideMimeType should be defined!");
};

export var test_XMLHttpRequest_readyState_isDefined = function () {
    TKUnit.assert(types.isDefined(xhr.readyState), "XMLHttpRequest.readyState should be defined!");
};

export var test_XMLHttpRequest_responseText_isDefined = function () {
    TKUnit.assert(types.isDefined(xhr.responseText), "XMLHttpRequest.responseText should be defined!");
};

export var test_XMLHttpRequest_readyStateShouldChange = function (done) {
    var count = 0;
    xhr = new XMLHttpRequest();

    TKUnit.assert(xhr.readyState === 0, "xhr.readyState should be UNSENT!");

    xhr.onreadystatechange = function () {
        try {

            if (count === 0) {
                TKUnit.assert(xhr.readyState === 1, "xhr.readyState should be OPEN!");
            } else if (count === 1) {
                TKUnit.assert(xhr.readyState === 2, "xhr.readyState should be HEADERS_RECEIVED!");
            } else if (count === 2) {
                TKUnit.assert(xhr.readyState === 3, "xhr.readyState should be LOADING!");
            } else if (count === 3) {
                TKUnit.assert(xhr.readyState === 4, "xhr.readyState should be DONE!");
            }

            count++;

            done(null);
        }
        catch (err) {
            done(err);
        }
    };

    xhr.open("GET", "https://httpbin.org/get");
    xhr.send();
};

export var test_XMLHttpRequest_headersSentAndReceivedProperly = function (done) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", "https://httpbin.org/get");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 1) {
            try {
                TKUnit.assert(xhr.getResponseHeader("Content-Type") === "application/json", "Headers not sent/received properly!");
                done(null);
            }
            catch (err) {
                done(err);
            }
        }
    };
    xhr.send();
};

export var test_XMLHttpRequest_contentSentAndReceivedProperly = function (done) {
    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://httpbin.org/post");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3) {
            var result = JSON.parse(xhr.responseText);
            try {
                TKUnit.assert(result["json"]["MyVariableOne"] === "ValueOne" && result["json"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
                done(null);
            }
            catch (err) {
                done(err);
            }
        }
    };
    xhr.send(JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" }));
};

export var test_XMLHttpRequest_abortShouldCancelonreadystatechange = function (done) {
    var flag = false;

    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://httpbin.org/post");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        flag = true;
    };
    xhr.send(JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" }));
    xhr.abort();

    TKUnit.assert(flag === false, "Content not sent/received properly!");
    done(null);
};

export var test_XMLHttpRequest_requestShouldBePossibleAfterAbort = function (done) {
    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://httpbin.org/post");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3) {
            var result = JSON.parse(xhr.responseText);
            try {
                TKUnit.assert(result["json"]["MyVariableOne"] === "ValueOne" && result["json"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly!");
                done(null);
            }
            catch (err) {
                done(err);
            }
        }
    };
    xhr.send(JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" }));
    xhr.abort();

    xhr.send(JSON.stringify({ MyVariableOne: "ValueOne", MyVariableTwo: "ValueTwo" }));
};
