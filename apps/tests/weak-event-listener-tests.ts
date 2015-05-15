import TKUnit = require("./TKUnit");
import types = require("utils/types");
import observable = require("data/observable");
import weakEvents = require("ui/core/weak-event-listener");
import helper = require("./ui/helper");

class Target {
    public counter: number = 0;
    public onEvent(data: observable.EventData) {
        this.counter++;
    }

}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_source() {
    TKUnit.assertThrows(() => {
        weakEvents.addWeakEventListener(undefined, "eventName", emptyHandler, {});
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_target() {
    TKUnit.assertThrows(() => {
        weakEvents.addWeakEventListener(new observable.Observable(), "eventName", emptyHandler, undefined);
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_handler() {
    TKUnit.assertThrows(() => {
        weakEvents.addWeakEventListener(new observable.Observable(), "eventName", undefined, {});
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_name() {
    TKUnit.assertThrows(() => {
        weakEvents.addWeakEventListener(new observable.Observable(), undefined, emptyHandler, {});
    });
}

export function test_addWeakEventListener_listensForEvent() {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(
        source,
        observable.Observable.propertyChangeEvent,
        target.onEvent,
        target);

    helper.forceGC();

    source.set("testProp", "some value");

    TKUnit.assertEqual(target.counter, 1, "Handler not called.");
}

export function test_removeWeakEventListener_StopsListeningForEvet() {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);
    weakEvents.removeWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target)

    source.set("testProp", "some value");
    TKUnit.assertEqual(target.counter, 0, "Handler should not be called.");
}

export function test_handlerIsCalled_WithTargetAsThis() {
    var source = new observable.Observable();
    var target = new Object;
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        TKUnit.assertEqual(this, target, "this should be the target");
        callbackCalled = true;
    }

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, handler, target);

    source.set("testProp", "some value");
    TKUnit.assert(callbackCalled, "Handler not called.");
}

export function test_listnerDoesNotRetainTarget() {
    var source = new observable.Observable();
    var target = new Target();
    var callbackCalled = false;

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var targetRef = new WeakRef(target);
    target = undefined;
    helper.forceGC();

    TKUnit.assert(!targetRef.get(), "Target should be released after GC");
}

export function test_listnerDoesNotRetainSource() {
    var source = new observable.Observable();
    var target = new Target();
    var callbackCalled = false;

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var sourceRef = new WeakRef(source);
    source = undefined;
    helper.forceGC();

    TKUnit.assert(!sourceRef.get(), "Source should be released after GC");
}

//export function test_listnerIsCleared_WhenTargetIsDead() {
//    var source = new observable.Observable();

//    var listenerID = addListenerWithSource(source);
//    helper.forceGC();

//    for (var i = 0; i < weakEvents.cleanDeadReferencesCountTrigger; i++) {
//        addListenerWithSource(source);
//    }

//    TKUnit.assert(types.isUndefined(weakEvents._weakEventListeners[listenerID]), "The first listener should be dead by now");
//}

//export function test_listnerIsCleared_WhenSourceIsDead() {
//    var target = {};

//    var listenerID = addListenerWithTarget(target);
//    helper.forceGC();

//    for (var i = 0; i < weakEvents.cleanDeadReferencesCountTrigger; i++) {
//        addListenerWithTarget(target);
//    }

//    TKUnit.assert(types.isUndefined(weakEvents._weakEventListeners[listenerID]), "The first listener should be dead by now");
//}

//function addListenerWithSource(source: observable.Observable): number {
//    return weakEvents.addWeakEventListener({
//        source: source,
//        target: {},
//        handler: emptyHandler,
//        eventName: observable.Observable.propertyChangeEvent
//    })
//}

//function addListenerWithTarget(target: any): number {
//    return weakEvents.addWeakEventListener({
//        source: new observable.Observable(),
//        target: target,
//        handler: emptyHandler,
//        eventName: observable.Observable.propertyChangeEvent
//    })
//}

function emptyHandler(data: observable.EventData) {
    // Do nothing.
}



export function testWeakMap(): void {
    var source = new observable.Observable();
    var target = new Target();
    var targetRef = new WeakRef(target);
    var weakMap = new WeakMap<observable.Observable, Target>();

    weakMap.set(source, target);
    TKUnit.assertEqual(weakMap.get(source), target, "target");

    target = undefined;
    source = undefined;

    helper.forceGC();
    TKUnit.wait(1);

    TKUnit.waitUntilReady(function () {
        return false;
    })

    TKUnit.assert(!targetRef.get(), "Target should be dead");
}
