import TKUnit = require("./TKUnit");
import timer = require("timer");

// <snippet module="timer" title="timer">
// # Timer module
// ### How to require timer module
// ``` JavaScript
// require("globals");
//// OR
// var timer = require("timer");
// ```
// </snippet>

export function test_setTimeout_isDefined() {
    TKUnit.assert(typeof (timer.setTimeout) !== "undefined", "Method timer.setTimeout() should be defined!");
};

export function test_clearTimeout_isDefined() {
    TKUnit.assert(typeof (timer.clearTimeout) !== "undefined", "Method timer.clearTimeout() should be defined!");
};

export function test_setInterval_isDefined() {
    TKUnit.assert(typeof (timer.setInterval) !== "undefined", "Method timer.setInterval() should be defined!");
};

export function test_clearInterval_isDefined() {
    TKUnit.assert(typeof (timer.clearInterval) !== "undefined", "Method timer.clearInterval() should be defined!");
};

export function test_setTimeout() {
    let completed: boolean;

    // <snippet module="timer" title="timer">
    // ### Evaluates an expression after 0 milliseconds.
    // ``` JavaScript
    timer.setTimeout(() => {
        // <hide>
        completed = true;
        // </hide>
    });
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => completed, 0.5);
    TKUnit.assert(completed, "Callback should be called!");
};

export function test_setTimeout_callbackCalledAfterSpecifiedTime() {
    let completed = false;

    // <snippet module="timer" title="timer">
    // ### Evaluates an expression after a specified number of milliseconds.
    // ``` JavaScript
    timer.setTimeout(() => {
        // <hide>
        completed = true;
        // </hide>
    }, 10);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => completed, 1);
    TKUnit.assert(completed, "Callback should be called after specified time!");
};

export function test_setTimeout_callbackNotCalled() {
    let completed = false;
    timer.setTimeout(() => completed = true, 50);

    TKUnit.waitUntilReady(() => completed, 0.01);
    TKUnit.assert(!completed, "Callback should be called after specified time!");
};

export function test_setTimeout_shouldReturnNumber() {
    let id = timer.setTimeout(() => {
        //
    });
    TKUnit.assert(typeof id === "number", "Callback should return number!");
};

export function test_setTimeout_callbackShouldBeCleared() {
    let completed = false;

    // <snippet module="timer" title="timer">
    // ### Cancels the evaluation with the clearTimeout method.
    // ``` JavaScript
    let id = timer.setTimeout(() => {
        // <hide>
        completed = true;
        // </hide>
    }, 50);

    //// Clear timeout with specified id.
    timer.clearTimeout(id);

    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => completed, 0.060);
    TKUnit.assert(!completed, "Callback should be cleared when clearTimeout() is executed for specified id!");
};

export function test_setInterval_callbackCalledDuringPeriod() {
    let counter = 0;
    let expected = 4;

    // <snippet module="timer" title="timer">
    // ### Evaluates an expression each time a specified number of milliseconds has elapsed.
    // ``` JavaScript
    timer.setInterval(() => {
        // <hide>
        counter++;
        // </hide>
    }, 100);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => counter >= expected, 0.5);
    TKUnit.assert(counter >= expected, "Callback should be raised at least" + expected + "times! Callback raised " + counter + " times.");
};

export function test_setInterval_callbackShouldBeCleared() {
    let counter = 0;

    // <snippet module="timer" title="timer">
    // ### Cancel the interval previously started using the setInterval method.
    // ``` JavaScript
    let id = timer.setInterval(() => {
        // <hide>
        counter++;
        // </hide>
        timer.clearInterval(id);
    }, 100);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => false, 0.5);
    TKUnit.assert(counter === 1, "Callback should be raised only once!");
};