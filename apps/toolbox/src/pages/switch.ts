import { Observable, EventData, Page } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SwitchModel();
}

export class SwitchModel extends Observable {
	constructor() {
		super();
	}
}
