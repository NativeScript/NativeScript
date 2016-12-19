import * as TKUnit from "./TKUnit";
import * as observable from "data/observable";
import * as weakEvents from "ui/core/weak-event-listener";
import * as helper from "./ui/helper";

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

    source.set("testProp", "some value");

    TKUnit.assertEqual(target.counter, 1, "Handler not called.");
}

export function test_addWeakEventListener_listensForEven_multipleTargetst() {
    var source = new observable.Observable();
    var target1 = new Target();
    var target2 = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target1.onEvent, target1);
    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target2.onEvent, target2);

    source.set("testProp", "some value");

    TKUnit.assertEqual(target1.counter, 1, "Handler not called.");
    TKUnit.assertEqual(target2.counter, 1, "Handler not called.");
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
    var target = new Object();
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        TKUnit.assertEqual(this, target, "this should be the target");
        callbackCalled = true;
    }

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, handler, target);

    source.set("testProp", "some value");
    TKUnit.assert(callbackCalled, "Handler not called.");
}

export function test_listnerDoesNotRetainTarget(done) {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var targetRef = new WeakRef(target);
    target = undefined;

    TKUnit.waitUntilReady(() => {
        helper.forceGC();
        return !targetRef.get();
    });

    try {
        TKUnit.assert(!targetRef.get(), "Target should be released after GC");
        done(null);
    }
    catch (e) {
        done(e);
    }
}

export function test_listnerDoesNotRetainSource(done) {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var sourceRef = new WeakRef(source);
    source = undefined;

    TKUnit.waitUntilReady(() => {
        helper.forceGC();
        return !sourceRef.get();
    });
    
    try {
        TKUnit.assert(!sourceRef.get(), "Source should be released after GC");
        done(null);
    }
    catch (e) {
        done(e);
    }
}

export function test_handlerIsDetached_WhenAllListenersAreRemoved() {
    var source = new observable.Observable();

    var target1 = new Target();
    var target2 = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target1.onEvent, target1);
    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target2.onEvent, target2);

    weakEvents.removeWeakEventListener(source, observable.Observable.propertyChangeEvent, target1.onEvent, target1)
    weakEvents.removeWeakEventListener(source, observable.Observable.propertyChangeEvent, target2.onEvent, target2)

    TKUnit.assert(!source.hasListeners(observable.Observable.propertyChangeEvent), "All events should be detached");
}

export function test_autoDetachingOfDeadReferences(done) {
    var source = new observable.Observable();

    for (var i = 0; i < 100; i++) {
        addListenerWithSource(source);
    }
    try {
        helper.forceGC();

        var target = new Target();

        weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);
        weakEvents.removeWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target)

        TKUnit.waitUntilReady(() => { return !source.hasListeners(observable.Observable.propertyChangeEvent); });
        var testPass = (<any>source)._observers[observable.Observable.propertyChangeEvent] ? (<any>source)._observers[observable.Observable.propertyChangeEvent].length <= 1 : true;
        TKUnit.assert(testPass, "All events should be detached");
        done(null);
    }
    catch (e) {
        done(e);
    }
}

function addListenerWithSource(source: observable.Observable) {
    var target = new Target();
    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target)
}

function emptyHandler(data: observable.EventData) {
    // Do nothing.
}