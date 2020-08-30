import { Page, Observable, EventData } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new ListPickerView();
}

export class ListPickerView extends Observable {
	private _showListPicker: string = 'collapsed';
	private _isVisisble: boolean;

	constructor() {
		super();
		this._isVisisble = false;
	}

	get options(): Array<String> {
		return ['options1', 'options2', 'options3', 'options1', 'options2', 'options3'];
	}

	get showListPicker(): string {
		return this._showListPicker;
	}

	set showListPicker(value: string) {
		if (this._showListPicker !== value) {
			this._showListPicker = value;
			this.notifyPropertyChange('showListPicker', value);
		}
	}

	public onTap() {
		this._isVisisble ? (this.showListPicker = 'collapsed') : (this.showListPicker = 'visible');
		this._isVisisble = !this._isVisisble;
	}
}
