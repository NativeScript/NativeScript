import { Observable, EventData } from '../observable';
import { ChangedData, ChangeType } from '../observable-array';

/**
 * Event args for "itemsLoading" event.
 */
export interface ItemsLoading extends EventData {
	/**
	 * Start index.
	 */
	index: number;

	/**
	 * Number of items to load.
	 */
	count: number;
}

/**
 * Advanced array like class that helps loading items on demand.
 */
export class VirtualArray<T> extends Observable {
	/**
	 * String value used when hooking to change event.
	 */
	public static changeEvent = ChangeType.Change;
	/**
	 * String value used when hooking to itemsLoading event.
	 */
	public static itemsLoadingEvent = 'itemsLoading';

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

	/**
	 * Gets or sets length for the virtual array.
	 */
	get length(): number {
		return this._length;
	}
	set length(value: number) {
		if (this._length !== value) {
			const index = this._length;
			const count = value - this._length;

			this._length = value;

			this.notify({
				eventName: ChangeType.Change,
				object: this,
				action: count > 0 ? ChangeType.Add : ChangeType.Delete,
				index: index,
				removed: new Array(count < 0 ? Math.abs(count) : 0),
				addedCount: count > 0 ? count : 0,
			});
		}
	}

	/**
	 * Gets or sets load size for the virtual array.
	 */
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

	/**
	 * Loads items from an array starting at index.
	 */
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
			eventName: ChangeType.Change,
			object: this,
			action: ChangeType.Update,
			index: index,
			removed: new Array(items.length),
			addedCount: items.length,
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
						eventName: VirtualArray.itemsLoadingEvent,
						object: this,
						index: start,
						count: count,
					});
				}

				start = -1;
				count = 0;
			}
		}

		if (start >= 0 && count > 0) {
			this.notify({
				eventName: VirtualArray.itemsLoadingEvent,
				object: this,
				index: start,
				count: count,
			});
		}
	}
}
export interface VirtualArray<T> {
	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
	/**
	 * Raised when still not loaded items are requested.
	 */
	on(event: 'itemsLoading', callback: (args: ItemsLoading) => void, thisArg?: any): void;
	/**
	 * Raised when a change occurs.
	 */
	on(event: 'change', callback: (args: ChangedData<T>) => void, thisArg?: any): void;
}
