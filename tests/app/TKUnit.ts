/* tslint:disable */
/* Notes:

 1. all test function names should begin with 'test'
 2. (if exists) at the beginning of module test setUpModule() module function is called
 3. (if exists) at the beginning of each test setUp() module function is called
 4. tests should use TKUnit.assert(condition, message) to mark error. If no assert fails test is successful
 5. (if exists) at the end of each test tearDown() module function is called
 6. (if exists) at the end of module test tearDownModule() module function is called
 
*/

import * as Application from "tns-core-modules/application";
import * as timer from "tns-core-modules/timer";
import * as trace from "tns-core-modules/trace";
import * as types from "tns-core-modules/utils/types";
import * as platform from "tns-core-modules/platform";
import { topmost } from "tns-core-modules/ui/frame";

import * as utils from "tns-core-modules/utils/utils";

const sdkVersion = parseInt(platform.device.sdkVersion);

trace.enable();

export interface TestInfoEntry {
    testFunc: () => void;
    instance: Object;
    isTest: boolean;
    testName: string;
    isPassed: boolean;
    errorMessage: string;
    testTimeout: number;
    duration: number;
}

export function time(): number {
    if (global.android) {
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    }
    else {
        return CACurrentMediaTime() * 1000;
    }
}

export function write(message: string, type?: number) {
    //console.log(message);
    trace.write(message, trace.categories.Test, type);
}

function runTest(testInfo: TestInfoEntry) {
    let start = time();
    let duration;
    try {
        if (testInfo.instance) {
            testInfo.testFunc.apply(testInfo.instance);
        }
        else {
            testInfo.testFunc();
        }

        if (testInfo.isTest) {
            duration = time() - start;
            testInfo.duration = duration;
            write(`--- [${testInfo.testName}] OK, duration: ${duration.toFixed(2)}`, trace.messageType.info);
            testInfo.isPassed = true;
        }
    }
    catch (e) {
        if (testInfo.isTest) {
            duration = time() - start;
            testInfo.duration = duration;
            write(`--- [${testInfo.testName}] FAILED: ${e.message}, Stack: ${e.stack}, duration: ${duration.toFixed(2)}`, trace.messageType.error);
            testInfo.isPassed = false;
            testInfo.errorMessage = e.message;
        }
    }
}

export interface TestFailure {
    moduleName: string;
    testName: string;
    errorMessage: string;
}

export interface TestModuleRunResult {
    name: string;
    count: number;
    succeeded: number;
    failed: Array<TestFailure>;
}

let testsQueue: Array<TestInfoEntry>;
const defaultTimeout = 5000;

function runAsync(testInfo: TestInfoEntry, recursiveIndex: number, testTimeout?: number) {
    let error;
    let isDone = false;
    let handle;
    const testStartTime = time();
    //write("--- [" + testInfo.testName + "] Started at: " + testStartTime, trace.messageType.info);
    const doneCallback = (e: Error) => {
        if (e) {
            error = e;
        } else {
            isDone = true;
        }
    }

    const timeout = testTimeout || testInfo.testTimeout || defaultTimeout;

    let duration;
    const checkFinished = () => {
        duration = time() - testStartTime;
        testInfo.duration = duration;
        if (isDone) {
            write(`--- [${testInfo.testName}] OK, duration: ${duration}`, trace.messageType.info);
            testInfo.isPassed = true;
            runTests(testsQueue, recursiveIndex + 1);
        } else if (error) {
            write(`--- [${testInfo.testName}] FAILED: ${error.message}, duration: ${duration}`, trace.messageType.error);
           testInfo.errorMessage = error.message;
            runTests(testsQueue, recursiveIndex + 1);
        } else {
            const testEndTime = time();
            if (testEndTime - testStartTime > timeout) {
                write(`--- [${testInfo.testName}] TIMEOUT, duration: ${duration}`, trace.messageType.error);
                testInfo.errorMessage = "Test timeout.";
                runTests(testsQueue, recursiveIndex + 1);
            } else {
                setTimeout(checkFinished, 20);
            }
        }
    }

    try {
        if (testInfo.instance) {
            testInfo.testFunc.apply(testInfo.instance, [doneCallback]);
        } else {
            const func: any = testInfo.testFunc;
            func(doneCallback);
        }
    } catch (e) {
        doneCallback(e);
    }

    setTimeout(checkFinished, 20);
}

export function runTests(tests: Array<TestInfoEntry>, recursiveIndex) {
    testsQueue = tests;

    for (let i = recursiveIndex; i < testsQueue.length; i++) {
        const testEntry = testsQueue[i];

        if (testEntry.testFunc.length > 0) {
            return runAsync(testEntry, i);
        } else {
            runTest(testEntry);
        }
    }
}

