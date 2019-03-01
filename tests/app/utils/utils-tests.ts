import * as TKUnit from "../TKUnit";
import * as utils from "tns-core-modules/utils/utils";
import { isIOS } from "tns-core-modules/platform";

export function test_GC_isDefined() {
    TKUnit.assertNotEqual(utils.GC, undefined, "Method utils.GC() should be defined!");
};

export function test_releaseNativeObject_isDefined() {
    TKUnit.assertNotEqual(utils.releaseNativeObject, undefined, "Method utils.releaseNativeObject() should be defined!");
};

export function test_releaseNativeObject_canBeCalledWithNativeObject() {
    if (isIOS) {
        test_releaseNativeObject_canBeCalledWithNativeObject_iOS();
    } else {
        test_releaseNativeObject_canBeCalledWithNativeObject_Android();
    }
};

function test_releaseNativeObject_canBeCalledWithNativeObject_iOS() {
    let deallocated = false;
    const obj = new ((<any>NSObject).extend({
        dealloc: function () {
            deallocated = true;
        }
    }));
    TKUnit.assertMatches(obj.description, /NSObject/, "Object description should match!")

    utils.releaseNativeObject(obj);

    // Need to sleep to make the delayed release get executed
    NSThread.sleepForTimeInterval(0);
    TKUnit.assertTrue(deallocated, "NativeObject must have been deallocated!");
}

function test_releaseNativeObject_canBeCalledWithNativeObject_Android() {
    const obj = new java.lang.Object();
    TKUnit.assertMatches(obj.toString(), /java.lang.Object/, "Object description should match!")

    utils.releaseNativeObject(obj);

    TKUnit.assertThrowsRegExp(obj.toString.bind(obj), "Should throw an error!", /Failed calling toString on a java\/lang\/Object instance/);
}
