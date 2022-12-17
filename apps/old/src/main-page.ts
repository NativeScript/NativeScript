import { EventData, Page } from '@nativescript/core';
import { MainViewModel } from './main-view-model';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new MainViewModel();
}
