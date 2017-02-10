import { Observable } from "data/observable";
import * as virtualArrayDef from "data/virtual-array";

const CHANGE = "change";
const UPDATE = "update";
const DELETE = "delete";
const ADD = "add";

export class ChangeType implements virtualArrayDef.ChangeType {
    static Add = ADD;
    static Delete = DELETE;
    static Update = UPDATE;
    static Splice = CHANGE;
}

export class VirtualArray<T> extends Observable implements virtualArrayDef.VirtualArray<T> {
    public static changeEvent = CHANGE;
    public static itemsLoadingEvent = "itemsLoading";

    private _requestedIndexes: Array<number>;
    private _loadedIndexes: Array<number>;
    private _length: number;
    private _cache: {};

    constructor(length = 0) {
        super();

        this._length = length;
        this._cache = {};

        this._requestedIndexes = [];
        this._loadedIndexes = [];
    }

    get length(): number {
        return this._length;
    }
    set length(value: number) {
        if (this._length !== value) {

            const index = this._length;
            const count = value - this._length;

            this._length = value;

            this.notify({
                eventName: CHANGE, object: this,
                action: count > 0 ? ADD : DELETE,
                index: index,
                removed: new Array(count < 0 ? Math.abs(count) : 0),
                addedCount: count > 0 ? count : 0
            });
        }
    }

    private _loadSize: number;
    get loadSize(): number {
        return this._loadSize;
    }
    set loadSize(value: number) {
        this._loadSize = value;
    }

    getItem(index: number): T {
        const item = this._cache[index];

        if (item === undefined) {
            if (index >= 0 && index < this.length && this._requestedIndexes.indexOf(index) < 0 && this._loadedIndexes.indexOf(index) < 0) {
                this.requestItems(index);
            }
        }

        return item;
    }

    setItem(index: number, value: T) {
        if (this._cache[index] !== value) {
            this.load(index, [value]);
        }
    }

    load(index: number, items: T[]): void {
        for (let i = 0; i < items.length; i++) {

            const itemIndex = index + i;

            this._cache[itemIndex] = items[i];

            this._requestedIndexes.splice(this._requestedIndexes.indexOf(itemIndex), 1);

            if (this._loadedIndexes.indexOf(itemIndex) < 0) {
                this._loadedIndexes.push(itemIndex);
            }
        }

        // Remove requested but never loaded indexes.
        if (this._requestedIndexes.length > 0) {
            for (let i = 0; i < this.loadSize - items.length; i++) {
                this._requestedIndexes.splice(this._requestedIndexes.indexOf(index + i), 1);
            }
        }

        this.notify({
            eventName: CHANGE, object: this,
            action: UPDATE,
            index: index,
            removed: new Array(items.length),
            addedCount: items.length
        });
    }

    private requestItems(index: number): void {
        const indexesToLoad = [];

        const pageIndex = this._loadSize > 0 ? this._loadSize * Math.floor(index / this._loadSize) : index;
        let count = 0;
        let start = -1;

        for (let i = 0; i < this.loadSize; i++) {
            const itemIndex = pageIndex + i;

            if (itemIndex >= this._length) {
                break;
            }

            if (this._loadedIndexes.indexOf(itemIndex) < 0) {
                if (start < 0) {
                    start = itemIndex;
                }

                indexesToLoad.push(itemIndex);

                if (this._requestedIndexes.indexOf(itemIndex) < 0) {
                    this._requestedIndexes.push(itemIndex);
                }

                count++;
            } else {
                if (count > 0) {
                    this.notify({
                        eventName: VirtualArray.itemsLoadingEvent, object: this,
                        index: start,
                        count: count
                    });
                }

                start = -1;
                count = 0;
            }
        }

        if (start >= 0 && count > 0) {
            this.notify({
                eventName: VirtualArray.itemsLoadingEvent, object: this,
                index: start,
                count: count
            });
        }
    }
}