import { EventData, Page, TextBase, Label } from '@nativescript/core';

export function foxTap(args: EventData) {
	let page = <Page>(<any>args.object).page;
	let foxTapped = page.getViewById<Label>('foxTapped');
	foxTapped.visibility = 'visible';

	setTimeout(() => {
		foxTapped.visibility = 'hidden';
	}, 1000);

	console.log('foxTap');
}

export function dogTap(args: EventData) {
	let page = <Page>(<any>args.object).page;
	let dogTapped = page.getViewById<Label>('dogTapped');
	dogTapped.visibility = 'visible';

	setTimeout(() => {
		dogTapped.visibility = 'hidden';
	}, 1000);

	console.log('dogTap');
}
