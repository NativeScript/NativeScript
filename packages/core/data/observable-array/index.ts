/* eslint-disable prefer-rest-params */
import { Observable, EventData } from '../observable';
import * as types from '../../utils/types';

export class ChangeType {
	static Add = 'add';
	static Delete = 'delete';
	static Update = 'update';
	static Splice = 'splice';
	static Change = 'change';
}

/**
 * Event args for "changed" event.
 */
export interface ChangedData<T> extends EventData {
	/**
	 * Change type.
	 */
	action: string;

	/**
	 * Start index.
	 */
	index: number;

	/**
	 * Removed items.
	 */
	removed: Array<T>;

	/**
	 * Number of added items.
	 */
	addedCount: number;
}

const CHANGE = 'change';

/**
 * Advanced array like class used when you want to be notified when a change occurs.
 */
export class ObservableArray<T> extends Observable {
	/**
	 * String value used when hooking to change event.
	 */
	public static changeEvent = CHANGE;

	private _array: Array<T>;
	private _addArgs: ChangedData<T>;
	private _deleteArgs: ChangedData<T>;

	/**
	 * Create ObservableArray<T> with specified length.
	 */
	constructor(arrayLength?: number);

	/**
	 * Create ObservableArray<T> from source Array<T>.
	 */
	constructor(items: T[]);

	/**
	 * Create ObservableArray<T> from T items.
	 */
	constructor(...items: T[]);

	constructor(_args?: any) {
		super();

		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			this._array = arguments[0].slice();
		} else {
			// eslint-disable-next-line prefer-spread
			this._array = Array.apply(null, arguments);
		}

		this._addArgs = {
			eventName: CHANGE,
			object: this,
			action: ChangeType.Add,
			index: null,
			removed: [],
			addedCount: 1,
		};

