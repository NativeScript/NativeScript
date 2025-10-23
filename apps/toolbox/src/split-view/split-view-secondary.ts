import { Observable, EventData, Page, SplitView } from '@nativescript/core';
import { setItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewSecondaryModel();
}

export class SplitViewSecondaryModel extends Observable {
	selectedItem = `Select an item from Primary.`;
	constructor() {
		super();
		setItemCallbacks([this.changeItem.bind(this)]);
	}
	toggle() {
		SplitView.getInstance()?.showPrimary();
	}

	changeItem(item: any) {
		this.selectedItem = item;
		this.notifyPropertyChange('selectedItem', item);
	}
}
