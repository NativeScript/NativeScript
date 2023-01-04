import { Page, Observable, EventData } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	textInput = '';
	textChange(args) {
		console.log(args.object.text);
		this.notifyPropertyChange('textInput', args.object.text);
	}
}
