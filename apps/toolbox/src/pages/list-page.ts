import { EventData, Page } from '@nativescript/core';
import { ListPageModel } from './list-page-model';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new ListPageModel();
}
