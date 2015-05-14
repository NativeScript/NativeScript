import TKUnit = require("./TKUnit");
import types = require("utils/types");
import observable = require("data/observable");
import weakEvents = require("ui/core/weak-event-listener");
import helper = require("./ui/helper");

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_source() {
    TKUnit.assertThrows(() => {
        weakEvents.WeakEventListener.addWeakEventListener({
            source: undefined,
            target: {},
            handler: emptyHandler,
            eventName: observable.Observable.propertyChangeEvent
        });
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_target() {
    TKUnit.assertThrows(() => {
        weakEvents.WeakEventListener.addWeakEventListener({
            source: new observable.Observable(),
            target: undefined,
            handler: emptyHandler,
            eventName: observable.Observable.propertyChangeEvent
        });
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_handler() {
    TKUnit.assertThrows(() => {
        weakEvents.WeakEventListener.addWeakEventListener({
            source: new observable.Observable(),
            target: {},
            handler: undefined,
            eventName: observable.Observable.propertyChangeEvent
        });
    });
}

export function test_addWeakEventListener_throwsWhenCalledwitnInvalid_name() {
    TKUnit.assertThrows(() => {
        weakEvents.WeakEventListener.addWeakEventListener({
            source: new observable.Observable(),
            target: {},
            handler: emptyHandler,
            eventName: undefined
        });
    });
}

export function test_addWeakEventListener_listensForEvent() {
    var source = new observable.Observable();
    var target = new Object;
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        callbackCalled = true;
    }

    weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: target,
        handler: handler,
        eventName: observable.Observable.propertyChangeEvent
    })

    source.set("testProp", "some value");

    TKUnit.assert(callbackCalled, "Handler not called.");
}

export function test_removeWeakEventListener_StopsListeningForEvet() {
    var source = new observable.Observable();
    var target = new Object;
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        callbackCalled = true;
    }

    var listenerID = weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: target,
        handler: handler,
        eventName: observable.Observable.propertyChangeEvent
    })

    weakEvents.WeakEventListener.removeWeakEventListener(listenerID);

    source.set("testProp", "some value");
    TKUnit.assert(!callbackCalled, "Handler should not be called.");
}

export function test_handlerIsCalled_WithTargetAsThis() {
    var source = new observable.Observable();
    var target = new Object;
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        TKUnit.assertEqual(this, target, "this should be the target");
        callbackCalled = true;
    }

    weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: target,
        handler: handler,
        eventName: observable.Observable.propertyChangeEvent
    })

    source.set("testProp", "some value");
    TKUnit.assert(callbackCalled, "Handler not called.");
}

export function test_listnerDoesNotRetainTarget() {
    var source = new observable.Observable();
    var target = new Object;
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        TKUnit.assertEqual(this, target, "this should be the target");
        callbackCalled = true;
    }

    weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: target,
        handler: handler,
        eventName: observable.Observable.propertyChangeEvent
    })

    var targetRef = new WeakRef(target);
    target = undefined;
    helper.forceGC();

    TKUnit.assert(!targetRef.get(), "Target should be released after GC");
}

export function test_listnerDoesNotRetainSource() {
    var source = new observable.Observable();
    var target = new Object();
    var callbackCalled = false;
    var handler = function (args: observable.EventData) {
        TKUnit.assertEqual(this, target, "this should be the target");
        callbackCalled = true;
    }

    weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: target,
        handler: handler,
        eventName: observable.Observable.propertyChangeEvent
    })

    var sourceRef = new WeakRef(source);
    source = undefined;
    helper.forceGC();

    TKUnit.assert(!sourceRef.get(), "Source should be released after GC");
}

export function test_listnerIsCleared_WhenTargetIsDead() {
    var source = new observable.Observable();

    var listenerID = addListenerWithSource(source);
    helper.forceGC();

    for (var i = 0; i < weakEvents.WeakEventListener.cleanDeadReferencesCountTrigger; i++) {
        addListenerWithSource(source);
    }

    TKUnit.assert(types.isUndefined(weakEvents.WeakEventListener._weakEventListeners[listenerID]), "The first listener should be dead by now");
}

export function test_listnerIsCleared_WhenSourceIsDead() {
    var target = {};

    var listenerID = addListenerWithTarget(target);
    helper.forceGC();

    for (var i = 0; i < weakEvents.WeakEventListener.cleanDeadReferencesCountTrigger; i++) {
        addListenerWithTarget(target);
    }

    TKUnit.assert(types.isUndefined(weakEvents.WeakEventListener._weakEventListeners[listenerID]), "The first listener should be dead by now");
}

function addListenerWithSource(source: observable.Observable): number {
    return weakEvents.WeakEventListener.addWeakEventListener({
        source: source,
        target: {},
        handler: emptyHandler,
        eventName: observable.Observable.propertyChangeEvent
    })
}

function addListenerWithTarget(target: any): number {
    return weakEvents.WeakEventListener.addWeakEventListener({
        source: new observable.Observable(),
        target: target,
        handler: emptyHandler,
        eventName: observable.Observable.propertyChangeEvent
    })
}

function emptyHandler(data: observable.EventData) {
    // Do nothing.
}