/**
 * Contains the VirtualArray class, which is an advanced array like class that helps loading items on demand.
 */
declare module "data/virtual-array" {
    import observable = require("data/observable");
    import observableArray = require("data/observable-array");

    /**
     * Known event names.
     */
    module knownEvents {
        export var itemsLoading: string;
        export var change: string;
    }

    /**
     * Provides event args for "changed" event.
     */
    export interface ChangedData<T> extends observableArray.ChangedData<T> {
        //
    }

    /**
     * Change types (Add, Delete, Update, Splice).
     */
    export class ChangeType extends observableArray.ChangeType {
        //
    }

    /**
     * Advanced array like class that helps loading items on demand.
     */
    export class VirtualArray<T> extends observable.Observable {
        constructor(arrayLength?: number);

        /**
         * Gets or sets length for the virtual array.
         */
        length: number;

        /**
         * Gets or sets load size for the virtual array.
         */
        loadSize: number;

        /**
         * Returns item at specified index.
         */
        getItem(index: number): T;

        /**
         * Sets item at specified index.
         */
        setItem(index: number, value: T): void;

        /**
         * Loads items from an array starting at index.
         */
        load(index: number, items: T[]): void;

        on(event: string, callback: (data: observable.EventData) => void);

        /**
         * Raised when still not loaded items are requested.
         */
        on(event: "itemsLoading", callback: (args: ItemsLoading) => void);

        /**
         * Raised when a change occurs.
         */
        on(event: "change", callback: (args: ChangedData<T>) => void);
    }

    /**
     * Event args for "itemsLoading" event.
     */
    export interface ItemsLoading extends observable.EventData {
        /**
         * Start index.
         */
        index: number;

        /**
         * Number of items to load.
         */
        count: number;
    }
}