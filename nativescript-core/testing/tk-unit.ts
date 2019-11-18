/* tslint:disable */

/* Notes:

 1. all test function names should begin with 'test'
 2. (if exists) at the beginning of module test setUpModule() module function is called
 3. (if exists) at the beginning of each test setUp() module function is called
 4. tests should use TKUnit.assert(condition, message) to mark error. If no assert fails test is successful
 5. (if exists) at the end of each test tearDown() module function is called
 6. (if exists) at the end of module test tearDownModule() module function is called

*/

import * as application from "../application";
import * as platform from "../platform";
import * as timer from "../timer";
import * as trace from "../trace";

const sdkVersion = parseInt(platform.device.sdkVersion);

trace.enable();

export function time(): number {
    if (global.android) {
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    } else {
        return CACurrentMediaTime() * 1000;
    }
}

export function wait(seconds: number): void {
    waitUntilReady(() => false, seconds, false);
}

export function waitUntilReady(isReady: () => boolean, timeoutSec: number = 3, shouldThrow: boolean = true) {
    if (!isReady) {
        return;
    }

    if (application.ios) {
        const timeoutMs = timeoutSec * 1000;
        let totalWaitTime = 0;
        while (true) {
            const begin = time();
            const currentRunLoop = NSRunLoop.currentRunLoop;
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
    } else if (application.android) {
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
