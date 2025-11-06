import { EventData, Page } from '@nativescript/core';
import { ListPageModelSticky } from './list-page-model-sticky';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new ListPageModelSticky();
}
