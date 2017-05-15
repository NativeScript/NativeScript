import { assert, assertEqual, assertFalse, assertTrue, assertThrows } from "../TKUnit";
import * as prof from "tns-core-modules/profiling";
import { isAndroid } from "tns-core-modules/platform";

prof.enable();
class TestClass {
    @prof.profile("__func_decorator__")
    doNothing() {
        //noop
    }

    @prof.profile("__func_decorator_error__")
    throwError() {
        throw new Error("This error is expected");
    }
}
prof.disable();

export function setUp() {
    prof.enable();
}

export function tearDown() {
    prof.disable();
}

export function test_time_throws_if_not_enabled() {
    prof.disable();
    assertThrows(prof.time);
};

export function test_time_returns_number_if_enabled() {
    assertEqual(typeof prof.time(), "number");
};

export function test_isRunning() {
    const name = "test_isRunning";
    assertFalse(prof.isRunning(name), "isRunning should be false before start");

    prof.start(name);
    assertTrue(prof.isRunning(name), "isRunning should be true after start");

    prof.pause(name);
    assertFalse(prof.isRunning(name), "isRunning should be false after pause");

    prof.start(name);
    assertTrue(prof.isRunning(name), "isRunning should be true after second start");

    prof.stop(name);
    assertFalse(prof.isRunning(name), "isRunning should be false after stop");
}

export function test_start_stop() {
    const name = "test_start_stop";

    prof.start(name);
    const res = prof.stop(name);

    assertEqual(res.count, 1);
    assert(res.totalTime <= 1);
};

export function test_start_pause_count() {
    const name = "test_start_pause_count";

    for (var i = 0; i < 10; i++) {
        prof.start(name);
        prof.pause(name);
    }

    const res = prof.stop(name);
    assertEqual(res.count, 10);
};

export function test_profile_decorator_count() {
    const test = new TestClass();
    for (var i = 0; i < 10; i++) {
        test.doNothing();
    }

    const res = prof.stop("__func_decorator__");
    assertEqual(res.count, 10);
}

export function test_profile_decorator_handles_exceptions() {
    const test = new TestClass();

    assertThrows(() => test.throwError());
    assertFalse(prof.isRunning("__func_decorator_error__"), "Timer should be stopped on exception.");
    assertEqual(prof.stop("__func_decorator_error__").count, 1, "Timer should be called once");
}

export function test_start_pause_performance() {
    if (isAndroid) {
        // TODO: skip these test for android as they are unstable
        return;
    }

    const count = 10000;
    const name = "test_start_pause_performance";

    for (var i = 0; i < count; i++) {
        prof.start(name);
        prof.pause(name);
    }

    const res = prof.stop(name);
    assertEqual(res.count, count);
    assert(res.totalTime <= 50, `Total time for ${count} timer operations is too much: ${res.totalTime}`);
};

export function test_profile_decorator_performance() {
    if (isAndroid) {
        // TODO: skip these test for android as they are unstable
        return;
    }

    const count = 10000;
    const test = new TestClass();
    for (var i = 0; i < count; i++) {
        test.doNothing();
    }

    const res = prof.stop("__func_decorator__");
    assertEqual(res.count, count);
    assert(res.totalTime <= 50, `Total time for ${count} timer operations is too much: ${res.totalTime}`);
}