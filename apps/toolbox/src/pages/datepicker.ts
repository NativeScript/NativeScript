import { Page, ImageSource, Observable, EventData, knownFolders, path, Switch, DatePicker } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	minDate = new Date();
	maxDate = new Date(2030, 7, 1);
	hour = 8;
	minute = 0;
	displayDate = {
		day: new Date().getDate(),
		month: new Date().getMonth(),
		year: new Date().getFullYear(),
		hour: new Date().getHours(),
		minute: new Date().getMinutes(),
		second: new Date().getSeconds(),
	};
	showTime = true;

	constructor() {
		super();
		// setTimeout(() => {
		// 	// test dynamic min and max date changes
		// 	this.notifyPropertyChange('minDate', null);
		// 	this.notifyPropertyChange('maxDate', null);
		// }, 2000);
	}

	dateChange(args) {
		console.log('dateChange:', (<DatePicker>args.object).date);
	}

	checkedChange(args) {
		const checked = (args.object as Switch).checked;
		this.showTime = checked;
		console.log('this.showTime:', this.showTime);
		this.notifyPropertyChange('showTime', this.showTime);
	}
}
