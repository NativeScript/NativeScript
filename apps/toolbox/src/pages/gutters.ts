import { fromObject, EventData, Page } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = fromObject({
		rowGap: 16,
		columnGap: 16,
		gap: 16,
	});
}
