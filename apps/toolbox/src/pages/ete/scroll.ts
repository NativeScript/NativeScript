import { EventData, ListView, Observable, Page, Utils } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	const items = Array.from({ length: 40 }, (_unused, index) => ({
		index,
		label: index === 39 ? 'last row - scroll to it and check it clears the navigation bar' : `row ${index}`,
		color: index % 2 ? '#1e40af' : '#1d4ed8',
	}));

	const model = new Observable();
	model.set('items', items);
	page.bindingContext = model;

	// The page overflows the bottom, so the list is the one that has to keep its last
	// row clear of the navigation bar.
	page.on(Page.navigatedToEvent, () => {
		const list = page.getViewById<ListView>('list');
		const native = page.android as android.view.View;
		const insets = androidx.core.view.ViewCompat.getRootWindowInsets(native);
		const bottom = insets ? insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars()).bottom : 0;
		list.android.setClipToPadding(false);
		list.android.setPadding(0, 0, 0, bottom);
		Utils.android.dismissSoftInput();
	});
}
