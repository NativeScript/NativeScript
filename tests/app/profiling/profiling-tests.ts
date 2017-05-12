import * as TKUnit from "../TKUnit";
import * as prof from "tns-core-modules/profiling";

export function setUp() {
    prof.enable();
}

export function tearDown() {
    prof.disable();
}

export function test_time_throws_if_not_enabled() {
    prof.disable();
    TKUnit.assertThrows(prof.time);
};

export function test_time_returns_number_if_enabled() {
    TKUnit.assertEqual(typeof prof.time(), "number");
};

export function test_start_stop() {
    prof.start("__test1__");
    const res = prof.stop("__test1__");

    TKUnit.assertEqual(res.count, 1);
    TKUnit.assert(res.totalTime <= 1);
};

export function test_start_pause() {
    for (var i = 0; i < 10; i++) {
        prof.start("__test2__");
        prof.pause("__test2__");
    }

    const res = prof.stop("__test2__");
    TKUnit.assertEqual(res.count, 10);
    TKUnit.assert(res.totalTime <= 1);
};

export function test_timer_performance() {
    for (var i = 0; i < 10000; i++) {
        prof.start("__test3__");
        prof.pause("__test3__");
    }

    const res = prof.stop("__test3__");
    TKUnit.assertEqual(res.count, 10000);
    TKUnit.assert(res.totalTime <= 30, "Total time for 1000 timer operations is too much: " + res.totalTime);
};

export function test_profile_decorator_count_counts() {
    class TestClass {
        @prof.profile("__func_decorator__")
        f() {
            //noop
        }
    }

    const test = new TestClass();

    for (var i = 0; i < 10; i++) {
        test.f();
    }
    const res = prof.stop("__func_decorator__");
    TKUnit.assertEqual(res.count, 10);
}