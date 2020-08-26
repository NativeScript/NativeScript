import { Page, GridLayout, ListView, Observable, ObservableArray, EventData } from '@nativescript/core';

var arr = new ObservableArray();
for (var i = 0; i < 100; i++) {
	arr.push('item ' + i);
}

export function createPage() {
	var page: Page = new Page();
	var grid: GridLayout = new GridLayout();
	var listView: ListView = new ListView();
	listView.on(ListView.loadedEvent, function (args: EventData) {
		(<any>args.object).items = arr;
	});
	grid.addChild(listView);
	page.content = grid;

	return page;
}
