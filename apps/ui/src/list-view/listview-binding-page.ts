import { Page, GridLayout, ListView, Observable, ObservableArray, EventData } from '@nativescript/core';

const arr = new ObservableArray();
for (let i = 0; i < 100; i++) {
	arr.push('item ' + i);
}

export function createPage() {
	const page: Page = new Page();
	const grid: GridLayout = new GridLayout();
	const listView: ListView = new ListView();
	listView.on(ListView.loadedEvent, function (args: EventData) {
		(<any>args.object).items = arr;
	});
	grid.addChild(listView);
	page.content = grid;

	return page;
}
