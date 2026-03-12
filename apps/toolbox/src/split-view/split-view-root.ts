import { Observable, EventData, Page } from '@nativescript/core';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewModel();
}

export class SplitViewModel extends Observable {}

let itemCallbacks: Array<(item: any) => void> = [];
export function setItemCallbacks(changeItem: Array<(item: any) => void>) {
	itemCallbacks.push(...changeItem);
}
export function getItemCallbacks() {
	return itemCallbacks;
}
