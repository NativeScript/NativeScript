// >> observable-require
import observable = require("data/observable");
// << observable-require

import dependencyObservable = require("ui/core/dependency-observable");
import TKUnit = require("./TKUnit");
import types = require("utils/types");
import proxy = require("ui/core/proxy");

var TESTED_NAME = "tested";
class TestObservable extends observable.Observable {
    public test() {
        this._emit(TESTED_NAME);
    }
}

export var test_Observable_Constructor = function () {
    // >> observable-creating
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
    // << observable-creating
    TKUnit.assert(name === "John", "Expected name is John");
    TKUnit.assert(age === 34, "Expected age is 34");
    TKUnit.assert(married === true, "Expected married is true");
}

export var tests_DummyTestForCodeSnippet = function () {
    // >> observable-property-change
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
    // << observable-property-change
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

export var test_AddingTwoEventHandlersAndRemovingWithinHandlerShouldRaiseAllEvents = function() {
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

export var test_ObservableCreatedWithJSON_shouldDistinguishSeparateObjects = function () {
    var obj1 = {val: 1};
    var obj2 = {val: 2};
    var observable1 = new observable.Observable(obj1);
    var observable2 = new observable.Observable(obj2);

    var val1 = observable1.get("val");
    var val2 = observable2.get("val");
    TKUnit.assert(val1 === 1 && val2 === 2, `Observable should keep separate objects separate! val1: ${val1}; val2: ${val2};`);

    var propName1;
    var newValue1;
    observable1.on(observable.Observable.propertyChangeEvent, (data: observable.PropertyChangeData) => {
        propName1 = data.propertyName;
        newValue1 = data.value;
    });

    var propName2;
    var newValue2;
    observable2.on(observable.Observable.propertyChangeEvent, (data: observable.PropertyChangeData) => {
        propName2 = data.propertyName;
        newValue2 = data.value;
    });

    observable1.set("val", 10);
    TKUnit.assert(propName1 === "val", "propName1 should be 'val'");
    TKUnit.assert(newValue1 === 10, "newValue1 should be 10");

    observable2.set("val", 20);
    TKUnit.assert(propName2 === "val", "propName2 should be 'val'");
    TKUnit.assert(newValue2 === 20, "newValue2 should be 20");

    val1 = observable1.get("val");
    val2 = observable2.get("val");
    TKUnit.assert(val1 === 10 && val2 === 20, `Observable should keep separate objects separate! val1: ${val1}; val2: ${val2};`);
};

export var test_ObservablesCreatedWithJSON_shouldNotInterfereWithOneAnother = function () {
    var observable1 = new observable.Observable({ property1: 1 });
    var observable2 = new observable.Observable({ property2: 2 });

    TKUnit.assert(observable1.get("property1") === 1, `Expected: 1; Actual: ${observable1.get("property1")}`);
    TKUnit.assert(observable1.get("property2") === undefined, `Expected: undefined; Actual: ${observable1.get("property2") }`);

    TKUnit.assert(observable2.get("property1") === undefined, `Expected: undefined; Actual: ${observable2.get("property1") }`);
    TKUnit.assert(observable2.get("property2") === 2, `Expected: 2; Actual: ${observable2.get("property2") }`);

    var propName1;
    var newValue1;
    observable1.on(observable.Observable.propertyChangeEvent, (data: observable.PropertyChangeData) => {
        propName1 = data.propertyName;
        newValue1 = data.value;
    });

    var propName2;
    var newValue2;
    observable2.on(observable.Observable.propertyChangeEvent, (data: observable.PropertyChangeData) => {
        propName2 = data.propertyName;
        newValue2 = data.value;
    });

    observable1.set("property1", 10);
    TKUnit.assert(propName1 === "property1", "propName1 should be 'property1'");
    TKUnit.assert(newValue1 === 10, "newValue1 should be 10");

    observable2.set("property2", 20);
    TKUnit.assert(propName2 === "property2", "propName2 should be 'property2'");
    TKUnit.assert(newValue2 === 20, "newValue2 should be 20");
};

export function test_ObservablesCreatedWithJSON_shouldNotEmitTwoTimesPropertyChangeEvent() {
    var testObservable = new observable.Observable({ "property1": 1 });
    var propertyChangeCounter = 0;
    var propertyChangeHandler = function (args) {
        propertyChangeCounter++;
    }
    testObservable.on(observable.Observable.propertyChangeEvent, propertyChangeHandler);
    testObservable.set("property1", 2);

    TKUnit.assertEqual(propertyChangeCounter, 1, "PropertyChange event should be fired only once for a single change.");
}

export function test_ObservableShouldEmitPropertyChangeWithSameObjectUsingWrappedValue() {
    var testArray = [1];
    var testObservable = new observable.Observable({ "property1": testArray});
    var propertyChangeCounter = 0;
    var propertyChangeHandler = function (args) {
        propertyChangeCounter++;
    }
    testObservable.on(observable.Observable.propertyChangeEvent, propertyChangeHandler);
    testArray.push(2);
    
    testObservable.set("property1", testArray);

    TKUnit.assertEqual(propertyChangeCounter, 0, "PropertyChange event should not be fired when the same object instance is passed.");
    
    testObservable.set("property1", observable.WrappedValue.wrap(testArray));

    TKUnit.assertEqual(propertyChangeCounter, 1, "PropertyChange event should be fired only once for a single change.");
}

export function test_CorrectEventArgsWhenWrappedValueIsUsed() {
    let testArray = [1];
    let testObservable = new observable.Observable({ "property1": testArray});
    let actualArgsValue = 0;
    let propertyChangeHandler = function (args) {
        actualArgsValue = args.value;
        
    }
    testObservable.on(observable.Observable.propertyChangeEvent, propertyChangeHandler);
    testArray.push(2);
    
    let wrappedArray = observable.WrappedValue.wrap(testArray);
    
    testObservable.set("property1", wrappedArray);

    TKUnit.assertEqual(actualArgsValue, wrappedArray, "PropertyChange event should be fired with correct value in arguments.");
}

export function test_CorrectPropertyValueAfterUsingWrappedValue() {
    let testArray = [1];
    let testObservable = new observable.Observable({ "property1": testArray});
    
    let wrappedArray = observable.WrappedValue.wrap(testArray);
    
    testObservable.set("property1", wrappedArray);

    TKUnit.assertEqual(testObservable.get("property1"), testArray, "WrappedValue is used only to execute property change logic and unwrapped value should be used as proeprty value.");
}