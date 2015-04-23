import TKUnit = require("./TKUnit");
import bindableModule = require("ui/core/bindable");
require("globals");

// <snippet module="data/observable-array" title="observable-array">
// # Observable Array module
// ``` JavaScript
import observableArrayModule = require("data/observable-array");
// ```
// </snippet>

require("globals");

export var test_ObservableArray_shouldCopySourceArrayItems = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Create ObservableArray from array.
    // ``` JavaScript
    var sa = [1, 2, 3];
    var array = new observableArrayModule.ObservableArray(sa);
    // ```
    // </snippet>

    TKUnit.assert(sa.length === array.length && array.length === 3, "ObservableArray should copy all source array items!");
};

export var test_ObservableArray_shouldCopyMultipleItemsAsSource = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Create ObservableArray from arguments.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(1, 2, 3);
    // ```
    // </snippet>

    TKUnit.assert(array.length === 3 && array.getItem(1) === 2, "ObservableArray should copy multiple items from source!");
};

export var test_ObservableArray_shouldCreateArrayFromSpecifiedLength = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Create ObservableArray with specific length.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(100);
    // ```
    // </snippet>

    TKUnit.assert(array.length === 100, "ObservableArray should create array from specified length!");
};

export var test_ObservableArray_getItemShouldReturnCorrectItem = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Get item at specified index using getItem(index) method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var firstItem = array.getItem(0);
    var secondItem = array.getItem(1);
    var thirdItem = array.getItem(2);
    // ```
    // </snippet>

    TKUnit.assert(firstItem === 1 && secondItem === 2 && thirdItem === 3, "ObservableArray getItem() should return correct item!");
};

export var test_ObservableArray_setItemShouldSetCorrectItem = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Set item at specified index using setItem(index, item) method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.setItem(1, 5);
    // ```
    // </snippet>
    TKUnit.assert(array.getItem(1) === 5, "ObservableArray setItem() should set correct item!");
};

export var test_ObservableArray_concatShouldReturnNewArrayWithNewItemsAtTheEnd = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use concat() method to combine ObservableArray with array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.concat([4, 5, 6]);
    // ```
    // </snippet>
    TKUnit.assert(result.length === 6 && result[4] === 5, "ObservableArray concat() should add items at the end!");
};

export var test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithComma = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use join() method to convert ObservableArray to comma separated string.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.join();
    // ```
    // </snippet>
    TKUnit.assert(result === "1,2,3", "ObservableArray join() should return string with all items separated with comma!");
};

export var test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithDot = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use join(separator) method to convert ObservableArray to string separated with specified separator.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.join(".");
    // ```
    // </snippet>
    TKUnit.assert(result === "1.2.3", "ObservableArray join() should return string with all items separated with dot!");
};

export var test_ObservableArray_popShouldRemoveTheLastElement = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use pop() method to remove the last element.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.pop();
    // ```
    // </snippet>
    TKUnit.assert(result === 3 && array.length === 2, "ObservableArray pop() should remove last element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_popShouldRemoveTheLastElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling pop() method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var index = array.length - 1;
    // </hide>

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "delete".
        //// args.index is equal to the array length - 1.
        //// args.removed.length is 1.
        //// args.addedCount is 0.

        // <hide>
        result = args;
        // </hide>
    });

    array.pop();
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Delete &&
        result.removed.length === 1 && result.index === index && result.addedCount === 0, "ObservableArray pop() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElement = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use push() method to add single element to the array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.push(4);
    // ```
    // </snippet>
    TKUnit.assert(result === 4 && array.getItem(3) === 4, "ObservableArray push() should append new element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling push() method with single element.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "add".
        //// args.index is equal to the array length.
        //// args.removed.length is 0.
        //// args.addedCount is 1.

        // <hide>
        result = args;
        // </hide>
    });

    array.push(4);
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 1, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElements = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use push() method to add multiple elements to the array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.push(4, 5, 6);
    // ```
    // </snippet>
    TKUnit.assert(result === 6 && array.getItem(5) === 6, "ObservableArray push() should append new elements!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementsAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling push() method with multiple elements.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "add".
        //// args.index is equal to the array length.
        //// args.removed.length is 0.
        //// args.addedCount is equal to the number of added items.

        // <hide>
        result = args;
        // </hide>
    });

    array.push(4, 5, 6);
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElementsFromSourceArray = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use push() method to add multiple elements from source array to the ObservableArray.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.push([4, 5, 6]);
    // ```
    // </snippet>
    TKUnit.assert(result === 6 && array.getItem(5) === 6, "ObservableArray push() should append new elements from source array!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementsFromSourceArrayAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling push() method with multiple elements from source array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "add".
        //// args.index is equal to the array length.
        //// args.removed.length is 0.
        //// args.addedCount is equal to the number of added items.

        // <hide>
        result = args;
        // </hide>
    });

    array.push([4, 5, 6]);
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_reverseShouldReturnNewReversedArray = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use reverse() method to reverse the elements order of the ObservableArray.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.reverse();
    // ```
    // </snippet>
    TKUnit.assert(result.length === 3 && result[0] === 3, "ObservableArray reverse() should return new reversed array!");
};

