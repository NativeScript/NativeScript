import { Observable } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';

export class MultiTemplatesViewModel extends Observable {
	private _items: ObservableArray<number>;

	get items(): ObservableArray<number> {
		this._items = new ObservableArray<number>();
		for (let i = 0; i < 20; i++) {
			this._items.push(i);
		}

		return this._items;
	}
}
