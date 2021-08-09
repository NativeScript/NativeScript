import { Observable } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';

export class Item extends Observable {
	private _name: string;
	private _id: number;
	private _age: number;

	constructor(name: string, id: number, age: number) {
		super();
		this._name = name;
		this._id = id;
		this._age = age;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		if (this._name !== value) {
			this._name = value;
			this.notifyPropertyChange('name', value);
		}
	}

	get id(): number {
		return this._id;
	}

	set id(value: number) {
		if (this._id !== value) {
			this._id = value;
			this.notifyPropertyChange('id', value);
		}
	}

	get age(): number {
		return this._age;
	}

	set age(value: number) {
		if (this._age !== value) {
			this._age = value;
			this.notifyPropertyChange('age', value);
		}
	}

	public toString() {
		return `${this.name} ${this.id}`;
	}
}

export class ViewModel extends Observable {
	private _items: ObservableArray<Item>;

	get items(): ObservableArray<Item> {
		this._items = new ObservableArray<Item>();
		for (let i = 0; i < 100; i++) {
			this._items.push(new Item(`Item`, i, 0));
		}

		return this._items;
	}
}
