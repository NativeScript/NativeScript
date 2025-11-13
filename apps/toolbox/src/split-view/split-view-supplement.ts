import { Observable, EventData, Page, SplitView } from '@nativescript/core';
import { SplitViewBrief, setItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewSupplementaryModel();
}

export class SplitViewSupplementaryModel extends Observable {
	selectedBrief: SplitViewBrief | null = null;
	constructor() {
		super();
		setItemCallbacks([this.changeItem.bind(this)]);
	}
	toggle() {
		SplitView.getInstance()?.showPrimary();
	}

	changeItem(item: SplitViewBrief) {
		this.selectedBrief = item;
		this.notifyPropertyChange('selectedBrief', item);
	}
}
