import * as observableModule from '@nativescript/core/data/observable';
import * as pageModule from '@nativescript/core/ui/page';

class MainViewModel extends observableModule.Observable {
	private _item: any;

	constructor() {
		super();

		this.item = { Title: 'Alabala' };
	}

	get item(): any {
		return this._item;
	}

	set item(value: any) {
		if (this._item !== value) {
			this._item = value;
			this.notifyPropertyChanged('item', value);
		}
	}

	notifyPropertyChanged(propertyName: string, value: any) {
		this.notify({ object: this, eventName: observableModule.Observable.propertyChangeEvent, propertyName: propertyName, value: value });
	}
}

var viewModel = new MainViewModel();

export function pageLoaded(args: observableModule.EventData) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = viewModel;
}
