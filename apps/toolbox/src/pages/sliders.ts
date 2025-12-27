import { Observable, EventData, Page } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SlidersModel();
}

export class SlidersModel extends Observable {
	constructor() {
		super();
	}
}
