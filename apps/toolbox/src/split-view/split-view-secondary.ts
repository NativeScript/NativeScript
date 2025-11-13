import { Observable, EventData, Page, SplitView } from '@nativescript/core';
import { SplitViewBrief, setItemCallbacks } from './split-view-root';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewSecondaryModel();
}

export class SplitViewSecondaryModel extends Observable {
	selectedBrief: SplitViewBrief | null = null;
	showInspectorButton = false;

	constructor() {
		super();
		setItemCallbacks([this.changeItem.bind(this)]);
		SplitView.getInstance().on('inspectorChange', (args: any) => {
			console.log('inspectorChange', args.data?.showing);
			this.showInspectorButton = !args.data?.showing;
			this.notifyPropertyChange('showInspectorButton', this.showInspectorButton);
		});
	}
	toggle() {
		SplitView.getInstance()?.showPrimary();
	}

	toggleInspector() {
		SplitView.getInstance()?.showInspector();
	}

	changeItem(item: SplitViewBrief) {
		this.selectedBrief = item;
		this.notifyPropertyChange('selectedBrief', item);
	}
}
