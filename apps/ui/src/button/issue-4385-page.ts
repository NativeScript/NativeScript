import { EventData, Page, Observable, Frame } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new TestPage();
}

export function onNavBtnTap(args) {
	Frame.topmost().goBack();
}

export class TestPage extends Observable {
	constructor() {
		super();
	}

	// new line of span can be set with \n from code behind
	get test(): string {
		return '\ntest';
	}
}
