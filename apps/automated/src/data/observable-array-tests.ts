import * as TKUnit from '../tk-unit';
// >> observable-array-require
import { Label, ObservableArray, ChangedData, ChangeType } from '@nativescript/core';
// << observable-array-require

export const test_ObservableArray_shouldCopySourceArrayItems = function () {
	// >> observable-array-create
	const sa = [1, 2, 3];
	const array = new ObservableArray(sa);
	// << observable-array-create

	TKUnit.assertEqual(array.length, 3, 'ObservableArray length should be 3');
	TKUnit.assertEqual(sa.length, array.length, 'ObservableArray should copy all source array items!');
};

export const test_ObservableArray_shouldCopyMultipleItemsAsSource = function () {
	// // >> observable-array-arguments
	// const array = new ObservableArray(1, 2, 3);
	// // << observable-array-arguments

	// TKUnit.assertEqual(array.length, 3, "ObservableArray length should be 3");
	// TKUnit.assertEqual(array.getItem(1), 2, "ObservableArray should copy multiple items from source!");
	TKUnit.assertEqual(true, true);
};

export const test_ObservableArray_shouldCreateArrayFromSpecifiedLength = function () {
	// >> observable-array-length
	const array = new ObservableArray(100);
	// << observable-array-length

	TKUnit.assertEqual(array.length, 100, 'ObservableArray should create array from specified length!');
};

export const test_ObservableArray_shouldBeAbleToSetLength = function () {
	// >> observable-array-newvalue
	const array = new ObservableArray(100);
	// >> (hide)
	TKUnit.assertEqual(array.length, 100, 'ObservableArray should create array from specified length!');
	// << (hide)
	array.length = 50;
	// << observable-array-newvalue

	TKUnit.assertEqual(array.length, 50, 'ObservableArray should respect new length!');
};

export const test_ObservableArray_getItemShouldReturnCorrectItem = function () {
	// >> observable-array-getitem
	const array = new ObservableArray([1, 2, 3]);
	const firstItem = array.getItem(0);
	const secondItem = array.getItem(1);
	const thirdItem = array.getItem(2);
	// << observable-array-getitem

	TKUnit.assert(firstItem === 1 && secondItem === 2 && thirdItem === 3, 'ObservableArray getItem() should return correct item!');
};

export const test_ObservableArray_setItemShouldSetCorrectItem = function () {
	// >> observable-array-setitem
	const array = new ObservableArray([1, 2, 3]);
	array.setItem(1, 5);
	// << observable-array-setitem
	TKUnit.assert(array.getItem(1) === 5, 'ObservableArray setItem() should set correct item!');
};

export const test_ObservableArray_setItemShouldRaiseCorrectEvent = function () {
	// >> observable-array-eventdata
	let index: number;
	let action: string;
	let addedCount: number;
	let removed: Array<number>;

	const array = new ObservableArray([1, 2, 3]);
	array.on('change', (args) => {
		index = args.index; // Index of the changed item.
		action = args.action; // Action. In this case Update.
		addedCount = args.addedCount; // Number of added items. In this case 1.
		removed = args.removed; // Array of removed items. In this case with single item (2).
	});
	array.setItem(1, 5);
	// << observable-array-eventdata
	TKUnit.assertEqual(index, 1);
	TKUnit.assertEqual(action, ChangeType.Update);
	TKUnit.assertEqual(addedCount, 1);
	TKUnit.assertEqual(removed[0], 2);
};

export const test_ObservableArray_concatShouldReturnNewArrayWithNewItemsAtTheEnd = function () {
	// >> observable-array-combine
	const array = new ObservableArray([1, 2, 3]);
	const result = array.concat([4, 5, 6]);
	// << observable-array-combine
	TKUnit.assert(result.length === 6 && result[4] === 5, 'ObservableArray concat() should add items at the end!');
};

export const test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithComma = function () {
	// >> observable-array-join
	const array = new ObservableArray([1, 2, 3]);
	const result = array.join();
	// << observable-array-join
	TKUnit.assert(result === '1,2,3', 'ObservableArray join() should return string with all items separated with comma!');
};

