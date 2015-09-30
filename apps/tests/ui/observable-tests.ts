// <snippet module="data/observable" title="data/observable">
// # Observable
// Using Observable objects requires the "data/observable" module.
// ``` JavaScript
import observable = require("data/observable");
// ```
// </snippet>

import dependencyObservable = require("ui/core/dependency-observable");
import TKUnit = require("../TKUnit");
import types = require("utils/types");
import proxy = require("ui/core/proxy");

var TESTED_NAME = "tested";
class TestObservable extends observable.Observable {
    public test() {
        this._emit(TESTED_NAME);
    }
}

export var test_Observable_Constructor = function () {
    // <snippet module="data/observable" title="data/observable">
    // ### Creating an Observable
    // ``` JavaScript
    var json = {
        Name: "John",
        Age: 34,
        Married: true
    };
    var person = new observable.Observable(json);
    var name = person.get("Name");
    var age = person.get("Age");
    var married = person.get("Married");
    //// console.log(name + " " + age + " " + married); // Prints out "John 34 true" if uncommented.
    // ```
    // </snippet>
    TKUnit.assert(name === "John", "Expected name is John");
    TKUnit.assert(age === 34, "Expected age is 34");
    TKUnit.assert(married === true, "Expected married is true");
}

export var tests_DummyTestForCodeSnippet = function () {
    // <snippet module="data/observable" title="data/observable">
    // ### Responding to property changes
    // ``` JavaScript
    var person = new observable.Observable();
    person.set("Name", "John");
    person.set("Age", 34);
    person.set("Married", true);
    person.addEventListener(observable.Observable.propertyChangeEvent, function (pcd: observable.PropertyChangeData) {
        //console.log(pcd.eventName.toString() + " " + pcd.propertyName.toString() + " " + pcd.value.toString());
    });
    person.set("Age", 35);
    person.set("Married", false);
    //// If uncommented, the console.log above produces the following output:
    //// propertyChange Age 35
    //// propertyChange Married false
    // ```
    // </snippet>
}

export var test_Observable_Members = function () {
    var obj = new observable.Observable();
    TKUnit.assert(types.isDefined(obj.addEventListener), "Observable.addEventListener not defined");
    TKUnit.assert(types.isDefined(obj._createPropertyChangeData), "Observable.createPropertyChangeData not defined");
    TKUnit.assert(types.isDefined(obj._emit), "Observable.emit not defined");
    TKUnit.assert(types.isDefined(obj.get), "Observable.get not defined");
    TKUnit.assert(types.isDefined(obj.hasListeners), "Observable.hasListeners not defined");
    TKUnit.assert(types.isDefined(obj.notify), "Observable.notify not defined");
    TKUnit.assert(types.isDefined(obj.off), "Observable.off not defined");
    TKUnit.assert(types.isDefined(obj.on), "Observable.on not defined");
    TKUnit.assert(types.isDefined(obj.removeEventListener), "Observable.removeEventListener not defined");
    TKUnit.assert(types.isDefined(obj.set), "Observable.set not defined");
    TKUnit.assert(types.isDefined(obj.typeName), "Observable.typeName not defined");
}

export var test_Observable_UpdateAnotherPropertyWithinChangedCallback = function () {
    var obj = new observable.Observable();

    var changedCallback = function (pcd: observable.PropertyChangeData) {
        if (pcd.propertyName === "name") {
            pcd.object.set("test", "Changed test");
        }
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, changedCallback);

    obj.set("name", "Initial name");
    obj.set("test", "Initial test");

    TKUnit.assert(obj.get("name") === "Initial name", "Initial value for property name is not correct!");
    TKUnit.assert(obj.get("test") === "Initial test", "Initial value for property test is not correct!");

    obj.set("name", "Changed name");

    TKUnit.assert(obj.get("name") === "Changed name", "Changed value for property name is not correct!");
    TKUnit.assert(obj.get("test") === "Changed test", "Changed value for property test is not correct!");
}

export var test_DependencyObservable_UpdateAnotherPropertyWithinChangedCallback = function () {
    var obj = new dependencyObservable.DependencyObservable();

    function onFirstPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var testObj = <dependencyObservable.DependencyObservable>data.object;
        testObj._setValue(secondProperty, "Changed test");
    };

    var firstProperty = new dependencyObservable.Property(
        "first",
        "obj",
        new proxy.PropertyMetadata(
            "",
            dependencyObservable.PropertyMetadataSettings.None,
            onFirstPropertyChanged
            )
        );

    var secondProperty = new dependencyObservable.Property(
        "second",
        "obj",
        new proxy.PropertyMetadata(
            "",
            dependencyObservable.PropertyMetadataSettings.None,
            null
            )
        );

    obj._setValue(firstProperty, "Initial name");
    obj._setValue(secondProperty, "Initial test");

    TKUnit.assert(obj._getValue(firstProperty) === "Initial name", "Initial value for property name is not correct!");
    TKUnit.assert(obj._getValue(secondProperty) === "Initial test", "Initial value for property test is not correct!");

    obj._setValue(firstProperty, "Changed name");

    TKUnit.assert(obj._getValue(firstProperty) === "Changed name", "Changed value for property name is not correct!");
    TKUnit.assert(obj._getValue(secondProperty) === "Changed test", "Changed value for property test is not correct!");
}

