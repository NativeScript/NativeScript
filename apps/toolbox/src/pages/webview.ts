import { Observable, EventData, Page, CoreTypes } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new WebviewModel();
}

export class WebviewModel extends Observable {}