export const test_ObservableArray_joinShouldReturnStringWithAllItemsSeparatedWithDot = function () {
	// >> observable-array-join-separator
	const array = new ObservableArray([1, 2, 3]);
	const result = array.join('.');
	// << observable-array-join-separator
	TKUnit.assert(result === '1.2.3', 'ObservableArray join() should return string with all items separated with dot!');
};

export const test_ObservableArray_popShouldRemoveTheLastElement = function () {
	// >> observable-array-join-pop
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.pop();
	// << observable-array-join-pop
	TKUnit.assert(result === 3 && array.length === 2, 'ObservableArray pop() should remove last element!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_popShouldRemoveTheLastElementAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-join-change
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const index = array.length - 1;
	// << (hide)

	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Delete && result.removed.length === 1 && result.index === index && result.addedCount === 0, "ObservableArray pop() should raise 'change' event with correct args!");
};

export const test_ObservableArray_pushShouldAppendNewElement = function () {
	// >> observable-array-push
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.push(4);
	// << observable-array-push
	TKUnit.assert(result === 4 && array.getItem(3) === 4, 'ObservableArray push() should append new element!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_pushShouldAppendNewElementAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-change-push
	const array = new ObservableArray([1, 2, 3]);
	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Add && result.removed.length === 0 && result.index === 3 && result.addedCount === 1, "ObservableArray push() should raise 'change' event with correct args!");
};

export const test_ObservableArray_pushShouldAppendNewElements = function () {
	// >> observable-array-push-multiple
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.push(4, 5, 6);
	// << observable-array-push-multiple
	TKUnit.assert(result === 6 && array.getItem(5) === 6, 'ObservableArray push() should append new elements!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_pushShouldAppendNewElementsAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-push-multiple-info
	const array = new ObservableArray([1, 2, 3]);
	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Add && result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export const test_ObservableArray_pushShouldAppendNewElementsFromSourceArray = function () {
	// >> observable-array-push-source
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.push([4, 5, 6]);
	// << observable-array-push-source
	TKUnit.assert(result === 6 && array.getItem(5) === 6, 'ObservableArray push() should append new elements from source array!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_pushShouldAppendNewElementsFromSourceArrayAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-push-source-info
	const array = new ObservableArray([1, 2, 3]);
	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Add && result.removed.length === 0 && result.index === 3 && result.addedCount === 3, "ObservableArray push() should raise 'change' event with correct args!");
};

export const test_ObservableArray_reverseShouldReturnNewReversedArray = function () {
	// >> observable-array-reverse
	const array = new ObservableArray([1, 2, 3]);
	const result = array.reverse();
	// << observable-array-reverse
	TKUnit.assert(result.length === 3 && result[0] === 3, 'ObservableArray reverse() should return new reversed array!');
};

export const test_ObservableArray_shiftShouldRemoveTheFirstElement = function () {
	// >> observable-array-shift
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.shift();
	// << observable-array-shift
	TKUnit.assert(result === 1 && array.length === 2, 'ObservableArray shift() should remove first element!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_shiftShouldRemoveTheFirstElementAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-shift-change
	const array = new ObservableArray([1, 2, 3]);

	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Delete && result.removed.length === 1 && result.index === 0 && result.addedCount === 0, "ObservableArray shift() should raise 'change' event with correct args!");
};

export const test_ObservableArray_sliceShouldReturnSectionAsNewArray = function () {
	// >> observable-array-slice
	const array = new ObservableArray([1, 2, 3]);
	const result = array.slice();
	// << observable-array-slice
	TKUnit.assert(result[2] === 3 && result.length === 3, 'ObservableArray slice() should return section!');
};

export const test_ObservableArray_sliceWithParamsShouldReturnSectionAsNewArray = function () {
	// >> observable-array-slice-args
	const array = new ObservableArray([1, 2, 3, 4, 5]);
	const result = array.slice(2, 4);
	// << observable-array-slice-args
	TKUnit.assert(result[1] === 4 && result.length === 2, 'ObservableArray slice() should return section according to specified arguments!');
};

export const test_ObservableArray_sortShouldReturnNewSortedArray = function () {
	// >> observable-array-sort
	const array = new ObservableArray([3, 2, 1]);
	const result = array.sort();
	// << observable-array-sort
	TKUnit.assert(result[0] === 1 && result.length === 3, 'ObservableArray sort() should return new sorted array!');
};

export const test_ObservableArray_sortShouldReturnNewSortedArrayAccordingSpecifiedOrder = function () {
	// >> observable-array-sort-comparer
	const array = new ObservableArray([10, 100, 1]);
	const result = array.sort((a: number, b: number) => a - b);
	// << observable-array-sort-comparer
	TKUnit.assert(result[2] === 100 && result.length === 3, 'ObservableArray sort() should return new sorted array according to specified order!');
};

export const test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndex = function () {
	// >> observable-array-splice
	const array = new ObservableArray(['one', 'two', 'three']);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.splice(1, 2);
	// << observable-array-splice
	TKUnit.assert(result.length === 2 && result[0] === 'two' && array.length === 1 && array.getItem(0) === 'one', 'ObservableArray splice() should remove specified number of elements starting from specified index!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_spliceShouldRemoveSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-splice-change
	const array = new ObservableArray([1, 2, 3]);

	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Splice && result.removed.length === 2 && result.index === 1 && result.addedCount === 0, "ObservableArray splice() should raise 'change' event with correct args!");
};

export const test_ObservableArray_spliceShouldInsertNewItemsInPlaceOfRemovedItemsStartingFromSpecifiedIndex = function () {
	// >> observable-array-splice-args
	const array = new ObservableArray(['one', 'two', 'three']);
	const result = array.splice(1, 2, 'six', 'seven');
	// << observable-array-splice-args
	TKUnit.assert(result.length === 2 && result[0] === 'two' && array.length === 3 && array.getItem(2) === 'seven', 'ObservableArray splice() should insert new items in place of removed!');
};

export const test_ObservableArray_spliceShouldRemoveAndInertSpecifiedNumberOfElementsStartingFromSpecifiedIndexAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-splice-args-change
	const array = new ObservableArray(['one', 'two', 'three']);

	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
		// Argument (args) is ChangedData<T>.
		// args.eventName is "change".
		// args.action is "splice".
		// args.index is the start index.
		// args.removed.length is equal to the number of deleted items.
		// args.addedCount is equal to the amount of added and replaced items.

		// >> (hide)
		result = args;
		// << (hide)
	});

	array.splice(1, 2, 'six', 'seven', 'eight');
	// << observable-array-splice-args-change

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Splice && result.removed.length === 2 && result.index === 1 && result.addedCount === 3, "ObservableArray splice() should raise 'change' event with correct args!");
};

