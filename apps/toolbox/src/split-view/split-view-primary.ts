import { Observable, EventData, Page, SplitView, ItemEventData } from '@nativescript/core';
import { getItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewPrimaryModel();
}

export class SplitViewPrimaryModel extends Observable {
	items: string[] = [];

	constructor() {
		super();
		this.items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
	}

	onItemTap(args: ItemEventData) {
		console.log('args.index', args.index);
		SplitView.getInstance()?.showSecondary();
		getItemCallbacks().forEach((callback) => callback(this.items[args.index]));
	}
}
