import observable = require("data/observable");
import observableArrayDef = require("data/observable-array");

export class ChangeType implements observableArrayDef.ChangeType {
    static Add = "add";
    static Delete = "delete";
    static Update = "update";
    static Splice = "splice";
}

var CHANGE = "change";

export module knownEvents {
    export var change = CHANGE;
}

export class ObservableArray<T> extends observable.Observable implements observableArrayDef.ObservableArray<T> { // implements Array<T> {

    //[n: number]: T;

    private _array: Array<any>;
    private _addArgs: observableArrayDef.ChangedData<T>;
    private _deleteArgs: observableArrayDef.ChangedData<T>;

    constructor() {
        super();

        if (arguments.length === 1 && Array.isArray(arguments[0])) {
            this._array = arguments[0].slice();
        }
        else {
            this._array = Array.apply(null, arguments);
        }

        this._addArgs = {
            eventName: CHANGE, object: this,
            action: ChangeType.Add,
            index: null,
            removed: new Array(),
            addedCount: 1
        };

        this._deleteArgs = {
            eventName: CHANGE, object: this,
            action: ChangeType.Delete,
            index: null,
            removed: null,
            addedCount: 0
        };
    }

    getItem(index: number): T {
        return this._array[index];
    }
    setItem(index: number, value: T) {
        this._array[index] = value;

        this.notify(<observableArrayDef.ChangedData<T>>{
            eventName: CHANGE, object: this,
            action: ChangeType.Update,
            index: index,
            removed: new Array(1),
            addedCount: 1
        });
    }

    /**
     * Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.
     */
    get length(): number {
        return this._array.length;
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
    concat(): T[] {
        this._addArgs.index = this._array.length;

        var result = this._array.concat.apply(this._array, arguments);

        this._addArgs.addedCount = result.length - this._array.length;

        this.notify(this._addArgs);

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

        var result = this._array.pop();

        this._deleteArgs.removed = [result];

        this.notify(this._deleteArgs);

        return result;
    }

    /**
     * Appends new elements to an array, and returns the new length of the array.
     * @param item New element of the Array.
     */
    push(): number {
        this._addArgs.index = this._array.length;

        if (arguments.length === 1 && Array.isArray(arguments[0])) {

            var source = <Array<T>>arguments[0];

            for (var i = 0, l = source.length; i < l; i++) {
                this._array.push(source[i]);
            }
        }
        else {
            this._array.push.apply(this._array, arguments);
        }

        this._addArgs.addedCount = this._array.length - this._addArgs.index;

        this.notify(this._addArgs);

        return this._array.length;
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
        var result = this._array.shift();

        this._deleteArgs.index = 0;
        this._deleteArgs.removed = [result];

        this.notify(this._deleteArgs);

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
    splice(start: number, deleteCount?: number): T[] {
        var length = this._array.length;
        var result = this._array.splice.apply(this._array, arguments);

        this.notify(<observableArrayDef.ChangedData<T>>{
            eventName: CHANGE, object: this,
            action: ChangeType.Splice,
            index: start,
            removed: result,
            addedCount: this._array.length > length ? this._array.length - length : 0
        });

        return result;
    }

    /**
     * Inserts new elements at the start of an array.
     * @param items  Elements to insert at the start of the Array.
     */
    unshift(): number {
        var length = this._array.length;
        var result = this._array.unshift.apply(this._array, arguments);

        this._addArgs.index = 0;
        this._addArgs.addedCount = result - length;

        this.notify(this._addArgs);

        return result;
    }

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(searchElement: T, fromIndex?: number): number {
        var index = fromIndex ? fromIndex : 0;
        for (var i = index, l = this._array.length; i < l; i++) {
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
        var index = fromIndex ? fromIndex : this._array.length - 1;

        for (var i = index; i >= 0; i--) {
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
        return this._array.reduce(callbackfn, initialValue);
    }

    /** 
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. 
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T {
        return this._array.reduceRight(callbackfn, initialValue);
    }
}