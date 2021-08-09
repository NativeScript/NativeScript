import * as observable from '@nativescript/core/data/observable';
import * as action from '@nativescript/core/ui/action-bar';

import * as pages from '@nativescript/core/ui/page';

var currentPage: pages.Page;
// Event handler for Page "loaded" event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
	// Get the event sender
	var page = <pages.Page>args.object;
	currentPage = page;
	var textItem = new action.ActionItem();
	textItem.text = 'from loaded';
	textItem.on('tap', () => {
		console.log('item added in page.loaded tapped!!!');
	});
	page.actionBar.actionItems.addItem(textItem);
}

export function optionTap(args) {
	console.log('item added form XML tapped!!!');
}
var i = 0;
export function buttonTap(args: observable.EventData) {
	currentPage.actionBar.title = 'hi ' + i++;

	if (currentPage.actionBar.android) {
		if (i % 3 === 0) {
			currentPage.actionBar.android.icon = 'res://ic_test';
		} else if (i % 3 === 1) {
			currentPage.actionBar.android.icon = '~/assets/test-icon.png';
		} else if (i % 3 === 2) {
			currentPage.actionBar.android.icon = undefined;
		}
	}
}
