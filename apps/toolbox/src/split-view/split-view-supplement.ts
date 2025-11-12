import { Observable, EventData, Page, SplitView } from '@nativescript/core';
import { setItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewSupplementaryModel();
}

export class SplitViewSupplementaryModel extends Observable {
	selectedItem = `Supplementary - Select an item.`;
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
