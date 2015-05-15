import TKUnit = require("./TKUnit");
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

export function test_addWeakEventListener_listensForEven_multipleTargetst() {
    var source = new observable.Observable();
    var target1 = new Target();
    var target2 = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target1.onEvent, target1);
    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target2.onEvent, target2);

    helper.forceGC();

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

export function test_listnerDoesNotRetainTarget() {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var targetRef = new WeakRef(target);
    target = undefined;
    helper.forceGC();

    TKUnit.assert(!targetRef.get(), "Target should be released after GC");
}

export function test_listnerDoesNotRetainSource() {
    var source = new observable.Observable();
    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);

    var sourceRef = new WeakRef(source);
    source = undefined;
    helper.forceGC();

    TKUnit.assert(!sourceRef.get(), "Source should be released after GC");
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

export function test_autoDetachingOfDeadReferences() {
    var source = new observable.Observable();

    for (var i = 0; i < 100; i++) {
        addListenerWithSource(source);
    }

    helper.forceGC();

    var target = new Target();

    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target);
    weakEvents.removeWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target)

    TKUnit.assert(!source.hasListeners(observable.Observable.propertyChangeEvent), "All events should be detached");
}

function addListenerWithSource(source: observable.Observable) {
    var target = new Target();
    weakEvents.addWeakEventListener(source, observable.Observable.propertyChangeEvent, target.onEvent, target)
}

function emptyHandler(data: observable.EventData) {
    // Do nothing.
}