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

	private _array: Array<any>;
	private _addArgs: ChangedData<T>;
	private _deleteArgs: ChangedData<T>;

	/**
	 * Create ObservableArray<T> from source Array<T>.
	 */
	constructor(args?: T[] | number) {
		super();

		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			this._array = arguments[0].slice();
		} else {
			this._array = Array.apply(null, arguments);
		}

		this._addArgs = {
			eventName: CHANGE,
			object: this,
			action: ChangeType.Add,
			index: null,
			removed: new Array(),
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

	/**
	 * Returns item at specified index.
	 */
	getItem(index: number): T {
		return this._array[index];
	}

	/**
	 * Sets item at specified index.
	 */
	setItem(index: number, value: T) {
		let oldValue = this._array[index];
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
			this.splice(value, this._array.length - value);
		}
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
	concat(_args?: any): T[] {
		this._addArgs.index = this._array.length;
		const result = this._array.concat.apply(this._array, arguments);

		return result;
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
	push(...args: any): number {
		this._addArgs.index = this._array.length;

		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			const source = <Array<T>>arguments[0];

			for (let i = 0, l = source.length; i < l; i++) {
				this._array.push(source[i]);
			}
		} else {
			this._array.push.apply(this._array, arguments);
		}

		this._addArgs.addedCount = this._array.length - this._addArgs.index;

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
	 */
	reverse(): T[] {
		return this._array.reverse();
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
	slice(start?: number, end?: number): T[] {
		return this._array.slice(start, end);
	}

	/**
	 * Sorts an array.
	 * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
	 */
	sort(compareFn?: (a: T, b: T) => number): T[] {
		return this._array.sort(compareFn);
	}

	/**
	 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
	 * @param start The zero-based location in the array from which to start removing elements.
	 * @param deleteCount The number of elements to remove.
	 * @param items Elements to insert into the array in place of the deleted elements.
	 */
	splice(start: number, deleteCount?: number, ...items: any): T[] {
		const length = this._array.length;
		const result = this._array.splice.apply(this._array, arguments);

		this.notify(<ChangedData<T>>{
			eventName: CHANGE,
			object: this,
			action: ChangeType.Splice,
			index: Math.max(Math.min(start, this._array.length-1), 0),
			removed: result,
			addedCount: this._array.length + result.length - length,
		});
		if (this._array.length !== length) {
			this._notifyLengthChange();
		}

		return result;
	}

	/**
	 * Inserts new elements at the start of an array.
	 * @param items  Elements to insert at the start of the Array.
	 */
	unshift(...args: any): number {
		const length = this._array.length;
		const result = this._array.unshift.apply(this._array, arguments);

		this._addArgs.index = 0;
		this._addArgs.addedCount = result - length;

		this.notify(this._addArgs);
		this._notifyLengthChange();

		return result;
	}

	/**
	 * Returns the index of the first occurrence of a value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
	 */
	indexOf(searchElement: T, fromIndex?: number): number {
		const index = fromIndex ? fromIndex : 0;
		for (let i = index, l = this._array.length; i < l; i++) {
			if (this._array[i] === searchElement) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Returns the index of the last occurrence of a specified value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
	 */
	lastIndexOf(searchElement: T, fromIndex?: number): number {
		const index = fromIndex ? fromIndex : this._array.length - 1;

		for (let i = index; i >= 0; i--) {
			if (this._array[i] === searchElement) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Determines whether all the members of an array satisfy the specified test.
	 * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean {
		return this._array.every(callbackfn, thisArg);
	}

	/**
	 * Determines whether the specified callback function returns true for any element of an array.
	 * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean {
		return this._array.some(callbackfn, thisArg);
	}

	/**
	 * Performs the specified action for each element in an array.
	 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
		this._array.forEach(callbackfn, thisArg);
	}

	/**
	 * Calls a defined callback function on each element of an array, and returns an array that contains the results.
	 * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
		return this._array.map(callbackfn, thisArg);
	}

	/**
	 * Returns the elements of an array that meet the condition specified in a callback function.
	 * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] {
		return this._array.filter(callbackfn, thisArg);
	}

	/**
	 * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
		return initialValue !== undefined ? this._array.reduce(callbackfn, initialValue) : this._array.reduce(callbackfn);
	}

	/**
	 * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
		return initialValue !== undefined ? this._array.reduceRight(callbackfn, initialValue) : this._array.reduceRight(callbackfn);
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