		this._deleteArgs = {
			eventName: CHANGE,
			object: this,
			action: ChangeType.Delete,
			index: null,
			removed: null,
			addedCount: 0,
		};
	}

	*[Symbol.iterator]() {
		for (let item of this._array) {
			yield item;
		}
	}

	/**
	 * Returns item at specified position.
	 * Supports relative indexing from the end of the array when passed a negative index.
	 */
	getItem(pos: number): T {
		const index = pos < 0 ? this._array.length + pos : pos;
		return this._array[index];
	}

	/**
	 * Sets item at specified position.
	 * Supports relative indexing from the end of the array when passed a negative index.
	 */
	setItem(pos: number, value: T) {
		const index = pos < 0 ? this._array.length + pos : pos;
		const oldValue = this._array[index];
		this._array[index] = value;

		this.notify(<ChangedData<T>>{
			eventName: CHANGE,
			object: this,
			action: ChangeType.Update,
			index: index,
			removed: [oldValue],
			addedCount: 1,
		});
	}

	/**
	 * Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.
	 */
	get length(): number {
		return this._array.length;
	}

	set length(value: number) {
		if (types.isNumber(value) && this._array && this._array.length !== value) {
			const added = new Array(value > this._array.length ? value - this._array.length : 0);
			this.splice(value, this._array.length - value, ...added);
		}
	}

	toJSON(): Array<any> {
		return this._array;
	}

	/**
	 * Returns a string representation of an array.
	 */
	toString(): string {
		return this._array.toString();
	}

	toLocaleString(): string {
		return this._array.toLocaleString();
	}

	/**
	 * Combines two or more arrays.
	 * @param items Additional items to add to the end of array1.
	 */
	concat(...args): ObservableArray<T> {
		this._addArgs.index = this._array.length;
		const result = this._array.concat(...args);

		return new ObservableArray<T>(result);
	}

	/**
	 * Adds all the elements of an array separated by the specified separator string.
	 * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
	 */
	join(separator?: string): string {
		return this._array.join(separator);
	}

	/**
	 * Removes the last element from an array and returns it.
	 */
	pop(): T {
		this._deleteArgs.index = this._array.length - 1;

		const result = this._array.pop();

		this._deleteArgs.removed = [result];

		this.notify(this._deleteArgs);
		this._notifyLengthChange();

		return result;
	}

	/**
	 * Appends new elements to an array, and returns the new length of the array.
	 * @param item New element of the Array.
	 */
	push(...args: T[]): number {
		const length = this._array.length;
		const result = this._array.push(...args);

		this._addArgs.index = length;
		this._addArgs.addedCount = result - length;

		this.notify(this._addArgs);
		this._notifyLengthChange();

		return this._array.length;
	}

	_notifyLengthChange() {
		const lengthChangedData = this._createPropertyChangeData('length', this._array.length);
		this.notify(lengthChangedData);
	}

	/**
	 * Reverses the elements in an Array.
	 * This method uses 'in place' algorithm.
	 */
	reverse(): ObservableArray<T> {
		this._array.reverse();
		return this;
	}

	/**
	 * Removes the first element from an array and returns it.
	 */
	shift(): T {
		const result = this._array.shift();

		this._deleteArgs.index = 0;
		this._deleteArgs.removed = [result];

		this.notify(this._deleteArgs);
		this._notifyLengthChange();

		return result;
	}

	/**
	 * Returns a section of an array.
	 * @param start The beginning of the specified portion of the array.
	 * @param end The end of the specified portion of the array.
	 */
	slice(start?: number, end?: number): ObservableArray<T> {
		const result = this._array.slice(start, end);
		return new ObservableArray<T>(result);
	}

	/**
	 * Sorts an array.
	 * This method uses 'in place' algorithm.
	 * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
	 */
	sort(compareFn?: (a: T, b: T) => number): ObservableArray<T> {
		this._array.sort(compareFn);
		return this;
	}

	/**
	 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
	 * This method uses 'in place' algorithm.
	 * @param start The zero-based location in the array from which to start removing elements.
	 * @param deleteCount The number of elements to remove.
	 * @param items Elements to insert into the array in place of the deleted elements.
	 */
	splice(start: number, deleteCount?: number, ...items: T[]): ObservableArray<T> {
		const length = this._array.length;
		const result = arguments.length === 1 ? this._array.splice(start) : this._array.splice(start, deleteCount, ...items);

		this.notify(<ChangedData<T>>{
			eventName: CHANGE,
			object: this,
			action: ChangeType.Splice,

			// The logic here is a bit weird; so lets explain why it is written this way
			// First of all, if you ADD any items to the array, we want the index to point to
			//   the first value of the index, so this fixes it when you put a value to high in
			// If you remove items from the array, then the index needs to point to the INDEX
			//   where you removed the item.
			// If you add and remove items, the index will point to the remove location as that
			//   is the index you passed in.
			index: Math.max(Math.min(start, length - (result.length > 0 ? 1 : 0)), 0),
			removed: result,
			addedCount: this._array.length + result.length - length,
		});
		if (this._array.length !== length) {
			this._notifyLengthChange();
		}

		return new ObservableArray<T>(result);
	}

	/**
	 * Inserts new elements at the start of an array.
	 * @param items  Elements to insert at the start of the Array.
	 */
	unshift(...args: T[]): number {
		const length = this._array.length;
		const result = this._array.unshift(...args);

		this._addArgs.index = 0;
		this._addArgs.addedCount = result - length;

		this.notify(this._addArgs);
		this._notifyLengthChange();

		return result;
	}

	/**
	 * Returns the first element in the array where predicate is true, and null otherwise.
	 * @param callbackfn
	 * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
	 */
	find(callbackfn: (value: T, index: number, array: ObservableArray<T>) => any, thisArg?: any): T {
		return this._array.find((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
	}

	/**
	 * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
	 * @param callbackfn
	 * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
	 */
	findIndex(callbackfn: (value: T, index: number, array: ObservableArray<T>) => any, thisArg?: any): number {
		return this._array.findIndex((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
	}

	/**
	 * Determines whether the specified element exists inside the array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
	 */
	includes(searchElement: T, fromIndex?: number): boolean {
		return this._array.includes(searchElement, fromIndex);
	}

	/**
	 * Returns the index of the first occurrence of a value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
	 */
	indexOf(searchElement: T, fromIndex?: number): number {
		return this._array.indexOf(searchElement, fromIndex);
	}

	/**
	 * Returns the index of the last occurrence of a specified value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
	 */
	lastIndexOf(searchElement: T, fromIndex?: number): number {
		return fromIndex !== undefined ? this._array.lastIndexOf(searchElement, fromIndex) : this._array.lastIndexOf(searchElement);
	}

	/**
	 * Determines whether all the members of an array satisfy the specified test.
	 * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	every(callbackfn: (value: T, index: number, array: ObservableArray<T>) => boolean, thisArg?: any): boolean {
		return this._array.every((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
	}

	/**
	 * Determines whether the specified callback function returns true for any element of an array.
	 * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	some(callbackfn: (value: T, index: number, array: ObservableArray<T>) => boolean, thisArg?: any): boolean {
		return this._array.some((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
	}

	/**
	 * Performs the specified action for each element in an array.
	 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	forEach(callbackfn: (value: T, index: number, array: ObservableArray<T>) => void, thisArg?: any): void {
		this._array.forEach((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
	}

	/**
	 * Calls a defined callback function on each element of an array, and returns an array that contains the results.
	 * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	map<U>(callbackfn: (value: T, index: number, array: ObservableArray<T>) => U, thisArg?: any): ObservableArray<U> {
		const result = this._array.map((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
		return new ObservableArray<U>(result);
	}

	/**
	 * Returns the elements of an array that meet the condition specified in a callback function.
	 * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	filter(callbackfn: (value: T, index: number, array: ObservableArray<T>) => boolean, thisArg?: any): ObservableArray<T> {
		const result = this._array.filter((value: T, index: number, array: T[]) => callbackfn(value, index, this), thisArg);
		return new ObservableArray<T>(result);
	}

	/**
	 * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ObservableArray<T>) => T, initialValue?: T): T {
		const callbackWrapper = (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => callbackfn(previousValue, currentValue, currentIndex, this);
		return initialValue !== undefined ? this._array.reduce(callbackWrapper, initialValue) : this._array.reduce(callbackWrapper);
	}

	/**
	 * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: ObservableArray<T>) => T, initialValue?: T): T {
		const callbackWrapper = (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => callbackfn(previousValue, currentValue, currentIndex, this);
		return initialValue !== undefined ? this._array.reduceRight(callbackWrapper, initialValue) : this._array.reduceRight(callbackWrapper);
	}
}

export interface ObservableArray<T> {
	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;

	on(event: 'change', callback: (args: ChangedData<T>) => void, thisArg?: any): void;
}