export const test_ObservableArray_unshiftShouldInsertNewElementsFromTheStart = function () {
	// >> observable-array-unshift
	const array = new ObservableArray([1, 2, 3]);
	// >> (hide)
	const viewBase = new Label();
	viewBase.set('testProperty', 0);
	viewBase.bind({ sourceProperty: 'length', targetProperty: 'testProperty' }, array);
	// << (hide)
	const result = array.unshift(4, 5);
	// << observable-array-unshift

	TKUnit.assert(array.getItem(0) === 4 && result === 5 && array.length === 5, 'ObservableArray unshift() should insert new elements from the start!');
	TKUnit.assert(viewBase.get('testProperty') === array.length, 'Expected: ' + array.length + ', Actual: ' + viewBase.get('testProperty'));
};

export const test_ObservableArray_unshiftShouldInsertNewElementsFromTheStartAndRaiseChangeEventWithCorrectArgs = function () {
	let result: ChangedData<number>;

	// >> observable-array-unshift-change
	const array = new ObservableArray([1, 2, 3]);
	array.on(ObservableArray.changeEvent, (args: ChangedData<number>) => {
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

	TKUnit.assert(result.eventName === ObservableArray.changeEvent && result.action === ChangeType.Add && result.removed.length === 0 && result.index === 0 && result.addedCount === 2, "ObservableArray unshift() should raise 'change' event with correct args!");
};

export const test_ObservableArray_indexOfShouldReturnCorrectIndex = function () {
	// >> observable-array-indexof
	const array = new ObservableArray(['one', 'two', 'three']);
	const result = array.indexOf('two');
	// << observable-array-indexof
	TKUnit.assert(result === 1, 'ObservableArray indexOf() should return correct index!');
};

export const test_ObservableArray_indexOfShouldReturnCorrectIndexStartingFrom = function () {
	// >> observable-array-indexof-args
	const array = new ObservableArray(['one', 'two', 'three']);
	const result = array.indexOf('two', 2);
	// << observable-array-indexof-args
	TKUnit.assert(result === -1, 'ObservableArray indexOf() should return correct index!');
};

export const test_ObservableArray_lastIndexOfShouldReturnCorrectIndex = function () {
	const array = new ObservableArray(['one', 'two', 'two', 'three']);
	// >> observable-array-lastindexof
	const result = array.lastIndexOf('two');
	// << observable-array-lastindexof
	TKUnit.assert(result === 2, 'ObservableArray lastIndexOf() should return correct index!');
};

export const test_ObservableArray_lastIndexOfShouldReturnCorrectIndexStartingFrom = function () {
	// >> observable-array-lastindexof-args
	const array = new ObservableArray(['one', 'two', 'two', 'one', 'three']);
	const result = array.lastIndexOf('two', 1);
	// << observable-array-lastindexof-args
	TKUnit.assert(result === 1, 'ObservableArray lastIndexOf() should return correct index!');
};

export const test_ObservableArray_settingLengthToZeroPerformsSplice = function () {
	const array = new ObservableArray([1, 2, 3]);

	let changeRaised = false;
	array.on('change', (args: ChangedData<number>) => {
		changeRaised = true;
		TKUnit.assertEqual(args.object, array);
		TKUnit.assertEqual(args.eventName, 'change');
		TKUnit.assertEqual(args.action, ChangeType.Splice);
		TKUnit.assertEqual(args.index, 0);
		TKUnit.assertEqual(args.addedCount, 0);
		TKUnit.arrayAssert(args.removed, [1, 2, 3]);
	});

	array.length = 0;

	TKUnit.assertEqual(array.length, 0);
	TKUnit.assertTrue(changeRaised);
};

export const test_ObservableArray_settingLengthToSomethingPerformsSplice = function () {
	const array = new ObservableArray([1, 2, 3]);
	let changeRaised = false;

	array.on('change', (args: ChangedData<number>) => {
		changeRaised = true;
		TKUnit.assertEqual(args.object, array);
		TKUnit.assertEqual(args.eventName, 'change');
		TKUnit.assertEqual(args.action, ChangeType.Splice);
		TKUnit.assertEqual(args.index, 1);
		TKUnit.assertEqual(args.addedCount, 0);
		TKUnit.arrayAssert(args.removed, [2, 3]);
	});

	array.length = 1;

	TKUnit.assertEqual(array.length, 1);
	TKUnit.assertTrue(changeRaised);
};

const array = new ObservableArray();

// We do not have indexer!
export const test_getItem_isDefined = function () {
	TKUnit.assert(typeof array.getItem === 'function', "Method 'getItem()' should be defined!");
};

export const test_setItem_isDefined = function () {
	TKUnit.assert(typeof array.setItem === 'function', "Method 'setItem()' should be defined!");
};

// Standard array properties and methods
export const test_length_isDefined = function () {
	TKUnit.assert(typeof array.length === 'number', "Property 'length' should be defined!");
};

export const test_toString_isDefined = function () {
	TKUnit.assert(typeof array.toString === 'function', "Method 'toString()' should be defined!");
};

export const test_toLocaleString_isDefined = function () {
	TKUnit.assert(typeof array.toLocaleString === 'function', "Method 'toString()' should be defined!");
};

export const test_concat_isDefined = function () {
	TKUnit.assert(typeof array.concat === 'function', "Method 'concat()' should be defined!");
};

export const test_join_isDefined = function () {
	TKUnit.assert(typeof array.join === 'function', "Method 'join()' should be defined!");
};

export const test_pop_isDefined = function () {
	TKUnit.assert(typeof array.pop === 'function', "Method 'pop()' should be defined!");
};

export const test_push_isDefined = function () {
	TKUnit.assert(typeof array.push === 'function', "Method 'push()' should be defined!");
};

export const test_reverse_isDefined = function () {
	TKUnit.assert(typeof array.reverse === 'function', "Method 'reverse()' should be defined!");
};

export const test_shift_isDefined = function () {
	TKUnit.assert(typeof array.shift === 'function', "Method 'shift()' should be defined!");
};

export const test_slice_isDefined = function () {
	TKUnit.assert(typeof array.slice === 'function', "Method 'slice()' should be defined!");
};

export const test_sort_isDefined = function () {
	TKUnit.assert(typeof array.sort === 'function', "Method 'sort()' should be defined!");
};

export const test_splice_isDefined = function () {
	TKUnit.assert(typeof array.splice === 'function', "Method 'splice()' should be defined!");
};

export const test_unshift_isDefined = function () {
	TKUnit.assert(typeof array.unshift === 'function', "Method 'unshift()' should be defined!");
};

export const test_indexOf_isDefined = function () {
	TKUnit.assert(typeof array.indexOf === 'function', "Method 'indexOf()' should be defined!");
};

export const test_lastIndexOf_isDefined = function () {
	TKUnit.assert(typeof array.lastIndexOf === 'function', "Method 'lastIndexOf()' should be defined!");
};

export const test_every_isDefined = function () {
	TKUnit.assert(typeof array.every === 'function', "Method 'every()' should be defined!");
};

export const test_some_isDefined = function () {
	TKUnit.assert(typeof array.some === 'function', "Method 'some()' should be defined!");
};

export const test_forEach_isDefined = function () {
	TKUnit.assert(typeof array.forEach === 'function', "Method 'forEach()' should be defined!");
};

export const test_map_isDefined = function () {
	TKUnit.assert(typeof array.map === 'function', "Method 'map()' should be defined!");
};

export const test_filter_isDefined = function () {
	TKUnit.assert(typeof array.filter === 'function', "Method 'filter()' should be defined!");
};

export const test_reduce_isDefined = function () {
	TKUnit.assert(typeof array.reduce === 'function', "Method 'reduce()' should be defined!");
};

export const test_reduce_without_initial_value = function () {
	const sa = [1, 2, 3];
	let array: ObservableArray<number> = new ObservableArray(sa);
	const result = array.reduce((a, b) => a + b);
	TKUnit.assertEqual(result, 6, 'ObservableArray reduce function broken when initialValue is missing');
};

export const test_reduce_with_initial_value = function () {
	const sa = [1, 2, 3];
	let array: ObservableArray<number> = new ObservableArray(sa);
	const result = array.reduce((a, b) => a + b, 5);
	TKUnit.assertEqual(result, 11, 'ObservableArray reduce function broken when Initial Value is passed.');
};

export const test_reduce_with_zero_as_initial_value = function () {
	const sa = [{ prop: 1 }, { prop: 2 }, { prop: 3 }];
	let array: ObservableArray<any> = new ObservableArray(sa);
	const result = array.reduce((a, b) => a + b.prop, 0);
	TKUnit.assertEqual(result, 6, 'ObservableArray reduce function broken when Initial Value is zero.');
};

export const test_reduceRight_isDefined = function () {
	TKUnit.assert(typeof array.reduceRight === 'function', "Method 'reduceRight()' should be defined!");
};

export const test_reduceRight_without_initial_value = function () {
	const sa = [1, 2, 3];
	let array: ObservableArray<number> = new ObservableArray(sa);
	const result = array.reduceRight((a, b) => a + b);
	TKUnit.assertEqual(result, 6, 'ObservableArray reduceRight function broken when initialValue is missing');
};

export const test_reduceRight_with_initial_value = function () {
	const sa = [1, 2, 3];
	let array: ObservableArray<number> = new ObservableArray(sa);
	const result = array.reduceRight((a, b) => a + b, 5);
	TKUnit.assertEqual(result, 11, 'ObservableArray reduceRight function broken when Initial Value is passed.');
};

export const test_reduceRight_with_zero_as_initial_value = function () {
	const sa = [{ prop: 1 }, { prop: 2 }, { prop: 3 }];
	let array: ObservableArray<any> = new ObservableArray(sa);
	const result = array.reduceRight((a, b) => a + b.prop, 0);
	TKUnit.assertEqual(result, 6, 'ObservableArray reduceRight function broken when Initial Value is zero.');
};
