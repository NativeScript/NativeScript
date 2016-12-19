import * as TKUnit from "./TKUnit";
import * as timer from "timer";

// >> timer-require
// require("globals");
//// OR
// var timer = require("timer");
// << timer-require

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

    // >> timer-set-zero
    timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    });
    // << timer-set-zero

    TKUnit.waitUntilReady(() => completed, 0.5);
    TKUnit.assert(completed, "Callback should be called!");
};

export function test_setTimeout_callbackCalledAfterSpecifiedTime() {
    let completed = false;

    // >> timer-set-fivehundred
    timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 10);
    // << timer-set-fivehundred

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

    // >> timer-set-twothousands
    let id = timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 50);
    // << timer-set-twothousands

    //// Clear timeout with specified id.
    timer.clearTimeout(id);

    // << timer-set-twothousands

    TKUnit.waitUntilReady(() => completed, 0.060);
    TKUnit.assert(!completed, "Callback should be cleared when clearTimeout() is executed for specified id!");
};

export function test_setInterval_callbackCalledDuringPeriod() {
    let counter = 0;
    let expected = 4;

    // >> timer-set-expression
    timer.setInterval(() => {
        // >> (hide)
        counter++;
        // << (hide)
    }, 100);
    // << timer-set-expression

    TKUnit.waitUntilReady(() => counter >= expected, 0.5);
    TKUnit.assert(counter >= expected, "Callback should be raised at least" + expected + "times! Callback raised " + counter + " times.");
};

export function test_setInterval_callbackShouldBeCleared() {
    let counter = 0;

    // >> timer-set-interval
    let id = timer.setInterval(() => {
        // >> (hide)
        counter++;
        // << (hide)
        timer.clearInterval(id);
    }, 100);
    // << timer-set-interval

    TKUnit.waitUntilReady(() => false, 0.5);
    TKUnit.assert(counter === 1, "Callback should be raised only once!");
};

export function test_clearTimeout_multipleTimes_afterTick() {
    let completed = false;

    let id = timer.setTimeout(() => {
        completed = true;
    });

    TKUnit.waitUntilReady(() => completed, 0.5);
    TKUnit.assert(completed, "Callback should be called");
    
    timer.clearTimeout(id);
    timer.clearTimeout(id);
}

export function test_clearTimeout_immediatelyAfterCreate() {
    let completed = false;

    let id = timer.setTimeout(() => {
        completed = true;
    });
    timer.clearTimeout(id);

    TKUnit.waitUntilReady(() => false, 0.02);
    TKUnit.assert(!completed, "Callback should not be called");
}

export function test_clearInterval_immediatelyAfterCreate() {
    let completed = false;

    let id = timer.setInterval(() => {
        completed = true;
    });
    timer.clearInterval(id);

    TKUnit.waitUntilReady(() => false, 0.02);
    TKUnit.assert(!completed, "Callback should not be called");
}

export function test_clearTimeout_insideCallback() {
    let completed = false;

    let id = timer.setTimeout(() => {
        completed = true;
        timer.clearTimeout(id);
    });

    TKUnit.waitUntilReady(() => completed, 0.5);
    TKUnit.assert(completed, "Callback should be called");
}
