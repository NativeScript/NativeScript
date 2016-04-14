import TKUnit = require("./TKUnit");
import platform = require("platform");
var timer = require("timer/timer");

// >> timer-require
// require("globals");
//// OR
// var timer = require("timer");
// << timer-require

export var test_setTimeout_isDefined = function () {
    TKUnit.assert(typeof (timer.setTimeout) !== "undefined", "Method timer.setTimeout() should be defined!");
};

export var test_clearTimeout_isDefined = function () {
    TKUnit.assert(typeof (timer.clearTimeout) !== "undefined", "Method timer.clearTimeout() should be defined!");
};

export var test_setInterval_isDefined = function () {
    TKUnit.assert(typeof (timer.setInterval) !== "undefined", "Method timer.setInterval() should be defined!");
};

export var test_clearInterval_isDefined = function () {
    TKUnit.assert(typeof (timer.clearInterval) !== "undefined", "Method timer.clearInterval() should be defined!");
};

export var test_setTimeout = function () {
    var completed: boolean;
    var isReady = function () { return completed; }

    // >> timer-set-zero
    timer.setTimeout(function () {
        // >> (hide)
        completed = true;
        // << (hide)
    });
    // << timer-set-zero

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(completed, "Callback should be called!");
};

export var test_setTimeout_callbackCalledAfterSpecifiedTime = function () {
    var completed: boolean;
    var isReady = function () { return completed; }

    // >> timer-set-fivehundred
    timer.setTimeout(function () {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 500);
    // << timer-set-fivehundred

    TKUnit.waitUntilReady(isReady, 1);
    TKUnit.assert(completed, "Callback should be called after specified time!");
};

export var test_setTimeout_callbackNotCalled = function () {
    var completed: boolean;
    var isReady = function () { return completed; }

    timer.setTimeout(function () {
        completed = true;
    }, 1000);

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(!completed, "Callback should be called after specified time!");
};

export var test_setTimeout_shouldReturnNumber = function () {
    var id = timer.setTimeout(function () {
        //
    });
    TKUnit.assert(typeof id === "number", "Callback should return number!");
};

export var test_setTimeout_callbackShouldBeCleared = function () {
    // This test is very unstable in iOS, because the platform does not guarantee the 
    // callback will be cleared on time. Better skip it for iOS.
    if (platform.device.os === platform.platformNames.ios) {
        return;
    }

    var completed: boolean;
    var isReady = function () { return completed; }

    // >> timer-set-twothousands
    var id = timer.setTimeout(function () {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 2000);

    //// Clear timeout with specified id.
    timer.clearTimeout(id);

    // << timer-set-twothousands

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(!completed, "Callback should be cleared when clearTimeout() is executed for specified id!");
};

export var test_setInterval_callbackCalledDuringPeriod = function () {
    var counter = 0;
    var expected = 4;
    var isReady = function () { return counter >= expected; }

    // >> timer-set-expression
    timer.setInterval(function () {
        // >> (hide)
        counter++;
        // << (hide)
    }, 100);
    // << timer-set-expression

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(isReady(), "Callback should be raised at least" + expected + "times! Callback raised " + counter + " times.");
};

export var test_setInterval_callbackShouldBeCleared = function () {
    var counter = 0;
    var isReady = function () { return false; }

    // >> timer-set-interval
    var id = timer.setInterval(function () {
        // >> (hide)
        counter++;
        // << (hide)
        timer.clearInterval(id);
    }, 100);
    // << timer-set-interval

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(counter === 1, "Callback should be raised only once!");
};