import { Observable } from '@nativescript/core/data/observable';

export class TestExample extends Observable {
	private _name: string;
	private _path: string;

	constructor(name: string, path: string) {
		super();
		this._name = name;
		this._path = path;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		if (this._name !== value) {
			this._name = value;
		}
	}

	get path(): string {
		return this._path;
	}

	set path(value: string) {
		if (this._path !== value) {
			this._path = value;
		}
	}
}
