/* tslint:disable */
/* Notes:

 1. all test function names should begin with 'test'
 2. (if exists) at the beginning of module test setUpModule() module function is called
 3. (if exists) at the beginning of each test setUp() module function is called
 4. tests should use TKUnit.assert(condition, message) to mark error. If no assert fails test is successful
 5. (if exists) at the end of each test tearDown() module function is called
 6. (if exists) at the end of module test tearDownModule() module function is called
 
*/

import Application = require("application");
import timer = require("timer");
import trace = require("trace");
import types = require("utils/types");
import platform = require("platform");
var sdkVersion = parseInt(platform.device.sdkVersion);

trace.enable();

export var write = function write(message: string, type?: number) {
    //console.log(message);
    trace.write(message, trace.categories.Test, type);
}

var runTest = function (testInfo) {
    try {
        testInfo.testFunc();
        if (testInfo.isTest) {
            write("--- [" + testInfo.testName + "] OK", trace.messageType.info);
            testInfo.isPassed = true;
        }
    }
    catch (e) {
        if (testInfo.isTest) {
            write("--- [" + testInfo.testName + "]  FAILED: " + e.message, trace.messageType.error);
            testInfo.isPassed = false;
            testInfo.errorMessage = e.message;
        }
    }
};

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

var testsQueue;
var defaultTimeout = 5000;

// testInfo : {testFunc: func, testName: string, isTest: boolean, isPassed: boolean, errorMessage: string}
function runAsync(testInfo, recursiveIndex, testTimeout?) {
    var error;
    var isDone = false;
    var handle;
    var testStartTime = new Date().getTime();
    //write("--- [" + testInfo.testName + "] Started at: " + testStartTime, trace.messageType.info);
    var doneCallback = function (e: Error) {
        if (e) {
            error = e;
        }
        else {
            isDone = true;
        }
    }
    var testTimeout = testInfo.testTimeout;
    if (!testTimeout) {
        testTimeout = defaultTimeout;
    }

    var checkFinished = function () {
        if (isDone) {
            write("--- [" + testInfo.testName + "] OK", trace.messageType.info);
            //write("--- [" + testInfo.testName + "] took: " + (new Date().getTime() - testStartTime), trace.messageType.info);
            testInfo.isPassed = true;
            runTests(testsQueue, recursiveIndex + 1);
        }
        else if (error) {
            write("--- [" + testInfo.testName + "]  FAILED: " + error.message, trace.messageType.error);
            //write("--- [" + testInfo.testName + "] took: " + (new Date().getTime() - testStartTime), trace.messageType.info);
            testInfo.errorMessage = error.message;
            runTests(testsQueue, recursiveIndex + 1);
        }
        else {
            var testEndTime = new Date().getTime();
            if (testEndTime - testStartTime > testTimeout) {
                write("--- [" + testInfo.testName + "]  TIMEOUT", trace.messageType.error);
                //write("--- [" + testInfo.testName + "] took: " + (testEndTime - testStartTime), trace.messageType.info);
                testInfo.errorMessage = "Test timeout.";
                runTests(testsQueue, recursiveIndex + 1);
            }
            else {
                setTimeout(checkFinished, 200);
            }
        }
    }

    testInfo.testFunc(doneCallback);

    setTimeout(checkFinished, 0);
}

// tests : Array<{testFunc: func, testName: string, isTest: boolean, isPassed: boolean, errorMessage: string}>
export var runTests = function (tests, recursiveIndex) {
    testsQueue = tests;

    var i;
    for (i = recursiveIndex; i < testsQueue.length; i++) {
        if (testsQueue[i].testFunc.length > 0) {
            return runAsync(testsQueue[i], i);
        }
        else {
            runTest(testsQueue[i]);
        }
    }
}

export function assert(test: any, message?: string) {
    if (!test) {
        throw new Error(message);
    }
};

export function assertNotEqual(actual: any, expected: any, message?: string) {

    var equals = false;
    if (types.isUndefined(actual) && types.isUndefined(expected)) {
        equals = true;
    }
    else if (!types.isUndefined(actual) && !types.isUndefined(expected)) {
        if (types.isFunction(actual.equals)) {

            // Use the equals method
            if (actual.equals(expected)) {
                equals = true;
            }
        }
        else {
            equals = actual === expected;
        }
    }

    if (equals) {
        throw new Error(message + " Actual: " + actual + " Expected: " + expected);
    }
}

