import { EventData, Frame, Observable, Page, View } from '@nativescript/core';
import { deviceSummary, readWindowInsets } from './shared';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	const model = new Observable();
	model.set('device', deviceSummary());
	model.set('windowInsets', 'reading...');
	model.set('open', (tap: EventData) => {
		Frame.topmost().navigate({ moduleName: `pages/${(tap.object as View).id}` });
	});
	page.bindingContext = model;

	setTimeout(() => model.set('windowInsets', readWindowInsets(page)), 120);
}