export var test_ObservableArray_shiftShouldRemoveTheFirstElement = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use shift() method to remove the first element of the array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.shift();
    // ```
    // </snippet>
    TKUnit.assert(result === 1 && array.length === 2, "ObservableArray shift() should remove first element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_shiftShouldRemoveTheFirstElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling shift() method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "delete".
        //// args.index is 0.
        //// args.removed.length is 1.
        //// args.addedCount is 0.

        // <hide>
        result = args;
        // </hide>
    });

    array.shift();
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Delete &&
        result.removed.length === 1 && result.index === 0 && result.addedCount === 0, "ObservableArray shift() should raise 'change' event with correct args!");
};

export var test_ObservableArray_sliceShouldReturnSectionAsNewArray = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use slice() method to return array with all ObservableArray elements. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.slice();
    // ```
    // </snippet>
    TKUnit.assert(result[2] === 3 && result.length === 3, "ObservableArray slice() should return section!");
};

export var test_ObservableArray_sliceWithParamsShouldReturnSectionAsNewArray = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use slice(star, end) method to return section of the array. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3, 4, 5]);
    var result = array.slice(2, 4);
    // ```
    // </snippet>
    TKUnit.assert(result[1] === 4 && result.length === 2, "ObservableArray slice() should return section according to specified arguments!");
};

export var test_ObservableArray_sortShouldReturnNewSortedArray = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use sort() method to sort the array. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([3, 2, 1]);
    var result = array.sort();
    // ```
    // </snippet>
    TKUnit.assert(result[0] === 1 && result.length === 3, "ObservableArray sort() should return new sorted array!");
};

export var test_ObservableArray_sortShouldReturnNewSortedArrayAccordingSpecifiedOrder = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use sort(compareFunction) method to sort the array with your own comparing logic. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([10, 100, 1]);
    var result = array.sort((a: number, b: number) => { return a - b; });
    // ```
    // </snippet>
    TKUnit.assert(result[2] === 100 && result.length === 3, "ObservableArray sort() should return new sorted array according to specified order!");
};

export var test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndex = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use splice(start, deleteCount) method to delete elements in the array. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.splice(1, 2);
    // ```
    // </snippet>
    TKUnit.assert(result.length === 2 && result[0] === "two" && array.length === 1 && array.getItem(0) === "one",
        "ObservableArray splice() should remove specified number of elements starting from specified index!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling splice(start, deleteCount) method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "splice".
        //// args.index is the start index.
        //// args.removed.length is equal to the number of deleted items.
        //// args.addedCount is 0.

        // <hide>
        result = args;
        // </hide>
    });

    array.splice(1, 2);
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Splice &&
        result.removed.length === 2 && result.index === 1 && result.addedCount === 0, "ObservableArray splice() should raise 'change' event with correct args!");
};

export var test_ObservableArray_spliceShouldInsertNewItemsInPlaceOfRemovedItemsStartingFromSpecifiedIndex = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use splice(start, deleteCount, ...arguments) method to remove and insert elements in the array. 
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.splice(1, 2, "six", "seven");
    // ```
    // </snippet>
    TKUnit.assert(result.length === 2 && result[0] === "two" && array.length === 3 && array.getItem(2) === "seven",
        "ObservableArray splice() should insert new items in place of removed!");
};

export var test_ObservableArray_spliceShouldRemoveAndInertSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling splice(start, deleteCount, ...arguments) method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "splice".
        //// args.index is the start index.
        //// args.removed.length is equal to the number of deleted items.
        //// args.addedCount is equal to the delta between number of inserted items and number of deleted items but not less than 0.

        // <hide>
        result = args;
        // </hide>
    });

    array.splice(1, 2, "six", "seven", "eight");
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Splice &&
        result.removed.length === 2 && result.index === 1 && result.addedCount === 1, "ObservableArray splice() should raise 'change' event with correct args!");
};

export var test_ObservableArray_unshiftShouldInsertNewElementsFromTheStart = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use unshift(item1, item2... itemN) method to insert elements from the start of the array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // <hide>
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // </hide>
    var result = array.unshift(4, 5);
    // ```
    // </snippet>

    TKUnit.assert(array.getItem(0) === 4 && result === 5 && array.length === 5, "ObservableArray unshift() should insert new elements from the start!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_unshiftShouldInsertNewElementsFromTheStartAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // <snippet module="data/observable-array" title="observable-array">
    // ### Handle "change" event to know more info about the change after calling unshift(item1, item2... itemN) method.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "add".
        //// args.index is 0.
        //// args.removed.length is 0.
        //// args.addedCount is equal to the number of inserted items.

        // <hide>
        result = args;
        // </hide>
    });

    array.unshift(4, 5);
    // ```
    // </snippet>

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 0 && result.addedCount === 2, "ObservableArray unshift() should raise 'change' event with correct args!");
};

export var test_ObservableArray_indexOfShouldReturnCorrectIndex = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use indexOf(item) method to get the index of the desired item in the array.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.indexOf("two");
    // ```
    // </snippet>
    TKUnit.assert(result === 1, "ObservableArray indexOf() should return correct index!");
};

