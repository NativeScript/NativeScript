import { Observable, ShownModallyData, LoadEventData, Page, ShowModalOptions } from '@nativescript/core';

let page: Page;
let closeCallback: Function;
export function onShownModally(args: ShownModallyData) {
	closeCallback = args.closeCallback;

	if (args.context) {
		args.context.shownModally = true;
	}
}

export function onLoaded(args: LoadEventData) {
	page = args.object as Page;
	page.bindingContext = new StatusBarModalPage();
}

export class StatusBarModalPage extends Observable {
	close() {
		closeCallback();
	}
}
