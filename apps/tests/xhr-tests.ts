/* tslint:disable:no-unused-variable */
import TKUnit = require("./TKUnit");
import types = require("utils/types");

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
    TKUnit.assert(types.isNumber(xhr.readyState), "XMLHttpRequest.readyState should be defined!");
};

export var test_XMLHttpRequest_responseText_isDefined = function () {
    TKUnit.assert(types.isString(xhr.responseText), "XMLHttpRequest.responseText should be defined!");
};

export var test_XMLHttpRequest_responseType_isDefined = function () {
    TKUnit.assert(types.isString(xhr.responseType), "XMLHttpRequest.responseType should be defined!");
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

export var test_XMLHttpRequest_FormDataContentSentAndReceivedProperly = function (done) {
    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://httpbin.org/post");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3) {
            var result = JSON.parse(xhr.responseText);
            try {
                TKUnit.assert(result["form"]["MyVariableOne"] === "ValueOne" && result["form"]["MyVariableTwo"] === "ValueTwo", "Content not sent/received properly! Result is: " + xhr.responseText);
                done(null);
            }
            catch (err) {
                done(err);
            }
        }
    };

    var data = new FormData();
    data.append("MyVariableOne", "ValueOne");
    data.append("MyVariableTwo", "ValueTwo");

    xhr.send(data);
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

export function test_raises_onload_Event(done) {
    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        done(null);
    }
    xhr.open("GET", "https://httpbin.org/get");
    xhr.send();
}

export function test_raises_onerror_Event(done) {
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        done(null);
    }
    xhr.open("GET", "https://no-such-domain-httpbin.org");
    xhr.send();
}

export function test_responseType(done) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = "";
    xhr.responseType = "text";
    xhr.responseType = "json";

    TKUnit.assertThrows(
        () => xhr.responseType = "arraybuffer",
        "Didn't raise on unsupported type.",
        "Response type of 'arraybuffer' not supported."
    );
    done(null);
}
