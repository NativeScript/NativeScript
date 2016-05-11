import TKUnit = require("../TKUnit");
import bindableModule = require("ui/core/bindable");
require("globals");

// >> observable-array-require
import observableArrayModule = require("data/observable-array");
// << observable-array-require

require("globals");

export var test_ObservableArray_shouldCopySourceArrayItems = function () {
    // >> observable-array-create
    var sa = [1, 2, 3];
    var array = new observableArrayModule.ObservableArray(sa);
    // << observable-array-create

    TKUnit.assert(sa.length === array.length && array.length === 3, "ObservableArray should copy all source array items!");
};

export var test_ObservableArray_shouldCopyMultipleItemsAsSource = function () {
    // >> observable-array-arguments
    var array = new observableArrayModule.ObservableArray(1, 2, 3);
    // << observable-array-arguments

    TKUnit.assert(array.length === 3 && array.getItem(1) === 2, "ObservableArray should copy multiple items from source!");
};

export var test_ObservableArray_shouldCreateArrayFromSpecifiedLength = function () {
    // >> observable-array-length
    var array = new observableArrayModule.ObservableArray(100);
    // << observable-array-length

    TKUnit.assert(array.length === 100, "ObservableArray should create array from specified length!");
};

export var test_ObservableArray_shouldBeAbleToSetLength = function () {
    // >> observable-array-newvalue
    var array = new observableArrayModule.ObservableArray(100);
    // >> (hide)
    TKUnit.assert(array.length === 100, "ObservableArray should create array from specified length!");
    // << (hide)
    array.length = 50;
    // << observable-array-newvalue

    TKUnit.assert(array.length === 50, "ObservableArray should respect new length!");
};

export var test_ObservableArray_getItemShouldReturnCorrectItem = function () {
    // >> observable-array-getitem
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var firstItem = array.getItem(0);
    var secondItem = array.getItem(1);
    var thirdItem = array.getItem(2);
    // << observable-array-getitem

    TKUnit.assert(firstItem === 1 && secondItem === 2 && thirdItem === 3, "ObservableArray getItem() should return correct item!");
};

export var test_ObservableArray_setItemShouldSetCorrectItem = function () {
    // >> observable-array-setitem
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.setItem(1, 5);
    // << observable-array-setitem
    TKUnit.assert(array.getItem(1) === 5, "ObservableArray setItem() should set correct item!");
};

export var test_ObservableArray_setItemShouldRaiseCorrectEvent = function () {
    // >> observable-array-eventdata
    var index: number;
    var action: string;
    var addedCount: number;
    var removed: Array<number>;

    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on("change", (args) => {
        index = args.index; // Index of the changed item.
        action = args.action; // Action. In this case Update.
        addedCount = args.addedCount; // Number of added items. In this case 1.
        removed = args.removed; // Array of removed items. In this case with single item (2).
    });
    array.setItem(1, 5);
    // << observable-array-eventdata
    TKUnit.assertEqual(index, 1);
    TKUnit.assertEqual(action, observableArrayModule.ChangeType.Update);
    TKUnit.assertEqual(addedCount, 1);
    TKUnit.assertEqual(removed[0], 2);
};

export var test_ObservableArray_concatShouldReturnNewArrayWithNewItemsAtTheEnd = function () {
    // >> observable-array-combine
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.concat([4, 5, 6]);
    // << observable-array-combine
    TKUnit.assert(result.length === 6 && result[4] === 5, "ObservableArray concat() should add items at the end!");
};

export var test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithComma = function () {
    // >> observable-array-join
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.join();
    // >> observable-array-join
    TKUnit.assert(result === "1,2,3", "ObservableArray join() should return string with all items separated with comma!");
};

export var test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithDot = function () {
    // >> observable-array-join-separator
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.join(".");
    // << observable-array-join-separator
    TKUnit.assert(result === "1.2.3", "ObservableArray join() should return string with all items separated with dot!");
};

