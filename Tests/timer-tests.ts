import TKUnit = require("Tests/TKUnit");
var timer = require("timer/timer");

// <snippet name="timer/HOW-TO">
// # Timer module
// ``` JavaScript
// require("globals");
//// OR
// var timer = require("timer");
// ```
// </snippet>

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

    // <snippet name="timer/HOW-TO">
    // ### Evaluates an expression after 0 milliseconds.
    // ``` JavaScript
    timer.setTimeout(function () {
        // <hide>
        completed = true;
        // </hide>
    });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(completed, "Callback should be called!");
};

export var test_setTimeout_callbackCalledAfterSpecifedTime = function () {
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="timer/HOW-TO">
    // ### Evaluates an expression after a specified number of milliseconds.
    // ``` JavaScript
    timer.setTimeout(function () {
        // <hide>
        completed = true;
        // </hide>
    }, 500);
    // ```
    // </snippet>

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
    var id = timer.setTimeout(function () { });
    TKUnit.assert(typeof id === "number", "Callback should return number!");
};

export var test_setTimeout_callbackShouldBeCleared = function () {
    var completed: boolean;
    var isReady = function () { return completed; }

    // <snippet name="timer/HOW-TO">
    // ### Cancels the evaluation with the clearTimeout method.
    // ``` JavaScript
    var id = timer.setTimeout(function () {
        // <hide>
        completed = true;
        // </hide>
    }, 2000);

    //// Clear timeout with specified id.
    timer.clearTimeout(id);

    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 3);
    TKUnit.assert(!completed, "Callback should be cleared when clearTimeout() is executed for specified id!");
};

export var test_setInterval_callbackCalledDuringPeriod = function () {
    var counter = 0;
    var expected = 4;
    var isReady = function () { return counter >= expected; }

    // <snippet name="timer/HOW-TO">
    // ### Evaluates an expression each time a specified number of milliseconds has elapsed.
    // ``` JavaScript
    timer.setInterval(function () {
        // <hide>
        counter++;
        // </hide>
    }, 100);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(isReady(), "Callback should be raised at least" + expected + "times! Callback raised " + counter + " times.");
};

export var test_setInterval_callbackShouldBeCleared = function () {
    var counter = 0;
    var expected = 1;
    var isReady = function () { return counter == expected; }

    // <snippet name="timer/HOW-TO">
    // ### Cancel the interval previously started using the setInterval method.
    // ``` JavaScript
    var id = timer.setInterval(function () {
        // <hide>
        counter++;
        // </hide>
        timer.clearInterval(id);
    }, 100);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(isReady, 0.5);
    TKUnit.assert(isReady(), "Callback should be raised only once!");
};
