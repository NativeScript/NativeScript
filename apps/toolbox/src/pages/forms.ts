import { Page, Observable, EventData } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	textChange(args) {
		console.log('textChange:', args.object.text);
	}
}
