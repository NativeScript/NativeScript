import { Observable } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';
import { SearchBar } from '@nativescript/core/ui/search-bar';

export class Issue5039ViewModel extends Observable {
	private _items = ['apple', 'apple cider', 'apple pie', 'orange', 'orange juice', 'strawberry', 'blueberry'];
	public items = new ObservableArray();

	constructor(private _searchBar: SearchBar) {
		super();
		this.items.push(this._items);
	}

	onSubmit() {
		this.filter(this._searchBar.text);
	}

	clearSearch() {
		this.filter();
	}

	filter(value: string = '') {
		const filteredItems = this._items.filter((item) => -1 !== item.indexOf(value));
		this.items.splice(0, this.items.length); // remove all items
		this.items.push(...filteredItems);
	}
}