export var test_ObservableArray_popShouldRemoveTheLastElement = function () {
    // >> observable-array-join-pop'
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.pop();
    // << observable-array-join-pop'
    TKUnit.assert(result === 3 && array.length === 2, "ObservableArray pop() should remove last element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_popShouldRemoveTheLastElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-join-change
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var index = array.length - 1;
    // << (hide)

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "delete".
        // args.index is equal to the array length - 1.
        // args.removed.length is 1.
        // args.addedCount is 0.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.pop();
    // << observable-array-join-change

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Delete &&
        result.removed.length === 1 && result.index === index && result.addedCount === 0, "ObservableArray pop() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElement = function () {
    // >> observable-array-push
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.push(4);
    // << observable-array-push
    TKUnit.assert(result === 4 && array.getItem(3) === 4, "ObservableArray push() should append new element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-change-push
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "add".
        // args.index is equal to the array length.
        // args.removed.length is 0.
        // args.addedCount is 1.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.push(4);
    // << observable-array-change-push

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 1, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElements = function () {
    // >> observable-array-push-multiple
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.push(4, 5, 6);
    // << observable-array-push-multiple
    TKUnit.assert(result === 6 && array.getItem(5) === 6, "ObservableArray push() should append new elements!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementsAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-push-multiple-info
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "add".
        // args.index is equal to the array length.
        // args.removed.length is 0.
        // args.addedCount is equal to the number of added items.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.push(4, 5, 6);
    // << observable-array-push-multiple-info

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_pushShouldAppendNewElementsFromSourceArray = function () {
    // >> observable-array-push-source
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.push([4, 5, 6]);
    // << observable-array-push-source
    TKUnit.assert(result === 6 && array.getItem(5) === 6, "ObservableArray push() should append new elements from source array!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_pushShouldAppendNewElementsFromSourceArrayAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-push-source-info
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "add".
        // args.index is equal to the array length.
        // args.removed.length is 0.
        // args.addedCount is equal to the number of added items.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.push([4, 5, 6]);
    // << observable-array-push-source-info

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export var test_ObservableArray_reverseShouldReturnNewReversedArray = function () {
    // >> observable-array-reverse
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.reverse();
    // << observable-array-reverse
    TKUnit.assert(result.length === 3 && result[0] === 3, "ObservableArray reverse() should return new reversed array!");
};

export var test_ObservableArray_shiftShouldRemoveTheFirstElement = function () {
    // >> observable-array-shift
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.shift();
    // << observable-array-shift
    TKUnit.assert(result === 1 && array.length === 2, "ObservableArray shift() should remove first element!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_shiftShouldRemoveTheFirstElementAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-shift-change
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "delete".
        // args.index is 0.
        // args.removed.length is 1.
        // args.addedCount is 0.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.shift();
    // << observable-array-shift-change

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Delete &&
        result.removed.length === 1 && result.index === 0 && result.addedCount === 0, "ObservableArray shift() should raise 'change' event with correct args!");
};

export var test_ObservableArray_sliceShouldReturnSectionAsNewArray = function () {
    // observable-array-slice
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    var result = array.slice();
    // << observable-array-slice
    TKUnit.assert(result[2] === 3 && result.length === 3, "ObservableArray slice() should return section!");
};

export var test_ObservableArray_sliceWithParamsShouldReturnSectionAsNewArray = function () {
    // >> observable-array-slice-args
    var array = new observableArrayModule.ObservableArray([1, 2, 3, 4, 5]);
    var result = array.slice(2, 4);
    // << observable-array-slice-args
    TKUnit.assert(result[1] === 4 && result.length === 2, "ObservableArray slice() should return section according to specified arguments!");
};

export var test_ObservableArray_sortShouldReturnNewSortedArray = function () {
    // >> observable-array-sort
    var array = new observableArrayModule.ObservableArray([3, 2, 1]);
    var result = array.sort();
    // << observable-array-sort
    TKUnit.assert(result[0] === 1 && result.length === 3, "ObservableArray sort() should return new sorted array!");
};

export var test_ObservableArray_sortShouldReturnNewSortedArrayAccordingSpecifiedOrder = function () {
    // >> observable-array-sort-comparer
    var array = new observableArrayModule.ObservableArray([10, 100, 1]);
    var result = array.sort((a: number, b: number) => { return a - b; });
    // << observable-array-sort-comparer
    TKUnit.assert(result[2] === 100 && result.length === 3, "ObservableArray sort() should return new sorted array according to specified order!");
};

export var test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndex = function () {
    // >> observable-array-splice
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.splice(1, 2);
    // <, observable-array-splice
    TKUnit.assert(result.length === 2 && result[0] === "two" && array.length === 1 && array.getItem(0) === "one",
        "ObservableArray splice() should remove specified number of elements starting from specified index!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-splice-change
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "splice".
        // args.index is the start index.
        // args.removed.length is equal to the number of deleted items.
        // args.addedCount is 0.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.splice(1, 2);
    // << observable-array-splice-change

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Splice &&
        result.removed.length === 2 && result.index === 1 && result.addedCount === 0, "ObservableArray splice() should raise 'change' event with correct args!");
};

export var test_ObservableArray_spliceShouldInsertNewItemsInPlaceOfRemovedItemsStartingFromSpecifiedIndex = function () {
    // >> observable-array-splice-args
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.splice(1, 2, "six", "seven");
    // << observable-array-splice-args
    TKUnit.assert(result.length === 2 && result[0] === "two" && array.length === 3 && array.getItem(2) === "seven",
        "ObservableArray splice() should insert new items in place of removed!");
};

export var test_ObservableArray_spliceShouldRemoveAndInertSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-splice-args-change
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);

    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        // Argument (args) is ChangedData<T>.
        // args.eventName is "change".
        // args.action is "splice".
        // args.index is the start index.
        // args.removed.length is equal to the number of deleted items.
        // args.addedCount is equal to the delta between number of inserted items and number of deleted items but not less than 0.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.splice(1, 2, "six", "seven", "eight");
    // << observable-array-splice-args-change

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Splice &&
        result.removed.length === 2 && result.index === 1 && result.addedCount === 1, "ObservableArray splice() should raise 'change' event with correct args!");
};

export var test_ObservableArray_unshiftShouldInsertNewElementsFromTheStart = function () {
    // >> observable-array-unshift
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    // >> (hide)
    var bindable = new bindableModule.Bindable();
    bindable.set("testProperty", 0);
    bindable.bind({ sourceProperty: "length", targetProperty: "testProperty" }, array);
    // << (hide)
    var result = array.unshift(4, 5);
    // << observable-array-unshift

    TKUnit.assert(array.getItem(0) === 4 && result === 5 && array.length === 5, "ObservableArray unshift() should insert new elements from the start!");
    TKUnit.assert(bindable.get("testProperty") === array.length, "Expected: " + array.length + ", Actual: " + bindable.get("testProperty"));
};

export var test_ObservableArray_unshiftShouldInsertNewElementsFromTheStartAndRaiseChangeEventWithCorrectArgs = function () {
    var result: observableArrayModule.ChangedData<number>;

    // >> observable-array-unshift-change
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);
    array.on(observableArrayModule.ObservableArray.changeEvent, (args: observableArrayModule.ChangedData<number>) => {
        //// Argument (args) is ChangedData<T>.
        //// args.eventName is "change".
        //// args.action is "add".
        //// args.index is 0.
        //// args.removed.length is 0.
        //// args.addedCount is equal to the number of inserted items.

        // >> (hide)
        result = args;
        // << (hide)
    });

    array.unshift(4, 5);
    // << observable-array-unshift-change

    TKUnit.assert(result.eventName === observableArrayModule.ObservableArray.changeEvent && result.action === observableArrayModule.ChangeType.Add &&
        result.removed.length === 0 && result.index === 0 && result.addedCount === 2, "ObservableArray unshift() should raise 'change' event with correct args!");
};

export var test_ObservableArray_indexOfShouldReturnCorrectIndex = function () {
    // >> observable-array-indexof
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.indexOf("two");
    // << observable-array-indexof
    TKUnit.assert(result === 1, "ObservableArray indexOf() should return correct index!");
};

export var test_ObservableArray_indexOfShouldReturnCorrectIndexStartingFrom = function () {
    // >> observable-array-indexof-args
    var array = new observableArrayModule.ObservableArray(["one", "two", "three"]);
    var result = array.indexOf("two", 2);
    // << observable-array-indexof-args
    TKUnit.assert(result === -1, "ObservableArray indexOf() should return correct index!");
};

export var test_ObservableArray_lastIndexOfShouldReturnCorrectIndex = function () {
    var array = new observableArrayModule.ObservableArray(["one", "two", "two", "three"]);
    // >> observable-array-lastindexof
    var result = array.lastIndexOf("two");
    // << observable-array-lastindexof
    TKUnit.assert(result === 2, "ObservableArray lastIndexOf() should return correct index!");
};

export var test_ObservableArray_lastIndexOfShouldReturnCorrectIndexStartingFrom = function () {
    // >> observable-array-lastindexof-args
    var array = new observableArrayModule.ObservableArray(["one", "two", "two", "one", "three"]);
    var result = array.lastIndexOf("two", 1);
    // << observable-array-lastindexof-args
    TKUnit.assert(result === 1, "ObservableArray lastIndexOf() should return correct index!");
};

export var test_ObservableArray_settingLengthToZeroPerformsSplice = function () {
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    var changeRaised = false;
    array.on("change", (args: observableArrayModule.ChangedData<number>) => {
        changeRaised = true;
        TKUnit.assertEqual(args.object, array);
        TKUnit.assertEqual(args.eventName, "change");
        TKUnit.assertEqual(args.action, observableArrayModule.ChangeType.Splice);
        TKUnit.assertEqual(args.index, 0);
        TKUnit.assertEqual(args.addedCount, 0);
        TKUnit.arrayAssert(args.removed, [1, 2, 3]);
    });

    array.length = 0;

    TKUnit.assertEqual(array.length, 0);
    TKUnit.assertTrue(changeRaised);
};

export var test_ObservableArray_settingLengthToSomethingPerformsSplice = function () {
    var array = new observableArrayModule.ObservableArray([1, 2, 3]);

    var changeRaised = false;
    array.on("change", (args: observableArrayModule.ChangedData<number>) => {
        changeRaised = true;
        TKUnit.assertEqual(args.object, array);
        TKUnit.assertEqual(args.eventName, "change");
        TKUnit.assertEqual(args.action, observableArrayModule.ChangeType.Splice);
        TKUnit.assertEqual(args.index, 1);
        TKUnit.assertEqual(args.addedCount, 0);
        TKUnit.arrayAssert(args.removed, [2, 3]);
    });

    array.length = 1;

    TKUnit.assertEqual(array.length, 1);
    TKUnit.assertTrue(changeRaised);
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