export var test_Observable_addEventListener_SingleEvent = function () {
    var obj = new observable.Observable();

    var receivedCount = 0;
    var callback = function (data: observable.PropertyChangeData) {
        receivedCount++;
        TKUnit.assert(data.eventName === observable.Observable.propertyChangeEvent, "Expected event name " + observable.Observable.propertyChangeEvent);
        TKUnit.assert(data.object === obj, "PropertyChangeData.object value not valid.");
        TKUnit.assert(data.propertyName === "testName", "PropertyChangeData.propertyName value not valid.");
        TKUnit.assert(data.value === 1, "PropertyChangeData.value value not valid.");
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback);
    obj.set("testName", 1);
    TKUnit.assert(receivedCount === 1, "PropertyChanged event not raised properly.");
}

export var test_Observable_addEventListener_MultipleEvents = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback = function (data: observable.EventData) {
        receivedCount++;
        TKUnit.assert(data.object === obj, "EventData.object value not valid.");

        if (data.eventName === observable.Observable.propertyChangeEvent) {
            var propertyData = <observable.PropertyChangeData>data;
            TKUnit.assert(propertyData.eventName === observable.Observable.propertyChangeEvent, "Expected event name " + observable.Observable.propertyChangeEvent);
            TKUnit.assert(propertyData.propertyName === "testName", "PropertyChangeData.propertyName value not valid.");
            TKUnit.assert(propertyData.value === 1, "PropertyChangeData.value value not valid.");
        } else {
            TKUnit.assert(data.eventName === TESTED_NAME, "Expected event name " + TESTED_NAME);
        }
    }

    var events = observable.Observable.propertyChangeEvent + "," + TESTED_NAME;
    obj.addEventListener(events, callback);
    obj.set("testName", 1);
    obj.test();
    TKUnit.assert(receivedCount === 2, "Callbacks not raised properly.");
}

export var test_Observable_addEventListener_MultipleEvents_ShouldTrim = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback = function (data: observable.EventData) {
        receivedCount++;
    }

    var events = observable.Observable.propertyChangeEvent + "  ,  " + TESTED_NAME;
    obj.addEventListener(events, callback);
    TKUnit.assert(obj.hasListeners(observable.Observable.propertyChangeEvent), "Observable.addEventListener for multiple events should trim each event name.");
    TKUnit.assert(obj.hasListeners(TESTED_NAME), "Observable.addEventListener for multiple events should trim each event name.");

    obj.set("testName", 1);
    obj.test();

    TKUnit.assert(receivedCount === 2, "Callbacks not raised properly.");
}

export var test_Observable_addEventListener_MultipleCallbacks = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback1 = function (data: observable.EventData) {
        receivedCount++;
    }

    var callback2 = function (data: observable.EventData) {
        receivedCount++;
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback1);
    obj.addEventListener(observable.Observable.propertyChangeEvent, callback2);

    obj.set("testName", 1);
    TKUnit.assert(receivedCount === 2, "The propertyChanged notification should be raised twice.");
}

export var test_Observable_addEventListener_MultipleCallbacks_MultipleEvents = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback1 = function (data: observable.EventData) {
        receivedCount++;
    }

    var callback2 = function (data: observable.EventData) {
        receivedCount++;
    }

    var events = observable.Observable.propertyChangeEvent + "  ,  " + TESTED_NAME;
    obj.addEventListener(events, callback1);
    obj.addEventListener(events, callback2);

    obj.set("testName", 1);
    obj.test();

    TKUnit.assert(receivedCount === 4, "The propertyChanged notification should be raised twice.");
}

export var test_Observable_removeEventListener_SingleEvent_SingleCallback = function () {
    var obj = new observable.Observable();

    var receivedCount = 0;
    var callback = function (data: observable.EventData) {
        receivedCount++;
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback);
    obj.set("testName", 1);

    obj.removeEventListener(observable.Observable.propertyChangeEvent, callback);
    TKUnit.assert(!obj.hasListeners(observable.Observable.propertyChangeEvent), "Observable.removeEventListener not working properly.");

    obj.set("testName", 2);
    TKUnit.assert(receivedCount === 1, "Observable.removeEventListener not working properly.");
}

