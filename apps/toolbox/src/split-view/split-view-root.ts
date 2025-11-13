import { Observable, EventData, Page } from '@nativescript/core';

export interface SplitViewBrief {
	id: string;
	title: string;
	category: string;
	status: string;
	summary: string;
	owner: string;
	updated: string;
	accent: string;
	tagline: string;
	notes: string;
	actions: string[];
	highlights: Array<{ label: string; value: string }>;
	metrics: Array<{ label: string; value: string }>;
	contributors: string[];
	tags: string[];
}

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewModel();
}

export class SplitViewModel extends Observable {}

type SelectionCallback = (item: SplitViewBrief) => void;

let itemCallbacks: SelectionCallback[] = [];
let hasSelection = false;
let latestSelection: SplitViewBrief;

export function setItemCallbacks(changeItem: SelectionCallback[]) {
	changeItem.forEach((callback) => {
		itemCallbacks.push(callback);
		if (hasSelection) {
			callback(latestSelection);
		}
	});
}

export function broadcastSelection(item: SplitViewBrief) {
	latestSelection = item;
	hasSelection = true;
	itemCallbacks.forEach((callback) => callback(item));
}
