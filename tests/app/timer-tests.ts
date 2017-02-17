import * as TKUnit from "./TKUnit";
import * as timer from "timer";

// >> timer-require
// require("globals");
//// OR
// var timer = require("timer");
// << timer-require

export function test_setTimeout_isDefined() {
    TKUnit.assertNotEqual(timer.setTimeout, undefined, "Method timer.setTimeout() should be defined!");
};

export function test_clearTimeout_isDefined() {
    TKUnit.assertNotEqual(timer.clearTimeout, undefined, "Method timer.clearTimeout() should be defined!");
};

export function test_setInsDefined() {
    TKUnit.assertNotEqual(timer.setInterval, undefined, "Method timer.setInterval() should be defined!");
};

export function test_clear_isDefined() {
    TKUnit.assertNotEqual(timer.clearInterval, undefined, "Method timer.clearInterval() should be defined!");
};

export function test_setTimeout() {
    let completed: boolean;

    // >> timer-set-zero
    const id = timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    });
    // << timer-set-zero

    TKUnit.waitUntilReady(() => completed, 0.5, false);
    timer.clearTimeout(id);
    TKUnit.assert(completed, "Callback should be called!");
};

export function test_setTimeout_callbackCalledAfterSpecifiedTime() {
    let completed = false;

    // >> timer-set-ten
    const id = timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 10);
    // << timer-set-ten

    TKUnit.waitUntilReady(() => completed, 1);
    timer.clearTimeout(id);
    TKUnit.assert(completed, "Callback should be called after the specified time!");
};

export function test_setTimeout_callbackNotCalled() {
    let completed = false;

    const id = timer.setTimeout(() => completed = true, 10);
    timer.clearTimeout(id);
    TKUnit.wait(30 / 1000);

    TKUnit.assert(!completed, "Callback should not be called after the specified time!");
};

export function test_setTimeout_shouldReturnNumber() {
    let id = timer.setTimeout(() => {
        //
    });
    timer.clearTimeout(id);
    TKUnit.assertTrue(typeof id === "number", "Callback should return number!");
};

export function test_setTimeout_callbackShouldBeCleared() {
    let completed = false;

    // >> timer-set-fifty
    const id = timer.setTimeout(() => {
        // >> (hide)
        completed = true;
        // << (hide)
    }, 50);
    // << timer-set-fifty

    //// Clear timeout with specified id.
    timer.clearTimeout(id);

    // << timer-set-twothousands

    TKUnit.wait(0.060);
    timer.clearTimeout(id);
    TKUnit.assert(!completed, "Callback should be cleared when clearTimeout() is executed for specified id!");
};

export function test_setInterval_callbackCalledDuringPeriod() {
    let counter = 0;
    let expected = 4;

    // >> timer-set-expression
    const id = timer.setInterval(() => {
        // >> (hide)
        counter++;
        // << (hide)
    }, 50);
    // << timer-set-expression

    TKUnit.waitUntilReady(() => counter >= expected, 0.25, false);
    timer.clearInterval(id);
    TKUnit.assert(counter >= expected, "Callback should be raised at least" + expected + "times! Callback raised " + counter + " times.");
};

export function test_setInterval_callbackShouldBeCleared() {
    let counter = 0;

    // >> timer-set-interval
    const id = timer.setInterval(() => {
        // >> (hide)
        counter++;
        // << (hide)
        timer.clearInterval(id);
    }, 50);
    // << timer-set-interval

    TKUnit.wait(0.15);
    TKUnit.assertEqual(counter,  1, "Callback should be raised only once!");
};

export function test_clearTimeout_multipleTimes_afterTick() {
    let completed = false;

    const id = timer.setTimeout(() => {
        completed = true;
    });

    TKUnit.waitUntilReady(() => completed, 0.5);
    TKUnit.assert(completed, "Callback should be called");

    timer.clearTimeout(id);
    timer.clearTimeout(id);
}

export function test_clearTimeout_immediatelyAfterCreate() {
    let completed = false;

    const id = timer.setTimeout(() => {
        completed = true;
    });
    timer.clearTimeout(id);

    TKUnit.wait(0.02);
    TKUnit.assert(!completed, "Callback should not be called");
}

export function test_clearInterval_immediatelyAfterCreate() {
    let completed = false;

    const id = timer.setInterval(() => {
        completed = true;
    });
    timer.clearInterval(id);

    TKUnit.wait(0.05);
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