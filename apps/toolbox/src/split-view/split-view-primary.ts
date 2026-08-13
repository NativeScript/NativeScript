import { Observable, EventData, Page, SplitView, ItemEventData } from '@nativescript/core';
import { getItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	const model = new SplitViewPrimaryModel();
	page.bindingContext = model;
	try { console.log('[Primary] navigatingTo, items.length=', model.items?.length); } catch (_e) {}
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