export function assert(test: any, message?: string) {
    if (!test) {
        throw new Error(message);
    }
}

export function assertTrue(test: boolean, message?: string) {
    if (test !== true) {
        throw new Error(message);
    }
}

export function assertFalse(test: boolean, message?: string) {
    if (test !== false) {
        throw new Error(message);
    }
}

export function assertNotEqual(actual: any, expected: any, message?: string) {
    let equals = false;
    if (types.isUndefined(actual) && types.isUndefined(expected)) {
        equals = true;
    } else if (!types.isNullOrUndefined(actual) && !types.isNullOrUndefined(expected)) {
        if (types.isFunction(actual.equals)) {
            // Use the equals method
            if (actual.equals(expected)) {
                equals = true;
            }
        } else {
            equals = actual === expected;
        }
    }

    if (equals) {
        throw new Error(message + " Actual: " + actual + " Not_Expected: " + expected);
    }
}

export function assertEqual<T extends { equals?(arg: T): boolean } | any>(actual: T, expected: T, message: string = '') {
    if (!types.isNullOrUndefined(actual)
        && !types.isNullOrUndefined(expected)
        && types.getClass(actual) === types.getClass(expected)
        && types.isFunction(actual.equals)) {

        // Use the equals method
        if (!actual.equals(expected)) {
            throw new Error(`${message} Actual: <${actual}>(${typeof (actual)}). Expected: <${expected}>(${typeof (expected)})`);
        }
    }
    else if (actual !== expected) {
        throw new Error(`${message} Actual: <${actual}>(${typeof (actual)}). Expected: <${expected}>(${typeof (expected)})` );
    }
}

/**
 * Assert two json like objects are deep equal.
 */
export function assertDeepEqual(actual, expected, message: string = '', path: any[] = []): void {
    let typeofActual: string = typeof actual;
    let typeofExpected: string = typeof expected;
    if (typeofActual !== typeofExpected) {
        throw new Error(message + ' ' + "At /" + path.join("/") + " types of actual " + typeofActual + " and expected " + typeofExpected + " differ.");
    } else if (typeofActual === "object" || typeofActual === "array") {
        if (expected instanceof Map) {
            if (actual instanceof Map) {
                expected.forEach((value, key) => {
                    if (actual.has(key)) {
                        assertDeepEqual(actual.get(key), value, message, path.concat([key]));
                    } else {
                        throw new Error(message + ' ' + "At /" + path.join("/") + " expected Map has key '" + key + "' but actual does not.");
                    }
                });
                actual.forEach((value, key) => {
                    if (!expected.has(key)) {
                        throw new Error(message + ' ' + "At /" + path.join("/") + " actual Map has key '" + key + "' but expected does not.");
                    }
                });
            } else {
                throw new Error(message + ' ' + "At /" + path.join("/") + " expected is Map but actual is not.");
            }
        }
        if (expected instanceof Set) {
            if (actual instanceof Set) {
                expected.forEach(i => {
                    if (!actual.has(i)) {
                        throw new Error(message + ' ' + "At /" + path.join("/") + " expected Set has item '" + i + "' but actual does not.");
                    }
                });
                actual.forEach(i => {
                    if (!expected.has(i)) {
                        throw new Error(message + ' ' + "At /" + path.join("/") + " actual Set has item '" + i + "' but expected does not.");
                    }
                })
            } else {
                throw new Error(message + ' ' + "At /" + path.join("/") + " expected is Set but actual is not.");
            }
        }
        for (let key in actual) {
            if (!(key in expected)) {
                throw new Error(message + ' ' + "At /" + path.join("/") + " found unexpected key " + key + ".");
            }
            assertDeepEqual(actual[key], expected[key], message, path.concat([key]));
        }
        for (let key in expected) {
            if (!(key in actual)) {
                throw new Error(message + ' ' + "At /" + path.join("/") + " expected a key " + key + ".");
            }
        }
    } else if (actual !== expected) {
        throw new Error(message + ' ' + "At /" + path.join("/") + " actual: '" + actual + "' and expected: '" + expected + "' differ.");
    }
}

export function assertDeepSuperset(actual, expected, path: any[] = []): void {
    let typeofActual: string = typeof actual;
    let typeofExpected: string = typeof expected;
    if (typeofActual !== typeofExpected) {
        throw new Error("At /" + path.join("/") + " types of actual " + typeofActual + " and expected " + typeofExpected + " differ.");
    } else if (typeofActual === "object" || typeofActual === "array") {
        for (let key in expected) {
            if (!(key in actual)) {
                throw new Error("At /" + path.join("/") + " expected a key " + key + ".");
            }
            assertDeepSuperset(actual[key], expected[key], path.concat([key]));
        }
    } else if (actual !== expected) {
        throw new Error("At /" + path.join("/") + " actual: '" + actual + "' and expected: '" + expected + "' differ.");
    }
}