export var test_Observable_removeEventListener_SingleEvent_MultipleCallbacks = function () {
    var obj = new observable.Observable();

    var receivedCount = 0;
    var callback1 = function (data: observable.EventData) {
        receivedCount++;
    }

    var callback2 = function (data: observable.EventData) {
        receivedCount++;
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback1);
    obj.addEventListener(observable.Observable.propertyChangeEvent, callback2);
    obj.set("testName", 1);

    obj.removeEventListener(observable.Observable.propertyChangeEvent, callback1);
    TKUnit.assert(obj.hasListeners(observable.Observable.propertyChangeEvent), "Observable.removeEventListener not working properly with multiple listeners.");

    obj.set("testName", 2);    
    TKUnit.assert(receivedCount === 3, "Observable.removeEventListener not working properly with multiple listeners.");

    obj.removeEventListener(observable.Observable.propertyChangeEvent, callback2);
    TKUnit.assert(!obj.hasListeners(observable.Observable.propertyChangeEvent), "Observable.removeEventListener not working properly with multiple listeners.");

    obj.set("testName", 3);
    TKUnit.assert(receivedCount === 3, "Observable.removeEventListener not working properly with multiple listeners.");
}

export var test_Observable_removeEventListener_MutlipleEvents_SingleCallback = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback = function (data: observable.EventData) {
        receivedCount++;
    }

    var events = observable.Observable.propertyChangeEvent + "  ,  " + TESTED_NAME;
    obj.addEventListener(events, callback);

    obj.set("testName", 1);
    obj.test();

    obj.removeEventListener(events, callback);

    TKUnit.assert(!obj.hasListeners(observable.Observable.propertyChangeEvent), "Expected result for hasObservers is false");
    TKUnit.assert(!obj.hasListeners(TESTED_NAME), "Expected result for hasObservers is false.");

    obj.set("testName", 2);
    obj.test();

    TKUnit.assert(receivedCount === 2, "Expected receive count is 2");
}

export var test_Observable_removeEventListener_SingleEvent_NoCallbackSpecified = function () {
    var obj = new TestObservable();

    var receivedCount = 0;
    var callback1 = function (data: observable.EventData) {
        receivedCount++;
    }

    var callback2 = function (data: observable.EventData) {
        receivedCount++;
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback1);
    obj.addEventListener(observable.Observable.propertyChangeEvent, callback2);

    obj.set("testName", 1);
    obj.removeEventListener(observable.Observable.propertyChangeEvent);

    TKUnit.assert(!obj.hasListeners(observable.Observable.propertyChangeEvent), "Expected result for hasObservers is false.");

    obj.set("testName", 2);
    TKUnit.assert(receivedCount === 2, "Expected receive count is 2");
}

export var test_Observable_WhenCreatedWithJSON_PropertyChangedWithDotNotation_RaisesPropertyChangedEvent = function () {
    var json = {
        count: 5
    };
    var obj = new observable.Observable(json);

    var receivedCount = 0;
    var callback = function (data: observable.PropertyChangeData) {
        receivedCount++;
        TKUnit.assert(data.eventName === observable.Observable.propertyChangeEvent, "Expected event name " + observable.Observable.propertyChangeEvent);
        TKUnit.assert(data.object === obj, "PropertyChangeData.object value not valid.");
        TKUnit.assert(data.propertyName === "count", "PropertyChangeData.propertyName value not valid.");
        TKUnit.assert(data.value === 6, "PropertyChangeData.value value not valid.");
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback);

    (<any>obj).count++;

    TKUnit.assert(receivedCount === 1, "PropertyChanged event not raised properly.");
}

export var test_Observable_WhenCreatedWithJSON_PropertyChangedWithBracketsNotation_RaisesPropertyChangedEvent = function () {
    var json = {
        count: 5
    };
    var obj = new observable.Observable(json);

    var receivedCount = 0;
    var callback = function (data: observable.PropertyChangeData) {
        receivedCount++;
        TKUnit.assert(data.eventName === observable.Observable.propertyChangeEvent, "Expected event name " + observable.Observable.propertyChangeEvent);
        TKUnit.assert(data.object === obj, "PropertyChangeData.object value not valid.");
        TKUnit.assert(data.propertyName === "count", "PropertyChangeData.propertyName value not valid.");
        TKUnit.assert(data.value === 6, "PropertyChangeData.value value not valid.");
    }

    obj.addEventListener(observable.Observable.propertyChangeEvent, callback);

    obj["count"]++;

    TKUnit.assert(receivedCount === 1, "PropertyChanged event not raised properly.");
}

export function test_AddingTwoEventHandlersAndRemovingWithinHandlerShouldRaiseAllEvents() {
    var observableInstance = new observable.Observable();
    var firstHandlerCalled = false;
    var secondHandlerCalled= false;

    var firstHandler = function (args) {
        observableInstance.off(observable.Observable.propertyChangeEvent, firstHandler, firstObserver);
        firstHandlerCalled = true;
    }

    var secondHandler = function (args) {
        observableInstance.off(observable.Observable.propertyChangeEvent, secondHandler, secondObserver);
        secondHandlerCalled = true;
    }

    var firstObserver = new observable.Observable();
    var secondObserver = new observable.Observable();

    observableInstance.on(observable.Observable.propertyChangeEvent, firstHandler, firstObserver);
    observableInstance.on(observable.Observable.propertyChangeEvent, secondHandler, secondObserver);

    observableInstance.set("someProperty", "some value");

    TKUnit.assertEqual(firstHandlerCalled, true);
    TKUnit.assertEqual(secondHandlerCalled, true);
}
