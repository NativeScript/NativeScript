import { Observable, EventData, Page, ActionItem } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new ActionItemsModel();
}

export class ActionItemsModel extends Observable {
	lastTapped = 'Tap an action item';

	onItemTap(args: EventData) {
		this.set('lastTapped', `Tapped: ${(<ActionItem>args.object).text}`);
	}
}