export function assertNull(actual: any, message?: string) {
    if (actual !== null && actual !== undefined) {
        throw new Error(message + " Actual: " + actual + " is not null/undefined");
    }
}

export function assertNotNull(actual: any, message?: string) {
    if (actual === null || actual === undefined) {
        throw new Error(message + " Actual: " + actual + " is null/undefined");
    }
}

export function areClose(actual: number, expected: number, delta: number): boolean {
    if (isNaN(actual) || Math.abs(actual - expected) > delta) {
        return false;
    }

    return true;
}

export function assertAreClose(actual: number, expected: number, delta: number, message?: string) {
    if (!areClose(actual, expected, delta)) {
        throw new Error(message + " Numbers are not close enough. Actual: " + actual + " Expected: " + expected + " Delta: " + delta);
    }
}

export function arrayAssert(actual: Array<any>, expected: Array<any>, message?: string) {
    if (actual.length !== expected.length) {
        throw new Error(message + " Actual array length: " + actual.length + " Expected array length: " + expected.length);
    }

    for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
            throw new Error(message + " Actual element at " + i + " is: " + actual[i] + " Expected element is: " + expected[i]);
        }
    }
}

export function assertThrows(testFunc: () => void, assertMessage?: string, expectedMessage?: string) {
    let actualError: Error;
    try {
        testFunc();
    } catch (e) {
        actualError = e;
    }

    if (!actualError) {
        throw new Error("Missing expected exception. " + assertMessage);
    }

    if (expectedMessage && actualError.message !== expectedMessage) {
        throw new Error("Got unwanted exception. Actual error: " + actualError.message + " Expected error: " + expectedMessage);
    }
}

export function wait(seconds: number): void {
    waitUntilReady(() => false, seconds, false);
}

export function waitUntilReady(isReady: () => boolean, timeoutSec: number = 3, shouldThrow: boolean = true) {
    if (!isReady) {
        return;
    }

    if (Application.ios) {
        const timeoutMs = timeoutSec * 1000;
        let totalWaitTime = 0;
        while (true) {
            const begin = time();
            const currentRunLoop = utils.ios.getter(NSRunLoop, NSRunLoop.currentRunLoop);
            currentRunLoop.limitDateForMode(currentRunLoop.currentMode);
            if (isReady()) {
                break;
            }

            totalWaitTime += (time() - begin);
            if (totalWaitTime >= timeoutMs) {
                if (shouldThrow) {
                    throw new Error("waitUntilReady Timeout.");
                } else {
                    break;
                }
            }
        }
    } else if (Application.android) {
        doModalAndroid(isReady, timeoutSec, shouldThrow);
    }
}

// Setup for the Android modal loop implementation
// TODO: If these platform-specific implementations continue to grow, think of per-platform separation (TKUnit.android)
let nextMethod;
let targetField;
let prepared;

function prepareModal() {
    if (prepared) {
        return;
    }

    const clsMsgQueue = java.lang.Class.forName("android.os.MessageQueue");
    const clsMsg = java.lang.Class.forName("android.os.Message");
    const methods = clsMsgQueue.getDeclaredMethods();
    for (let i = 0; i < methods.length; i++) {
        if (methods[i].getName() === "next") {
            nextMethod = methods[i];
            nextMethod.setAccessible(true);
            break;
        }
    }

    const fields = clsMsg.getDeclaredFields();
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].getName() === "target") {
            targetField = fields[i];
            targetField.setAccessible(true);
            break;
        }
    }

    prepared = true;
}

function doModalAndroid(quitLoop: () => boolean, timeoutSec: number, shouldThrow: boolean = true) {
    if (!quitLoop) {
        return;
    }

    prepareModal();

    const queue = android.os.Looper.myQueue();

    let quit = false;
    let timeout = false;
    timer.setTimeout(() => {
        quit = true;
        timeout = true;
    }, timeoutSec * 1000);

    let msg;

    while (!quit) {
        msg = nextMethod.invoke(queue, null);
        if (msg) {
            const target = targetField.get(msg);
            if (!target) {
                quit = true;
            } else {
                target.dispatchMessage(msg);
            }

            if (sdkVersion < 21) {//https://code.google.com/p/android-test-kit/issues/detail?id=84
                msg.recycle();
            }
        }

        if (shouldThrow && timeout) {
            throw new Error("waitUntilReady Timeout.");
        }

        if (!quit && quitLoop()) {
            quit = true;
        }
    }
}