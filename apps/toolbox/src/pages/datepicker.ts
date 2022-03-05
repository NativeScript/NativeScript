import { Page, ImageSource, Observable, EventData, knownFolders, path, Switch, DatePicker } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	displayDate = {
		day: new Date().getDate(),
		month: new Date().getMonth(),
		year: new Date().getFullYear(),
		hour: new Date().getHours(),
		minute: new Date().getMinutes(),
		second: new Date().getSeconds(),
	};
	showTime = true;

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