export var test_ObservableArray_indexOfShouldReturnCorrectIndexStartingFrom = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use indexOf(item, fromIndex) method to get the index of the desired item in the array starting from specified index.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.indexOf("two", 2);
    // ```
    // </snippet>
    TKUnit.assert(result === -1, "ObservableArray indexOf() should return correct index!");
};

export var test_ObservableArray_lastIndexOfShouldReturnCorrectIndex = function () {
    var array = new observableArrayModule.ObservableArray(["one", "two", "two", "three"]);
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use lastIndexOf(item) method to get the last index of the desired item in the array.
    // ``` JavaScript
    var result = array.lastIndexOf("two");
    // ```
    // </snippet>
   TKUnit.assert(result === 2, "ObservableArray lastIndexOf() should return correct index!");
};

export var test_ObservableArray_lastIndexOfShouldReturnCorrectIndexStartingFrom = function () {
    // <snippet module="data/observable-array" title="observable-array">
    // ### Use lastIndexOf(item, fromIndex) method to get the last index of the desired item in the array starting from specified index.
    // ``` JavaScript
    var array = new observableArrayModule.ObservableArray(["one", "two", "two", "one", "three"]);
    var result = array.lastIndexOf("two", 1);
    // ```
    // </snippet>
    TKUnit.assert(result === 1, "ObservableArray lastIndexOf() should return correct index!");
};

var array = new observableArrayModule.ObservableArray();

// We do not have indexer!
export var test_getItem_isDefined = function () {
    TKUnit.assert(typeof (array.getItem) === "function", "Method 'getItem()' should be defined!");
};

export var test_setItem_isDefined = function () {
    TKUnit.assert(typeof (array.setItem) === "function", "Method 'setItem()' should be defined!");
};

// Standard array properties and methods
export var test_length_isDefined = function () {
    TKUnit.assert(typeof (array.length) === "number", "Property 'length' should be defined!");
};

export var test_toString_isDefined = function () {
    TKUnit.assert(typeof (array.toString) === "function", "Method 'toString()' should be defined!");
};

export var test_toLocaleString_isDefined = function () {
    TKUnit.assert(typeof (array.toLocaleString) === "function", "Method 'toString()' should be defined!");
};

export var test_concat_isDefined = function () {
    TKUnit.assert(typeof (array.concat) === "function", "Method 'concat()' should be defined!");
};

export var test_join_isDefined = function () {
    TKUnit.assert(typeof (array.join) === "function", "Method 'join()' should be defined!");
};

export var test_pop_isDefined = function () {
    TKUnit.assert(typeof (array.pop) === "function", "Method 'pop()' should be defined!");
};

export var test_push_isDefined = function () {
    TKUnit.assert(typeof (array.push) === "function", "Method 'push()' should be defined!");
};

export var test_reverse_isDefined = function () {
    TKUnit.assert(typeof (array.reverse) === "function", "Method 'reverse()' should be defined!");
};

export var test_shift_isDefined = function () {
    TKUnit.assert(typeof (array.shift) === "function", "Method 'shift()' should be defined!");
};

export var test_slice_isDefined = function () {
    TKUnit.assert(typeof (array.slice) === "function", "Method 'slice()' should be defined!");
};

export var test_sort_isDefined = function () {
    TKUnit.assert(typeof (array.sort) === "function", "Method 'sort()' should be defined!");
};

export var test_splice_isDefined = function () {
    TKUnit.assert(typeof (array.splice) === "function", "Method 'splice()' should be defined!");
};

export var test_unshift_isDefined = function () {
    TKUnit.assert(typeof (array.unshift) === "function", "Method 'unshift()' should be defined!");
};

export var test_indexOf_isDefined = function () {
    TKUnit.assert(typeof (array.indexOf) === "function", "Method 'indexOf()' should be defined!");
};

export var test_lastIndexOf_isDefined = function () {
    TKUnit.assert(typeof (array.lastIndexOf) === "function", "Method 'lastIndexOf()' should be defined!");
};

export var test_every_isDefined = function () {
    TKUnit.assert(typeof (array.every) === "function", "Method 'every()' should be defined!");
};

export var test_some_isDefined = function () {
    TKUnit.assert(typeof (array.some) === "function", "Method 'some()' should be defined!");
};

export var test_forEach_isDefined = function () {
    TKUnit.assert(typeof (array.forEach) === "function", "Method 'forEach()' should be defined!");
};

export var test_map_isDefined = function () {
    TKUnit.assert(typeof (array.map) === "function", "Method 'map()' should be defined!");
};

export var test_filter_isDefined = function () {
    TKUnit.assert(typeof (array.filter) === "function", "Method 'filter()' should be defined!");
};

export var test_reduce_isDefined = function () {
    TKUnit.assert(typeof (array.reduce) === "function", "Method 'reduce()' should be defined!");
};

export var test_reduceRight_isDefined = function () {
    TKUnit.assert(typeof (array.reduceRight) === "function", "Method 'reduceRight()' should be defined!");
};