export function assertEqual(actual: any, expected: any, message?: string) {
    if (!types.isUndefined(actual)
        && !types.isUndefined(expected)
        && types.getClass(actual) === types.getClass(expected)
        && types.isFunction(actual.equals)) {

        // Use the equals method
        if (!actual.equals(expected)) {
            throw new Error(message + " Actual: " + actual + " Expected: " + expected);
        }
    }
    else if (actual !== expected) {
        throw new Error(message + " Actual: " + actual + " Expected: " + expected);
    }
};

export function assertAreClose(actual: number, expected: number, delta: number, message?: string) {
    if (isNaN(actual) || Math.abs(actual - expected) > delta) {
        throw new Error(message + " Numbers are not close enough. Actual: " + actual + " Expected: " + expected + " Delta: " + delta);
    }
};

export function arrayAssert(actual: Array<any>, expected: Array<any>, message?: string) {
    if (actual.length !== expected.length) {
        throw new Error(message + " Actual array length: " + actual.length + " Expected array length: " + expected.length);
    }
    var i;
    for (i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
            throw new Error(message + " Actual element at " + i + " is: " + actual[i] + " Expected element is: " + expected[i]);
        }
    }
}

export function assertThrows(testFunc: () => void, assertMessage?: string, expectedMessage?: string) {
    var actualError: Error;
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

export var wait = function (seconds: number) {
    waitUntilReady(function () {
        return false;
    }, seconds);
};

export var waitUntilReady = function (isReady: () => boolean, timeoutSec?: number) {
    if (!isReady) {
        return;
    }

    if (!timeoutSec) {
        // TODO: How much should be the default timeout in seconds?
        timeoutSec = 20;
    }

    if (Application.ios) {
        var waitTime = 20 / 1000;
        var totalWaitTime = 0;
        while (true) {
            NSRunLoop.currentRunLoop().runUntilDate(NSDate.dateWithTimeIntervalSinceNow(waitTime));
            if (isReady()) {
                break;
            }

            totalWaitTime += waitTime;
            if (timeoutSec && totalWaitTime >= timeoutSec) {
                break;
            }
        }
    } else if (Application.android) {
        doModalAndroid(isReady, timeoutSec);
    }
};

// Setup for the Android modal loop implementation
// TODO: If these platform-specific implementations continue to grow, think of per-platform separation (TKUnit.android)
var nextMethod;
var targetField;
var prepared;

var prepareModal = function () {
    if (prepared) {
        return;
    }

    var clsMsgQueue = java.lang.Class.forName("android.os.MessageQueue");
    var clsMsg = java.lang.Class.forName("android.os.Message");

    nextMethod;
    var methods = clsMsgQueue.getDeclaredMethods();
    var i;
    for (i = 0; i < methods.length; i++) {
        if (methods[i].getName() === "next") {
            nextMethod = methods[i];
            nextMethod.setAccessible(true);
            break;
        }
    }

    targetField;
    var fields = clsMsg.getDeclaredFields();
    for (i = 0; i < fields.length; i++) {
        if (fields[i].getName() === "target") {
            targetField = fields[i];
            targetField.setAccessible(true);
            break;
        }
    }

    prepared = true;
}

var doModalAndroid = function (quitLoop: () => boolean, timeoutSec: number) {
    if (!quitLoop) {
        return;
    }

    prepareModal();

    var queue = android.os.Looper.myQueue();

    var quit = false;
    timer.setTimeout(function () {
        quit = true;
    }, timeoutSec * 1000);

    var msg;

    while (!quit) {
        msg = nextMethod.invoke(queue, null);
        if (msg) {
            var target = targetField.get(msg);
            if (!target) {
                quit = true;
            } else {
                target.dispatchMessage(msg);
            }
            
            if (sdkVersion < 21) {//https://code.google.com/p/android-test-kit/issues/detail?id=84
                msg.recycle();
            }
        }

        if (!quit && quitLoop()) {
            quit = true;
        }
    }
};