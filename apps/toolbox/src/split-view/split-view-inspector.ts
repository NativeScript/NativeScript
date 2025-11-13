import { Observable, EventData, Page } from '@nativescript/core';
import { SplitViewBrief, setItemCallbacks } from './split-view-root';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewInspectorModel();
}

export class SplitViewInspectorModel extends Observable {
	selectedBrief: SplitViewBrief | null = null;

	constructor() {
		super();
		setItemCallbacks([this.syncBrief.bind(this)]);
	}

	syncBrief(brief: SplitViewBrief) {
		this.selectedBrief = brief;
		this.notifyPropertyChange('selectedBrief', brief);
	}
}
